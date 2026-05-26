import { Request, Response, NextFunction } from "express";
import { sendError, sendSuccess } from "../utils/response";
import { Role } from "@prisma/client";
import {
  createUserService,
  getUserService,
  updateUserService,
} from "../services/user.service";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password, role } = req.body;

    if (!firstname || !lastname || !email || !password || !role) {
      return sendError(res, 400, "All base fields are required");
    }

    if (![Role.STUDENT, Role.COMPANY, Role.ADMIN].includes(role)) {
      return sendError(res, 400, "Invalid role");
    }

    const user = await createUserService(req.body);

    return sendSuccess(res, 201, "User registered successfully", user);
  } catch (error: any) {
    console.error(error);

    return sendError(res, 500, error.message || "Something went wrong");
  }
};

export const getUserController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const data = await getUserService(user.id);

    return sendSuccess(res, 200, "User fetched successfully", data);
  } catch (error: any) {
    return sendError(res, 404, error.message);
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    // console.log(user);

    const updated = await updateUserService(user.id, req.body);

    return sendSuccess(res, 200, "User updated successfully", updated);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};
