import {
  createSkill,
  deleteSkill,
  getAllSkills,
  getSkillById,
  getSkillByName,
  updateSkill,
} from "../repository/skills.repository";
import { normalizeSkillName } from "../utils/normalize.utils";

export const createSkillService = async (name: string) => {
  name = normalizeSkillName(name);
  const existing = await getSkillByName(name);

  if (existing) {
    throw new Error("Skill already exists");
  }

  return createSkill(name);
};

export const getAllSkillsService = async () => {
  return getAllSkills();
};

export const getSkillByIdService = async (id: number) => {
  const skill = await getSkillById(id);

  if (!skill) {
    throw new Error("Skill not found");
  }

  return skill;
};

export const updateSkillService = async (id: number, name: string) => {
  name = normalizeSkillName(name);
  const skill = await getSkillById(id);

  if (!skill) {
    throw new Error("Skill not found");
  }

  const existing = await getSkillByName(name);

  if (existing && existing.id !== id) {
    throw new Error("Skill with this name already exists");
  }

  return updateSkill(id, name);
};

export const deleteSkillService = async (id: number) => {
  const skill = await getSkillById(id);

  if (!skill) {
    throw new Error("Skill not found");
  }

  return deleteSkill(id);
};
