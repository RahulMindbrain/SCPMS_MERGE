import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import {
  createDepartmentService,
  getDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
} from "../services/department.service";

export const createDepartmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { name } = req.body;

    if (!name) {
      return sendError(res, 400, "Department name is required");
    }

    const dept = await createDepartmentService(name);

    return sendSuccess(res, 201, "Department created", dept);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getDepartmentsController = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;

    const result = await getDepartmentsService(
      Number(page) || 1,
      limit ? Number(limit) : undefined,
    );

    return sendSuccess(res, 200, "Departments fetched", result);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};

export const getDepartmentByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    const dept = await getDepartmentByIdService(id);

    return sendSuccess(res, 200, "Department fetched", dept);
  } catch (error: any) {
    return sendError(res, 404, error.message);
  }
};

export const updateDepartmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    const dept = await updateDepartmentService(id, name);

    return sendSuccess(res, 200, "Department updated", dept);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const deleteDepartmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    await deleteDepartmentService(id);

    return sendSuccess(res, 200, "Department deleted");
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};
