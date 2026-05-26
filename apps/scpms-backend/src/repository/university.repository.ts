import prisma from "../config/db";

export const getUniversitiesByIds = async (ids: number[]) => {
  return prisma.university.findMany({
    where: {
      id: { in: ids },
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });
};

export const getUniversityByAdminId = async (adminId: number) => {
  return prisma.admin.findUnique({
    where: {
      userId: adminId,
    },

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
  });
};

export const getActiveUniversitiesByIds = async (ids: number[]) => {
  return prisma.university.findMany({
    where: {
      id: { in: ids },
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });
};

export const getUniversities = async (
  page: number,
  limit: number,
  search?: string,
  status?: string,
) => {
  const skip = (page - 1) * limit;

  const where: any = {
    ...(status && {
      status,
    }),

    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          city: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.university.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        state: true,
        country: true,
      },
    }),

    prisma.university.count({
      where,
    }),
  ]);

  return {
    data,

    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};
