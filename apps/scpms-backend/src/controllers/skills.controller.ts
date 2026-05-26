import { Request, Response } from "express";
import {
  createSkillService,
  deleteSkillService,
  getAllSkillsService,
  getSkillByIdService,
  updateSkillService,
} from "../services/skills.service";
import { sendError, sendSuccess } from "../utils/response";

export const createSkillController = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return sendError(res, 400, "Skill name is required");
    }

    const skill = await createSkillService(name);

    return sendSuccess(res, 201, "Skill created successfully", skill);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getAllSkillsController = async (_req: Request, res: Response) => {
  try {
    const skills = await getAllSkillsService();

    return sendSuccess(res, 200, "Skills fetched successfully", skills);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getSkillByIdController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const skill = await getSkillByIdService(id);

    return sendSuccess(res, 200, "Skill fetched successfully", skill);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const updateSkillController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!name) {
      return sendError(res, 400, "Skill name is required");
    }

    const skill = await updateSkillService(id, name);

    return sendSuccess(res, 200, "Skill updated successfully", skill);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const deleteSkillController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await deleteSkillService(id);

    return sendSuccess(res, 200, "Skill deleted successfully", {});
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};
