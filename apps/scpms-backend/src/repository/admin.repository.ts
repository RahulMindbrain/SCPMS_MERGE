import { JobStatus, Prisma, Role, Status } from "@prisma/client";
import prisma from "../config/db";

export const getAdminCount = async () => {
  return prisma.admin.count();
};

export const createAdminWithUniversity = async (
  tx: any,
  userData: {
    firstname: string;
    lastname?: string;
    email: string;
    password: string;
  },
  universityData: {
    name: string;
    code?: string;
    city?: string;
    state?: string;
    country?: string;
  },
) => {
  const user = await tx.user.create({
    data: {
      ...userData,
      role: Role.ADMIN,
      status: Status.INACTIVE,
    },
    select: {
      id: true,
      firstname: true,
      email: true,
      role: true,
      status: true,
    },
  });

  const university = await tx.university.create({
    data: {
      ...universityData,
      status: Status.INACTIVE,
    },
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      state: true,
      country: true,
      status: true,
    },
  });

  const admin = await tx.admin.create({
    data: {
      userId: user.id,
      universityId: university.id,
    },
    select: {
      id: true,
      userId: true,
      universityId: true,
    },
  });

  return {
    user,
    university,
    admin,
  };
};

export const getAdminByUserId = async (userId: number) => {
  return prisma.admin.findUnique({
    where: { userId },
    select: { id: true, universityId: true },
  });
};

export const getAdminsByIds = async (ids: number[]) => {
  return prisma.user.findMany({
    where: {
      id: { in: ids },
      role: "ADMIN",
    },
    select: {
      id: true,
      firstname: true,
      email: true,
      status: true,
    },
  });
};

export const updateUsersStatus = async (
  userIds: number[],
  status: "ACTIVE" | "INACTIVE",
  role?: "STUDENT" | "COMPANY",
) => {
  return prisma.user.updateMany({
    where: {
      id: { in: userIds },
      ...(role && { role }),
    },
    data: { status },
  });
};

export const getPendingUsers = async () => {
  return prisma.user.findMany({
    where: { status: "INACTIVE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstname: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

// export const getPendingJobs = async () => {
//   return prisma.job.findMany({
//     where: { status: "PENDING" },
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       title: true,
//       createdAt: true,

//       company: {
//         select: {
//           name: true,
//         },
//       },
//     },
//   });
// };

export const getUsers = async (params: {
  page?: number;
  limit?: number;
  role?: "STUDENT" | "COMPANY" | "ADMIN";
  status?: "ACTIVE" | "INACTIVE";
}) => {
  const { page, limit, role, status } = params;

  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.max(1, limit ?? 1);
  const skip = (safePage - 1) * safeLimit;

  const where = {
    ...(role && { role }),
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: safeLimit ? Math.ceil(total / safeLimit) : 0,
    },
  };
};

export const getJobs = async (params: {
  page: number;
  limit: number;
  status?: JobStatus;
  companyId?: number;
}) => {
  const { page, limit, status, companyId } = params;

  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(companyId && { companyId }),
  };

  const [data, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        eligibleDepartments: true,
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getStudents = async (params: {
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "INACTIVE";
  passingYear?: number;
  year?: number;
  minCgpa?: number;
  maxCgpa?: number;
  departmentId?: number;
}) => {
  const { page, limit, status } = params;

  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.max(1, limit ?? 1);
  const skip = (safePage - 1) * safeLimit;

  const where: any = {
    role: Role.STUDENT,

    ...(status && { status }),

    student: {
      ...(params.year !== undefined && { year: params.year }),
      ...(params.passingYear !== undefined && {
        passingYear: params.passingYear,
      }),

      ...(params.minCgpa !== undefined || params.maxCgpa !== undefined
        ? {
            cgpa: {
              ...(params.minCgpa !== undefined && { gte: params.minCgpa }),
              ...(params.maxCgpa !== undefined && { lte: params.maxCgpa }),
            },
          }
        : {}),

      ...(params.departmentId !== undefined && {
        departmentId: params.departmentId,
      }),
    },
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstname: true,
        email: true,
        status: true,
        student: {
          select: {
            id: true,
            cgpa: true,
            year: true,
            passingYear: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: safeLimit ? Math.ceil(total / safeLimit) : 0,
    },
  };
};

export const getCompanies = async (params: {
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "INACTIVE";
}) => {
  const { page, limit, status } = params;

  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.max(1, limit ?? 1);
  const skip = (safePage - 1) * safeLimit;

  const where = {
    role: Role.COMPANY,
    ...(status && { status }),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstname: true,
        email: true,
        status: true,
        company: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: safeLimit ? Math.ceil(total / safeLimit) : 0,
    },
  };
};

export const getActiveStudentsByYear = async (params: {
  page: number;
  limit: number;
  year?: number;
  passingYear?: number;
}) => {
  const { page, limit, year, passingYear } = params;

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const where: Prisma.StudentWhereInput = {
    ...(year !== undefined && { year }),
    ...(passingYear !== undefined && { passingYear }),

    user: {
      status: "ACTIVE",
    },
  };

  const [data, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },

      select: {
        id: true,
        cgpa: true,
        year: true,
        passingYear: true,

        user: {
          select: {
            id: true,
            firstname: true,
            email: true,
            status: true,
          },
        },

        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.student.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: safeLimit ? Math.ceil(total / safeLimit) : 0,
    },
  };
};

export const getUsersByRoleAndStatus = async ({
  role,
  status,
  page,
  limit,
}: {
  role: "STUDENT" | "COMPANY";
  status: "ACTIVE" | "INACTIVE";
  page: number;
  limit: number;
}) => {
  return prisma.user.findMany({
    where: {
      role,
      status,
    },
  });
};

export const activateUsers = async (userIds: number[]) => {
  return prisma.user.updateMany({
    where: {
      id: {
        in: userIds,
      },
      role: "STUDENT",
      status: "INACTIVE",
    },
    data: {
      status: "ACTIVE",
    },
  });
};
