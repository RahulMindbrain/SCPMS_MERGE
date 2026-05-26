import { Role } from "@prisma/client";

import { z } from "zod";
import { universitySchema } from "./university.validator";
import { createStudentSchema } from "./sudent.validator";

const baseSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2).optional(),
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number, and special character (@$!%*?& only)",
    ),
  role: z.nativeEnum(Role),
});

const companySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const registerSchema = z.discriminatedUnion("role", [
  z.object({
    ...baseSchema.shape,
    role: z.literal(Role.ADMIN),
    university: universitySchema,
  }),

  z.object({
    ...baseSchema.shape,
    role: z.literal(Role.COMPANY),
    company: companySchema,
  }),

  z.object({
    ...baseSchema.shape,

    role: z.literal(Role.STUDENT),

    student: createStudentSchema,
  }),
]);

export const adminSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number, and special character (@$!%*?& only)",
    ),
  university: universitySchema,
});

export const superadminSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number, and special character (@$!%*?& only)",
    ),
});

export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number, and special character (@$!%*?& only)",
    ),
});

export const updateUserSchema = z
  .object({
    firstname: z
      .string({ message: "Firstname is required" })
      .min(2, "Firstname must be at least 2 characters")
      .optional(),

    lastname: z
      .string({ message: "Lastname is required" })
      .min(2, "Lastname must be at least 2 characters")
      .optional(),
  })
  .strict();
