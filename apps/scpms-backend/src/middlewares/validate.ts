import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
import { sendError } from "../utils/response";

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));

      return sendError(res, 400, "Validation failed", { errors });
    }

    req.body = result.data;
    next();
  };
};
