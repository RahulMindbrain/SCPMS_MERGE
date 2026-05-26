import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { sendError } from "../utils/response";
import prisma from "../config/db";
import { Role, Status } from "@prisma/client";

interface JwtUserPayload extends JwtPayload {
  id: number;
  role: Role;
}

export interface AuthUser {
  id: number;
  role: Role;
  status: Status;
}

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // console.log("hi");
  const token = req.cookies?.userAccessToken as string | undefined;
  // console.log("Cookies received:", req.cookies);

  if (!token) {
    sendError(res, 401, "Authentication cookie missing");
    return;
  }

  try {
    const secret = process.env.JWT_SECRET as Secret;

    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || !("id" in decoded)) {
      sendError(res, 401, "Invalid token payload");
      return;
    }

    const payload = decoded as JwtUserPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      sendError(res, 401, "User not found");
      return;
    }

    // if (user.status !== "ACTIVE") {
    //   sendError(res, 403, "Account not approved");
    //   return;
    // }

    res.locals.user = user;

    next();
  } catch (error: any) {
    console.log("JWT ERROR:", error);
    sendError(res, 401, "Session expired or invalid token");
    return;
  }
};
export default authenticateUser;
