import { Role, Status } from "@prisma/client";
import prisma from "../config/db";
import { TokenExpiredError } from "jsonwebtoken";

export const createUser = async (data: {
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
  role: Role;
}) => {
  let status: Status = Status.INACTIVE;

  if (data.role === Role.SUPER_ADMIN) {
    status = Status.ACTIVE;
  }

  return prisma.user.create({
    data: {
      firstname: data.firstname,
      lastname: data.lastname ?? null,
      email: data.email,
      password: data.password,
      role: data.role,
      status,
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      status: true,
    },
  });
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      role: true,
      status: true,
    },
  });
};

export const checkUserProfile = async (userId: number, role: string) => {
  if (role === "STUDENT") {
    return prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,

        cgpa: true,
        year: true,
        passingYear: true,

        resumeUrl: true,
        activeBacklogs: true,

        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,

        isPlaced: true,
        placedAt: true,

        createdAt: true,

        university: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            state: true,
            country: true,
            status: true,
          },
        },

        department: {
          select: {
            id: true,
            name: true,
          },
        },

        skills: {
          select: {
            id: true,
            name: true,
          },
        },

        experiences: {
          select: {
            id: true,
            companyName: true,
            role: true,
            description: true,
            startDate: true,
            endDate: true,
          },
        },

        certificates: {
          select: {
            id: true,
            title: true,
            issuer: true,
            certificateUrl: true,
            issuedDate: true,
          },
        },

        projects: {
          select: {
            id: true,
            title: true,
            description: true,
            techStack: true,
            githubUrl: true,
            liveUrl: true,
          },
        },
      },
    });
  }

  if (role === "COMPANY") {
    return prisma.company.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,

        name: true,
        description: true,

        createdAt: true,

        universities: {
          select: {
            id: true,
            status: true,
            approvedAt: true,
            rejectedAt: true,
            reason: true,

            university: {
              select: {
                id: true,
                name: true,
                code: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },
      },
    });
  }

  if (role === "ADMIN") {
    return prisma.admin.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,

        university: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            state: true,
            country: true,
            status: true,
          },
        },
      },
    });
  }

  return null;
};

export const updateSocketId = async (
  userId: number,
  socketId: string | null,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { socketId },
  });
};

export const findActiveToken = async (userId: number, refreshToken: string) => {
  return prisma.token.findFirst({
    where: {
      userId,
      refreshToken: refreshToken,
      status: "ACTIVE",
    },
  });
};

export const updateUser = async (
  userId: number,
  data: Partial<{
    firstname: string;
    lastname?: string;
  }>,
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      role: true,
      status: true,
    },
  });
};

export const getUsersByIds = async (userIds: number[]) => {
  return prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });
};
