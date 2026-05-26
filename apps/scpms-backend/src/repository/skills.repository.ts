import prisma from "../config/db";

export const createSkill = async (name: string) => {
  return prisma.skill.create({
    data: { name },
  });
};

export const getAllSkills = async () => {
  return prisma.skill.findMany({
    orderBy: { name: "asc" },
  });
};

export const getSkillById = async (id: number) => {
  return prisma.skill.findUnique({
    where: { id },
  });
};

export const getSkillByName = async (name: string) => {
  return prisma.skill.findUnique({
    where: { name },
  });
};

export const updateSkill = async (id: number, name: string) => {
  return prisma.skill.update({
    where: { id },
    data: { name },
  });
};

export const deleteSkill = async (id: number) => {
  return prisma.skill.delete({
    where: { id },
  });
};
