import jwt, { Secret } from "jsonwebtoken";
import type { StringValue } from "ms";

import { UserRole } from "@repo/types";

export const generateAccessToken = (id: number, role: UserRole) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const ACCESS_TTL = process.env.JWT_ACCESS_TTL;

  if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  if (!ACCESS_TTL) throw new Error("JWT_ACCESS_TTL is not defined");

  return jwt.sign({ id, role }, JWT_SECRET as Secret, {
    expiresIn: ACCESS_TTL as StringValue | number,
  });
};

export const generateRefreshToken = (id: number, role: UserRole) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const REFRESH_TTL = process.env.JWT_REFRESH_TTL;

  if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  if (!REFRESH_TTL) throw new Error("JWT_REFRESH_TTL is not defined");

  return jwt.sign({ id, role }, JWT_SECRET as Secret, {
    expiresIn: REFRESH_TTL as StringValue | number,
  });
};
