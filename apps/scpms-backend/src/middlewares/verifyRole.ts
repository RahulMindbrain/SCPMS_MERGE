import { Request, Response, NextFunction } from "express";
import { AuthUser } from "./authenticateUser";
import { sendError } from "../utils/response";

export const authorizeRoles = (...roles: string[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as AuthUser;

    if (!user) {
      return sendError(res, 401, "Unauthorized access");
    }

    if (!roles.includes(user.role)) {
      return sendError(res, 403, "Access denied");
    }

    next();
  };
};
