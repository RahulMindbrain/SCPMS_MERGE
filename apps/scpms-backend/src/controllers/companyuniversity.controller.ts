import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import {
  requestUniversityService,
  getCompanyRequestsService,
  reapplyUniversityService,
} from "../services/company.university.service";
import { getCompanyByUserId } from "../repository/company.repository";

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

    const { universityId } = req.body;

    if (!universityId) {
      return sendError(res, 400, "UniversityId required");
    }

    const universityIds = Array.isArray(universityId)
      ? universityId.map(Number)
      : [Number(universityId)];

    const data = await requestUniversityService(company.id, universityIds);

    return sendSuccess(res, 201, "Request sent", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};

export const getCompanyRequestsController = async (
  _req: Request,
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

    const data = await getCompanyRequestsService(company.id);

    return sendSuccess(res, 200, "Requests fetched", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};

export const reapplyUniversityController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    if (!user?.id) {
      return sendError(res, 403, "Unauthorized");
    }

    const company = await getCompanyByUserId(user.id);

    if (!company) {
      return sendError(res, 400, "Company not found");
    }

    const { universityIds } = req.body;

    if (!Array.isArray(universityIds) || !universityIds.length) {
      return sendError(res, 400, "Invalid universityIds");
    }

    const data = await reapplyUniversityService(company.id, universityIds);

    return sendSuccess(res, 200, "Reapplied successfully", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};
