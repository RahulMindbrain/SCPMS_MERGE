import { z } from "zod";

export const createStudentSchema = z
  .object({
    universityId: z.number().int().positive().optional(),

    departmentId: z.number().int().positive().optional(),

    year: z.number().int().min(1).max(4).optional(),

    passingYear: z.number().int().min(2000).max(2100).optional(),

    cgpa: z.number().min(0).max(10).optional().optional(),

    activeBacklogs: z.number().int().min(0).optional(),

    resumeUrl: z.string().url().optional(),

    skillIds: z.array(z.number().int().positive()).optional(),

    experiences: z
      .array(
        z.object({
          companyName: z.string().min(1),
          role: z.string().min(1),
          description: z.string().optional(),
          startDate: z.string(),
          endDate: z.string().optional(),
        }),
      )
      .optional(),

    certificates: z
      .array(
        z.object({
          title: z.string().min(1),
          issuer: z.string().min(1),
          certificateUrl: z.string().url().optional(),
          issuedDate: z.string().optional(),
        }),
      )
      .optional(),

    linkedinUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    portfolioUrl: z.string().url().optional(),

    projects: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          techStack: z.string().optional(),
          githubUrl: z.string().url().optional(),
          liveUrl: z.string().url().optional(),
        }),
      )
      .optional(),
  })
  .refine((data) => !(data.year === 1 && data.cgpa !== undefined), {
    message: "CGPA is not allowed for 1st year students",
    path: ["cgpa"],
  });

export const updateStudentSchema = z
  .object({
    year: z.number().int().min(1).max(4).optional(),
    passingYear: z.number().int().min(2000).max(2100).optional(),
    cgpa: z.number().min(0).max(10).optional(),
    activeBacklogs: z.number().int().min(0).optional(),

    resumeUrl: z.string().url().optional(),

    linkedinUrl: z.string().url().nullable().optional(),
    githubUrl: z.string().url().nullable().optional(),
    portfolioUrl: z.string().url().nullable().optional(),

    addSkillIds: z.array(z.number().int().positive()).optional(),
    removeSkillIds: z.array(z.number().int().positive()).optional(),

    addExperiences: z
      .array(
        z.object({
          companyName: z.string().min(1),
          role: z.string().min(1),
          description: z.string().optional(),
          startDate: z.string(),
          endDate: z.string().optional(),
        }),
      )
      .optional(),

    updateExperiences: z
      .array(
        z.object({
          id: z.number().int().positive(),
          companyName: z.string().min(1),
          role: z.string().min(1),
          description: z.string().optional(),
          startDate: z.string(),
          endDate: z.string().optional(),
        }),
      )
      .optional(),

    deleteExperienceIds: z.array(z.number().int().positive()).optional(),

    addProjects: z
      .array(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          techStack: z.string().optional(),
          githubUrl: z.string().url().optional(),
          liveUrl: z.string().url().optional(),
        }),
      )
      .optional(),

    updateProjects: z
      .array(
        z.object({
          id: z.number().int().positive(),
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          techStack: z.string().optional(),
          githubUrl: z.string().url().optional(),
          liveUrl: z.string().url().optional(),
        }),
      )
      .optional(),

    deleteProjectIds: z.array(z.number().int().positive()).optional(),

    addCertificates: z
      .array(
        z.object({
          title: z.string().min(1),
          issuer: z.string().min(1),
          certificateUrl: z.string().url().optional(),
          issuedDate: z.string().optional(),
        }),
      )
      .optional(),

    updateCertificates: z
      .array(
        z.object({
          id: z.number().int().positive(),
          title: z.string().min(1).optional(),
          issuer: z.string().min(1).optional(),
          certificateUrl: z.string().url().optional(),
          issuedDate: z.string().optional(),
        }),
      )
      .optional(),

    deleteCertificateIds: z.array(z.number().int().positive()).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.year === 1 && data.cgpa !== undefined) {
      ctx.addIssue({
        path: ["cgpa"],
        message: "CGPA is not allowed for 1st year students",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.year && data.year >= 2 && data.cgpa === undefined) {
      ctx.addIssue({
        path: ["cgpa"],
        message: "CGPA is required for students in 2nd year or above",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
