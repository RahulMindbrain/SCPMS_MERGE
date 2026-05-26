import { Request, Response } from "express";

import { sendBulkMailByCompanyService } from "../services/bulkmail.service";

import { sendSuccess, sendError } from "../utils/response";

export const sendBulkMailController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    if (!user || user.role !== "ADMIN") {
      return sendError(res, 403, "Only admin can send bulk mail");
    }

    const { companyId, jobUniversityIds, subject, message } = req.body;

    if (!companyId || !Number.isFinite(Number(companyId))) {
      return sendError(res, 400, "Valid companyId is required");
    }

    if (!Array.isArray(jobUniversityIds) || !jobUniversityIds.length) {
      return sendError(res, 400, "jobUniversityIds must be a non-empty array");
    }

    const parsedIds = jobUniversityIds.map(Number);

    if (parsedIds.some((id) => !Number.isFinite(id))) {
      return sendError(res, 400, "Invalid jobUniversityIds provided");
    }

    const result = await sendBulkMailByCompanyService({
      companyId: Number(companyId),

      jobUniversityIds: parsedIds,

      subject,

      message,
    });

    return sendSuccess(res, 200, "Bulk mail sent successfully", result);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};
