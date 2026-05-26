import { z } from "zod";

export const createJobSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(3, "Title must be at least 3 characters"),

  location: z
    .string({ message: "Location is required" })
    .min(2, "Location must be valid"),

  skillIds: z
    .array(z.number({ message: "Skill ID must be a number" }).int().positive())
    .optional(),
  eligibleDepartmentIds: z
    .array(
      z.number({ message: "Department ID must be a number" }).int().positive(),
    )
    .optional(),
});

export const updateJobSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),

    location: z.string().min(2, "Location must be valid").optional(),

    addSkillIds: z.array(z.number().int().positive()).optional(),

    removeSkillIds: z.array(z.number().int().positive()).optional(),

    addEligibleDepartmentIds: z.array(z.number().int().positive()).optional(),

    removeEligibleDepartmentIds: z
      .array(z.number().int().positive())
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update job",
  });
