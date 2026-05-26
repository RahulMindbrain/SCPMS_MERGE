import { CompanyApprovalStatus, Prisma } from "@prisma/client";
import prisma from "../config/db";

export const createCompany = async (
  userId: number,
  name: string,
  description?: string,
) => {
  const existing = await prisma.company.findUnique({
    where: { userId },
  });

  if (existing) {
    throw new Error("Company profile already exists");
  }

  return prisma.company.create({
    data: {
      userId,
      name,
      description: description ?? null,
    },
  });
};

export const getCompanyByUserId = async (userId: number) => {
  return prisma.company.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          firstname: true,
          email: true,
          status: true,
        },
      },
    },
  });
};

export const updateCompany = async (
  userId: number,
  data: {
    name?: string;
    description?: string;
  },
) => {
  const existing = await prisma.company.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new Error("Company profile not found");
  }

  return prisma.company.update({
    where: { userId },
    data,
  });
};

export const getCompanyDetails = async (userId: number) => {
  return prisma.company.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          status: true,
        },
      },

      jobs: {
        select: {
          id: true,
          title: true,
          status: true,
          salary: true,
          location: true,
          createdAt: true,

          applications: {
            select: {
              id: true,
              status: true,

              student: {
                select: {
                  id: true,
                  user: {
                    select: {
                      firstname: true,
                      lastname: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getCompanyById = async (id: number) => {
  return prisma.company.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
};

// export const getCompanies = async (params: {
//   page?: number;
//   limit?: number;
//   status?: "ACTIVE" | "INACTIVE";
// }) => {
//   const { page = 1, limit = 10, status } = params;

//   const safePage = Math.max(1, page);
//   const safeLimit = Math.max(1, limit);

//   const skip = (safePage - 1) * safeLimit;

//   const where = {
//     ...(status && {
//       user: {
//         status,
//       },
//     }),
//   };

//   const [companies, total] = await Promise.all([
//     prisma.company.findMany({
//       where,
//       skip,
//       take: safeLimit,
//       orderBy: { createdAt: "desc" },

//       select: {
//         id: true,
//         name: true,
//         description: true,
//         createdAt: true,

//         user: {
//           select: {
//             id: true,
//             email: true,
//             status: true,
//           },
//         },
//       },
//     }),

//     prisma.company.count({ where }),
//   ]);

//   return {
//     data: companies,
//     meta: {
//       total,
//       page: safePage,
//       limit: safeLimit,
//       totalPages: Math.ceil(total / safeLimit),
//     },
//   };
// };

export const getCompanies = async (params: {
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "INACTIVE";
  universityId?: number;
  companyApprovalStatus?: CompanyApprovalStatus;
}) => {
  const {
    page = 1,
    limit = 10,
    status,
    universityId,
    companyApprovalStatus,
  } = params;

  const MAX_LIMIT = 50;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);

  const skip = (safePage - 1) * safeLimit;

  const where = {
    ...(status && {
      user: { status },
    }),

    ...(universityId && {
      universities: {
        some: {
          universityId,
          ...(companyApprovalStatus && {
            status: companyApprovalStatus,
          }),
        },
      },
    }),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },

      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
    }),

    prisma.company.count({ where }),
  ]);

  return {
    data: companies,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const activateCompanies = async (userIds: number[]) => {
  return prisma.user.updateMany({
    where: {
      id: {
        in: userIds,
      },
      role: "COMPANY",
      status: "INACTIVE",
    },
    data: {
      status: "ACTIVE",
    },
  });
};

export const getInactiveCompanies = async (params: {
  page: number;
  limit: number;
}) => {
  const { page, limit } = params;

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const where: Prisma.UserWhereInput = {
    role: "COMPANY",
    status: "INACTIVE",
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
        createdAt: true,

        // company: {
        //   select: {
        //     id: true,
        //     name: true,
        //     description: true,
        //   },
        // },
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
