import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

const requireActiveUser = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = res.locals.user;

  if (!user) {
    return sendError(res, 401, "Unauthorized");
  }

  if (user.status !== "ACTIVE") {
    return sendError(res, 403, "Account not approved");
  }

  next();
};

export default requireActiveUser;
