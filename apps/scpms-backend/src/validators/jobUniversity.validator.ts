import { z } from "zod";

const jobUniversityItemSchema = z.object({
  universityId: z
    .number({ message: "University ID is required" })
    .int("University ID must be an integer")
    .positive("University ID must be positive"),

  salary: z
    .number({ message: "Salary is required" })
    .positive("Salary must be greater than 0"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description is too long")
    .optional(),

  minCgpa: z
    .number()
    .min(0, "Min CGPA cannot be negative")
    .max(10, "Min CGPA cannot exceed 10")
    .optional(),

  maxBacklogs: z
    .number()
    .int("Max backlogs must be an integer")
    .min(0, "Max backlogs cannot be negative")
    .optional(),

  openings: z
    .number()
    .int("Openings must be an integer")
    .positive("Openings must be greater than 0")
    .optional(),
});

export const createJobUniversitySchema = z.object({
  jobId: z
    .number({ message: "Job ID is required" })
    .int("Job ID must be an integer")
    .positive("Job ID must be positive"),

  jobUniversities: z
    .array(jobUniversityItemSchema)
    .min(1, "At least one university is required"),
});

export const updateJobUniversitySchema = z
  .object({
    salary: z.number().positive("Salary must be greater than 0").optional(),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description is too long")
      .optional(),

    minCgpa: z
      .number()
      .min(0, "Min CGPA cannot be negative")
      .max(10, "Min CGPA cannot exceed 10")
      .optional(),

    maxBacklogs: z
      .number()
      .int("Max backlogs must be an integer")
      .min(0, "Max backlogs cannot be negative")
      .optional(),

    openings: z
      .number()
      .int("Openings must be an integer")
      .positive("Openings must be greater than 0")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update JobUniversity",
  });
