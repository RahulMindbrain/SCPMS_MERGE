import prisma from "../config/db";

export const createDepartment = async (name: string) => {
  return prisma.department.create({
    data: { name },
  });
};

export const getDepartments = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.department.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.count(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getDepartmentById = async (id: number) => {
  return prisma.department.findUnique({
    where: { id },
  });
};

export const updateDepartment = async (id: number, name: string) => {
  return prisma.department.update({
    where: { id },
    data: { name },
  });
};

export const deleteDepartment = async (id: number) => {
  return prisma.department.delete({
    where: { id },
  });
};

export const getDepartmentsByIds = async (ids: number[]) => {
  return prisma.department.findMany({
    where: {
      id: { in: ids },
    },
    select: { id: true },
  });
};
