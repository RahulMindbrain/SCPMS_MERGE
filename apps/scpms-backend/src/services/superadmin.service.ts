import prisma from "../config/db";
import bcrypt from "bcrypt";
import { Role, Status } from "@prisma/client";

import {
  createUser,
  findUserByEmail,
  getUserById,
  updateUser,
} from "../repository/user.repository";

import {
  getAllUniversities,
  deactivateAdmins,
  getAdminsWithUniversity,
  activateAdminWithUniversity,
  getCompaniesWithUsers,
  activateCompanies,
  createCompanyUniversityRequest,
  getCompanyRequestsForUniversity,
  updateCompanyUniversityStatus,
  countSuperAdmins,
} from "../repository/superadmin.repository";

import { normalizeEmails, normalizeName } from "../utils/normalize.utils";

const validateIds = (ids: number[]) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("IDs are required");
  }

  const invalid = ids.some((id) => !Number.isInteger(id) || id <= 0);

  if (invalid) {
    throw new Error("Invalid IDs supplied");
  }
};

export const createSuperAdminService = async (data: {
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
}) => {
  const superAdminCount = await countSuperAdmins();

  if (superAdminCount >= 1) {
    throw new Error("Super admin already exists");
  }

  const firstname = normalizeName(data.firstname);
  const lastname = data.lastname ? normalizeName(data.lastname) : undefined;

  const email = normalizeEmails(data.email);

  const existing = await findUserByEmail(email);

  if (existing) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return createUser({
    firstname,
    ...(lastname ? { lastname } : {}),
    email,
    password: hashedPassword,
    role: Role.SUPER_ADMIN,
  });
};

export const getSuperAdminByIdService = async (userId: number) => {
  const user = await getUserById(userId);

  if (!user || user.role !== Role.SUPER_ADMIN) {
    throw new Error("Super Admin not found");
  }

  return user;
};

export const getAllSuperAdminsService = async () => {
  return prisma.user.findMany({
    where: { role: Role.SUPER_ADMIN },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateSuperAdminService = async (
  userId: number,
  data: { firstname?: string; lastname?: string },
) => {
  const existing = await getUserById(userId);

  if (!existing || existing.role !== Role.SUPER_ADMIN) {
    throw new Error("Super Admin not found");
  }

  const payload: any = {};

  if (data.firstname) payload.firstname = normalizeName(data.firstname);
  if (data.lastname) payload.lastname = normalizeName(data.lastname);

  return updateUser(userId, payload);
};

export const deleteSuperAdminService = async (userId: number) => {
  const existing = await getUserById(userId);

  if (!existing || existing.role !== Role.SUPER_ADMIN) {
    throw new Error("Super Admin not found");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status: Status.INACTIVE },
  });
};

export const getAdminsService = async (params: { status?: string }) => {
  let status: Status | undefined;

  if (params.status) {
    if (!Object.values(Status).includes(params.status as Status)) {
      throw new Error("Invalid status");
    }
    status = params.status as Status;
  }

  return getAdminsWithUniversity(status !== undefined ? { status } : {});
};

export const activateAdminsService = async (ids: number[]) => {
  validateIds(ids);
  return activateAdminWithUniversity(ids);
};

export const deactivateAdminsService = async (ids: number[]) => {
  validateIds(ids);
  return deactivateAdmins(ids);
};

export const getCompaniesService = async (params: { status?: string }) => {
  let status: Status | undefined;

  if (params.status) {
    if (!Object.values(Status).includes(params.status as Status)) {
      throw new Error("Invalid status");
    }
    status = params.status as Status;
  }

  return getCompaniesWithUsers(status !== undefined ? { status } : {});
};

export const activateCompaniesService = async (ids: number[]) => {
  validateIds(ids);
  return activateCompanies(ids);
};

export const getUniversitiesService = async () => {
  return getAllUniversities();
};

export const createCompanyRequestService = async (
  companyId: number,
  universityId: number,
) => {
  if (!companyId || !universityId) {
    throw new Error("CompanyId and UniversityId required");
  }

  return createCompanyUniversityRequest(companyId, universityId);
};

export const getCompanyRequestsService = async (universityId: number) => {
  if (!universityId) {
    throw new Error("UniversityId required");
  }

  return getCompanyRequestsForUniversity(universityId);
};

export const updateCompanyRequestsSuperAdminService = async (
  ids: number[],
  status: "APPROVED" | "REJECTED",
  adminId: number,
) => {
  validateIds(ids);

  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new Error("Invalid status");
  }

  return updateCompanyUniversityStatus(ids, status, adminId);
};
