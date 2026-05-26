import prisma from "../config/db";
import { Role, Status } from "@prisma/client";

export const getUsersByIds = async (ids: number[]) => {
  return prisma.user.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });
};

export const countSuperAdmins = async () => {
  return prisma.user.count({
    where: {
      role: Role.SUPER_ADMIN,
    },
  });
};

export const getAdminsWithUniversity = async (params?: { status?: Status }) => {
  return prisma.admin.findMany({
    where: {
      user: {
        ...(params?.status && {
          status: params.status,
        }),
      },
    },
    select: {
      id: true,

      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      },

      university: {
        select: {
          id: true,
          name: true,
          code: true,
          city: true,
          state: true,
          country: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
};

export const activateAdminWithUniversity = async (adminUserIds: number[]) => {
  return prisma.$transaction(async (tx) => {
    const admins = await tx.admin.findMany({
      where: {
        userId: { in: adminUserIds },
      },
      select: {
        userId: true,
        universityId: true,
      },
    });

    if (admins.length !== adminUserIds.length) {
      const foundIds = admins.map((a) => a.userId);
      const missing = adminUserIds.filter((id) => !foundIds.includes(id));

      throw new Error(`Admin IDs not found: ${missing.join(", ")}`);
    }

    const universityIds = [...new Set(admins.map((a) => a.universityId))];

    await tx.user.updateMany({
      where: {
        id: { in: adminUserIds },
        role: Role.ADMIN,
      },
      data: {
        status: Status.ACTIVE,
      },
    });

    await tx.university.updateMany({
      where: {
        id: { in: universityIds },
      },
      data: {
        status: Status.ACTIVE,
      },
    });

    const updatedAdmins = await tx.user.findMany({
      where: {
        id: { in: adminUserIds },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        status: true,
        admin: {
          select: {
            id: true,
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
        },
      },
    });

    return updatedAdmins;
  });
};

export const deactivateAdmins = async (adminUserIds: number[]) => {
  return prisma.user.updateMany({
    where: {
      id: { in: adminUserIds },
      role: Role.ADMIN,
    },
    data: {
      status: Status.INACTIVE,
    },
  });
};

export const getCompaniesWithUsers = async (params?: { status?: Status }) => {
  return prisma.company.findMany({
    where: {
      user: {
        ...(params?.status && {
          status: params.status,
        }),
      },
    },
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
          role: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const activateCompanies = async (companyIds: number[]) => {
  return prisma.$transaction(async (tx) => {
    const companies = await tx.company.findMany({
      where: {
        id: { in: companyIds },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (companies.length !== companyIds.length) {
      const foundIds = companies.map((c) => c.id);
      const missing = companyIds.filter((id) => !foundIds.includes(id));

      throw new Error(`Company IDs not found: ${missing.join(", ")}`);
    }

    const userIds = companies.map((c) => c.userId);

    await tx.user.updateMany({
      where: {
        id: { in: userIds },
        role: Role.COMPANY,
      },
      data: {
        status: Status.ACTIVE,
      },
    });

    const updated = await tx.company.findMany({
      where: {
        id: { in: companyIds },
      },
      select: {
        id: true,
        name: true,
        description: true,
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            status: true,
          },
        },
      },
    });

    return updated;
  });
};

export const getAllUniversities = async () => {
  return prisma.university.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      state: true,
      country: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createCompanyUniversityRequest = async (
  companyId: number,
  universityId: number,
) => {
  return prisma.companyUniversity.create({
    data: {
      companyId,
      universityId,
      status: "PENDING",
    },
  });
};

export const getCompanyRequestsForUniversity = async (universityId: number) => {
  return prisma.companyUniversity.findMany({
    where: {
      universityId,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,

      company: {
        select: {
          id: true,
          name: true,
          user: {
            select: {
              id: true,
              firstname: true,
              email: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// export const updateCompanyUniversityStatus = async (
//   ids: number[],
//   status: "APPROVED" | "REJECTED",
//   adminId: number,
//   universityId?: number,
// ) => {
//   const now = new Date();

//   return prisma.companyUniversity.updateMany({
//     where: {
//       id: { in: ids },
//       status: "PENDING",
//       ...(universityId && { universityId }),
//     },
//     data: {
//       status,
//       approvedBy: adminId,
//       ...(status === "APPROVED" && { approvedAt: now }),
//       ...(status === "REJECTED" && { rejectedAt: now }),
//     },
//   });
// };

export const updateCompanyUniversityStatus = async (
  ids: number[],
  status: "APPROVED" | "REJECTED",
  adminId: number,
  universityId?: number,
) => {
  const now = new Date();

  await prisma.companyUniversity.updateMany({
    where: {
      id: { in: ids },
      status: "PENDING",
      ...(universityId && { universityId }),
    },

    data: {
      status,
      approvedBy: adminId,

      ...(status === "APPROVED" && {
        approvedAt: now,
      }),

      ...(status === "REJECTED" && {
        rejectedAt: now,
      }),
    },
  });

  return prisma.companyUniversity.findMany({
    where: {
      id: { in: ids },
    },

    include: {
      company: {
        select: {
          id: true,
          name: true,

          user: {
            select: {
              email: true,
            },
          },
        },
      },

      university: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};
