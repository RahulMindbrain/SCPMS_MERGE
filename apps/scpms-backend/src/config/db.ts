import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "./db.URL";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },

  log:
    process.env.NODE_ENV === "development"
      ? [
          {
            emit: "event",
            level: "query",
          },
        ]
      : [],
});

export default prisma;
