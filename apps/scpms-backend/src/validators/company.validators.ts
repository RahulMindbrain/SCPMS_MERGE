import { z } from "zod";

export const createCompanySchema = z.object({
  name: z
    .string({ message: "Company name is required" })
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters")
    .trim(),

  description: z.string().max(1000, "Description too long").optional(),
});

export const updateCompanySchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100)
    .trim()
    .optional(),

  description: z.string().max(1000, "Description too long").optional(),
});
