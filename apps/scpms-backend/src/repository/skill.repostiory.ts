import prisma from "../config/db";

export const getSkillsByIds = async (ids: number[]) => {
  return prisma.skill.findMany({
    where: {
      id: { in: ids },
    },
    select: { id: true },
  });
};
