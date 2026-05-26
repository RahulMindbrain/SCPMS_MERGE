import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";

export const attachQueryLogger = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  let queryCount = 0;

  const handler = (e: any) => {
    queryCount++;

    console.log("\n🧾 Prisma Query:");
    console.log("Query:", e.query);
    console.log("Params:", e.params);
    console.log("Duration:", e.duration, "ms");
  };

  (prisma as any).$on("query", handler);

  res.on("finish", () => {
    console.log(`🧠 Total DB queries: ${queryCount}`);
  });

  next();
};
