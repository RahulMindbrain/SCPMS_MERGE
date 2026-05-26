import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import { getUniversitiesServicePublic } from "../services/universtity.service";

export const getUniversitiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const parsedQuery: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    } = {
      page: req.query.page ? Number(req.query.page) : 1,

      limit: req.query.limit ? Number(req.query.limit) : 10,
    };

    if (req.query.search) {
      parsedQuery.search = String(req.query.search);
    }

    if (req.query.status) {
      parsedQuery.status = String(req.query.status);
    }

    const data = await getUniversitiesServicePublic(parsedQuery);

    return sendSuccess(res, 200, "Universities fetched successfully", data);
  } catch (error: any) {
    console.error(error);

    return sendError(res, 500, error.message || "Failed to fetch universities");
  }
};
