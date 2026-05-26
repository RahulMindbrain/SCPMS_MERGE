import { Role } from "@prisma/client";
import {
  checkUserProfile,
  createUser,
  findUserByEmail,
  getUserById,
  updateUser,
} from "../repository/user.repository";
import { hashPassword } from "../utils/hashPassword";
import {
  normalizeEmails,
  normalizeName,
  normalizeUniversityName,
} from "../utils/normalize.utils";
import { createAdminWithUniversity } from "../repository/admin.repository";
import prisma from "../config/db";
import { createStudent } from "../repository/student.repository";
import { createCompany } from "../repository/company.repository";

export const createUserService = async (data: any) => {
  let {
    firstname,
    lastname,
    email,
    password,
    role,
    student,
    company,
    university,
  } = data;

  firstname = normalizeName(firstname);
  lastname = normalizeName(lastname);
  email = normalizeEmails(email);

  if (university?.name) {
    university.name = normalizeUniversityName(university.name);
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await hashPassword(password);

  if (role === Role.ADMIN) {
    return prisma.$transaction(async (tx) => {
      return createAdminWithUniversity(
        tx,
        {
          firstname,
          lastname,
          email,
          password: hashedPassword,
        },
        university,
      );
    });
  }

  if (role === Role.STUDENT) {
    if (!student?.universityId || !student?.departmentId) {
      throw new Error("University and department are required");
    }

    const universityExists = await prisma.university.findUnique({
      where: {
        id: student.universityId,
      },
    });

    if (!universityExists) {
      throw new Error("Invalid universityId");
    }

    const departmentExists = await prisma.department.findUnique({
      where: {
        id: student.departmentId,
      },
    });

    if (!departmentExists) {
      throw new Error("Invalid departmentId");
    }

    return prisma.$transaction(async () => {
      const user = await createUser({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        role,
      });

      const studentProfile = await createStudent(user.id, student);

      return {
        user,
        student: studentProfile,
      };
    });
  }

  if (role === Role.COMPANY) {
    if (!company?.name) {
      throw new Error("Company details are required");
    }

    return prisma.$transaction(async () => {
      const user = await createUser({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        role,
      });

      const companyProfile = await createCompany(
        user.id,
        company.name,
        company.description,
      );

      return {
        user,
        company: companyProfile,
      };
    });
  }

  return createUser({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    role,
  });
};

export const getUserService = async (userId: number) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const profile = (await checkUserProfile(user.id, user.role)) || undefined;

  return {
    ...user,
    profile,
  };
};

export const updateUserService = async (
  userId: number,
  data: {
    firstname?: string;
    lastname?: string;
  },
) => {
  if (data.firstname !== undefined) {
    data.firstname = normalizeName(data.firstname);
  }

  if (data.lastname !== undefined) {
    data.lastname = normalizeName(data.lastname);
  }
  const existing = await getUserById(userId);

  if (!existing) {
    throw new Error("User not found");
  }

  return updateUser(userId, data);
};
