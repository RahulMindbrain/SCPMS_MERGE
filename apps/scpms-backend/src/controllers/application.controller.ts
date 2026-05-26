import { Request, Response } from "express";

import {
  createApplicationService,
  deleteApplicationService,
  getApplicationsService,
  getScheduleApplicationsService,
  updateApplicationService,
} from "../services/application.service";

import { sendError, sendSuccess } from "../utils/response";

export const createApplicationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const { jobUniversityId, skipOptimization, optimizeResume } = req.body;
    console.log("req.body", req.body);

    if (!user?.id) {
      return sendError(res, 401, "Unauthorized");
    }

    const parsedJobUniversityId = Number(jobUniversityId);

    if (
      !Number.isInteger(parsedJobUniversityId) ||
      parsedJobUniversityId <= 0
    ) {
      return sendError(res, 400, "Invalid jobUniversityId");
    }

    const data = await createApplicationService(
      user.id,
      parsedJobUniversityId,
      skipOptimization,
      optimizeResume,
    );

    return sendSuccess(res, 201, "Applied successfully", data);
  } catch (error: any) {
    console.error("Create Application Error:", error);

    return sendError(res, 400, error.message || "Failed to create application");
  }
};

export const getApplicationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    if (!user?.id) {
      return sendError(res, 401, "Unauthorized");
    }

    const filters = {
      applicationId: req.query.applicationId
        ? Number(req.query.applicationId)
        : undefined,

      jobUniversityId: req.query.jobUniversityId
        ? Number(req.query.jobUniversityId)
        : undefined,

      companyId: req.query.companyId ? Number(req.query.companyId) : undefined,

      studentId: req.query.studentId ? Number(req.query.studentId) : undefined,

      status: req.query.status as any,

      currentRound: req.query.currentRound as any,
    };

    const page = req.query.page ? Number(req.query.page) : 1;

    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const data = await getApplicationsService(user, filters, page, limit);

    return sendSuccess(res, 200, "Applications fetched", data);
  } catch (error: any) {
    console.error("Get Applications Error:", error);

    return sendError(res, 500, error.message || "Failed to fetch applications");
  }
};

export const updateApplicationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    if (!user?.id) {
      return sendError(res, 401, "Unauthorized");
    }

    const applicationId = Number(req.params.id);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return sendError(res, 400, "Invalid application id");
    }

    const { status, currentRound, reason, remarks } = req.body;

    if (user.role === "STUDENT") {
      const allowedStudentStatuses = ["OFFER_ACCEPTED", "OFFER_REJECTED"];

      if (!allowedStudentStatuses.includes(status)) {
        return sendError(res, 403, "Students can only accept or reject offers");
      }

      if (currentRound) {
        return sendError(res, 403, "Students cannot update interview rounds");
      }
    }

    if (user.role === "COMPANY") {
      const allowedCompanyStatuses = ["SHORTLISTED", "REJECTED", "SELECTED"];

      if (!allowedCompanyStatuses.includes(status)) {
        return sendError(res, 403, "Companies cannot manage offer actions");
      }
    }

    const data = await updateApplicationService({
      applicationId,
      status,
      currentRound,
      reason,
      remarks,
      updatedBy: user.id,
    });

    return sendSuccess(res, 200, "Application updated successfully", data);
  } catch (error: any) {
    console.error("Update Application Error:", error);

    return sendError(res, 400, error.message || "Failed to update application");
  }
};

export const deleteApplicationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const applicationId = Number(req.params.id);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return sendError(res, 400, "Invalid application id");
    }

    await deleteApplicationService(applicationId);

    return sendSuccess(res, 200, "Application deleted successfully");
  } catch (error: any) {
    console.error("Delete Application Error:", error);

    return sendError(res, 400, error.message || "Failed to delete application");
  }
};

export const getScheduleApplicationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const scheduleId = Number(req.params.id);

    if (!Number.isInteger(scheduleId) || scheduleId <= 0) {
      return sendError(res, 400, "Invalid schedule id");
    }

    const page = req.query.page ? Number(req.query.page) : 1;

    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const data = await getScheduleApplicationsService(scheduleId, page, limit);

    return sendSuccess(res, 200, "Applications fetched", data);
  } catch (error: any) {
    console.error("Schedule Applications Error:", error);

    return sendError(
      res,
      400,
      error.message || "Failed to fetch schedule applications",
    );
  }
};
