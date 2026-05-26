import { PrismaClient } from "@prisma/client";
import { Role, Status } from "@prisma/client/wasm";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "superadmin@scpms.com";

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) return;

  const password = await bcrypt.hash("Password@2026", 10);

  await prisma.user.create({
    data: {
      firstname: "Super",
      lastname: "Admin",
      email,
      password,
      role: Role.SUPER_ADMIN,
      status: Status.ACTIVE,
    },
  });

  console.log("🎉SUPER_ADMIN created");
}

main().finally(() => prisma.$disconnect());
