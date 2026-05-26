import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import {
  createCompanyService,
  getCompanyProfileService,
  updateCompanyService,
} from "../services/company.service";
import {
  getCompanyRequestsService,
  requestUniversityService,
} from "../services/company.university.service";
import { getCompanyByUserId } from "../repository/company.repository";

export const createCompanyController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const { name, description } = req.body;

    const company = await createCompanyService(user.id, name, description);

    return sendSuccess(res, 201, "Company profile created", company);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getCompanyProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const company = await getCompanyProfileService(user.id);

    return sendSuccess(res, 200, "Company profile fetched", company);
  } catch (error: any) {
    return sendError(res, 404, error.message);
  }
};

export const updateCompanyController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const updated = await updateCompanyService(user.id, req.body);

    return sendSuccess(res, 200, "Company profile updated", updated);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const requestUniversityController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    if (!user || !user.id) {
      return sendError(res, 403, "Unauthorized");
    }

    const company = await getCompanyByUserId(user.id);

    if (!company) {
      return sendError(res, 400, "Company profile not found");
    }

    const { universityIds } = req.body;

    if (!Array.isArray(universityIds) || universityIds.length === 0) {
      return sendError(res, 400, "universityIds must be non-empty array");
    }

    const data = await requestUniversityService(company.id, universityIds);

    return sendSuccess(res, 201, "Requests sent", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};
export const getCompanyRequestsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const company = await getCompanyByUserId(user.id);

    if (!company) {
      return sendError(res, 400, "Company profile not found");
    }

    const data = await getCompanyRequestsService(company.id);

    return sendSuccess(res, 200, "Requests fetched", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};
