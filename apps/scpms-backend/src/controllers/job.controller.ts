import {
  createJobService,
  deleteJobService,
  getJobsService,
  updateJobService,
} from "../services/job.service";
import { sendError, sendSuccess } from "../utils/response";

import { Request, Response } from "express";
import { createJobSchema } from "../validators/job.validator";
import {
  getCompanyById,
  getCompanyByUserId,
} from "../repository/company.repository";

export const createJobController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const parsedData = createJobSchema.parse(req.body);

    const job = await createJobService(parsedData, user.id);

    return sendSuccess(res, 201, "Job created", job);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return sendError(
        res,
        400,
        error.errors.map((e: any) => e.message).join(", "),
      );
    }

    return sendError(res, 400, error.message);
  }
};

export const getJobsController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { page, limit, status, companyId: queryCompanyId } = req.query || {};
    const bodyCompanyId = req.body?.companyId;

    let companyId: number | undefined;

    if (user.role === "COMPANY") {
      const company = await getCompanyByUserId(user.id);

      if (!company) {
        return sendError(res, 404, "Company not found");
      }

      companyId = company.id;
    } else if (user.role === "ADMIN") {
      const incomingCompanyId = queryCompanyId || bodyCompanyId;

      if (incomingCompanyId) {
        const company = await getCompanyById(Number(incomingCompanyId));

        if (!company) {
          return sendError(res, 404, "Company not found");
        }

        companyId = company.id;
      }
    }

    const parsedPage = page === undefined ? 1 : Number(page);

    if (!Number.isFinite(parsedPage) || parsedPage < 1) {
      return sendError(res, 400, "Invalid page number");
    }

    const parsedLimit = limit === undefined ? undefined : Number(limit);

    if (
      parsedLimit !== undefined &&
      (!Number.isFinite(parsedLimit) || parsedLimit < 1)
    ) {
      return sendError(res, 400, "Invalid limit");
    }

    const params: {
      page?: number;
      limit?: number;
      status?: "PENDING" | "APPROVED" | "REJECTED";
      companyId?: number;
    } = {
      page: parsedPage,
    };

    if (parsedLimit !== undefined) {
      const safeLimit = parsedLimit;
      params.limit = safeLimit;
    }

    if (status) {
      params.status = status as "PENDING" | "APPROVED" | "REJECTED";
    }

    if (companyId !== undefined) {
      params.companyId = companyId;
    }

    const data = await getJobsService(params);

    return sendSuccess(res, 200, "Jobs fetched", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};
export const updateJobController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await updateJobService(Number(id), req.body);
  return sendSuccess(res, 200, "Job updated", data);
};

export const deleteJobController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteJobService(Number(id));
  return sendSuccess(res, 200, "Job deleted");
};
