import z from "zod";

export const universitySchema = z.object({
  name: z
    .string({ message: "University name is required" })
    .min(2, "University name must be at least 2 characters"),

  code: z
    .string()
    .min(2, "University code must be at least 2 characters")
    .max(20, "University code too long")
    .optional(),

  city: z.string().min(2, "City must be at least 2 characters").optional(),

  state: z.string().min(2, "State must be at least 2 characters").optional(),

  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .optional(),
});
