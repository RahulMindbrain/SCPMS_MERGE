// src/controllers/superadmin.controller.ts

import { Request, Response } from "express";
import {
  createSuperAdminService,
  getSuperAdminByIdService,
  getAllSuperAdminsService,
  updateSuperAdminService,
  deleteSuperAdminService,
  getAdminsService,
  activateAdminsService,
  deactivateAdminsService,
  getCompaniesService,
  activateCompaniesService,
  getUniversitiesService,
} from "../services/superadmin.service";

import { sendError, sendSuccess } from "../utils/response";

export const createSuperAdminController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !email || !password) {
      return sendError(res, 400, "Required fields missing");
    }

    const data = await createSuperAdminService({
      firstname,
      lastname,
      email,
      password,
    });

    return sendSuccess(res, 201, "Super Admin created", data);
  } catch (error: any) {
    if (error.message === "Email already exists") {
      return sendError(res, 409, error.message);
    }

    return sendError(res, 500, error.message);
  }
};

export const getSuperAdminByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) return sendError(res, 400, "Invalid ID");

    const data = await getSuperAdminByIdService(id);

    return sendSuccess(res, 200, "Super Admin fetched", data);
  } catch (error: any) {
    if (error.message === "Super Admin not found") {
      return sendError(res, 404, error.message);
    }

    return sendError(res, 500, error.message);
  }
};

export const getAllSuperAdminsController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const data = await getAllSuperAdminsService();

    return sendSuccess(res, 200, "Super Admins fetched", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};

export const updateSuperAdminController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    const { firstname, lastname } = req.body;

    if (!id) return sendError(res, 400, "Invalid ID");
    if (!firstname && !lastname)
      return sendError(res, 400, "Nothing to update");

    const data = await updateSuperAdminService(id, {
      firstname,
      lastname,
    });

    return sendSuccess(res, 200, "Super Admin updated", data);
  } catch (error: any) {
    if (error.message === "Super Admin not found") {
      return sendError(res, 404, error.message);
    }

    return sendError(res, 500, error.message);
  }
};

export const deleteSuperAdminController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    if (!id) return sendError(res, 400, "Invalid ID");

    const data = await deleteSuperAdminService(id);

    return sendSuccess(res, 200, "Super Admin deactivated", data);
  } catch (error: any) {
    if (error.message === "Super Admin not found") {
      return sendError(res, 404, error.message);
    }

    return sendError(res, 500, error.message);
  }
};

export const getAdminsController = async (req: Request, res: Response) => {
  try {
    // console.log("GET ADMINS CONTROLLER HIT");
    const { status } = req.query;

    const data = await getAdminsService(
      status ? { status: status as string } : {},
    );

    return sendSuccess(res, 200, "Admins fetched", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};

export const activateAdminsController = async (req: Request, res: Response) => {
  try {
    console.log("activateAdminsController");
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return sendError(res, 400, "IDs must be array");
    }

    const data = await activateAdminsService(ids);

    return sendSuccess(res, 200, "Admins activated", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};

export const deactivateAdminsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return sendError(res, 400, "IDs must be array");
    }

    const data = await deactivateAdminsService(ids);

    return sendSuccess(res, 200, "Admins deactivated", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};

export const getCompaniesController = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const data = await getCompaniesService(
      status ? { status: status as string } : {},
    );

    return sendSuccess(res, 200, "Companies fetched", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};

export const activateCompaniesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return sendError(res, 400, "IDs must be array");
    }

    const data = await activateCompaniesService(ids);

    return sendSuccess(res, 200, "Companies activated", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};

export const getUniversitiesController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const data = await getUniversitiesService();

    return sendSuccess(res, 200, "Universities fetched", data);
  } catch (error: any) {
    return sendError(res, 500, error.message);
  }
};
