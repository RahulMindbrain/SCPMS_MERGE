import prisma from "../config/db";
import { Prisma } from "@prisma/client";

// export const createStudent = async (
//   userId: number,
//   departmentId: number,
//   year: number,
//   passingYear: number,
//   cgpa?: number,
// ) => {
//   return prisma.student.create({
//     data: {
//       userId,
//       departmentId,
//       year,
//       passingYear,
//       ...(cgpa !== undefined && { cgpa }),
//     },
//   });
// };

export const createStudent = async (userId: number, data: any) => {
  return prisma.student.create({
    data: {
      userId,
      universityId: data.universityId,
      departmentId: data.departmentId,
      year: data.year,
      passingYear: data.passingYear,

      ...(data.cgpa !== undefined && { cgpa: data.cgpa }),
      ...(data.activeBacklogs !== undefined && {
        activeBacklogs: data.activeBacklogs,
      }),
      ...(data.resumeUrl && { resumeUrl: data.resumeUrl }),

      ...(data.linkedinUrl && { linkedinUrl: data.linkedinUrl }),
      ...(data.githubUrl && { githubUrl: data.githubUrl }),
      ...(data.portfolioUrl && { portfolioUrl: data.portfolioUrl }),

      ...(data.skillIds?.length && {
        skills: {
          connect: data.skillIds.map((id: number) => ({ id })),
        },
      }),

      ...(data.experiences?.length && {
        experiences: {
          create: data.experiences.map((exp: any) => ({
            ...exp,
            startDate: new Date(exp.startDate),
            ...(exp.endDate && { endDate: new Date(exp.endDate) }),
          })),
        },
      }),

      ...(data.certificates?.length && {
        certificates: {
          create: data.certificates.map((cert: any) => ({
            ...cert,
            ...(cert.issuedDate && {
              issuedDate: new Date(cert.issuedDate),
            }),
          })),
        },
      }),

      ...(data.projects?.length && {
        projects: {
          create: data.projects,
        },
      }),
    },
    include: {
      skills: true,
      experiences: true,
      certificates: true,
      projects: true,
    },
  });
};

export const getStudentByUserId = async (userId: number) => {
  return prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      cgpa: true,
      year: true,
      passingYear: true,
      resumeUrl: true,
      projects: true,
      isPlaced: true,
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      },
      university: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },

      skills: {
        select: {
          id: true,
          name: true,
        },
      },

      experiences: {
        select: {
          id: true,
          companyName: true,
          role: true,
          description: true,
          startDate: true,
          endDate: true,
        },
        orderBy: {
          startDate: "desc",
        },
      },

      certificates: {
        select: {
          id: true,
          title: true,
          issuer: true,
          certificateUrl: true,
          issuedDate: true,
        },
        orderBy: {
          issuedDate: "desc",
        },
      },
    },
  });
};

export const updateStudent = async (userId: number, data: any) => {
  const {
    addSkillIds,
    removeSkillIds,

    addExperiences,
    updateExperiences,
    deleteExperienceIds,

    addProjects,
    updateProjects,
    deleteProjectIds,

    addCertificates,
    updateCertificates,
    deleteCertificateIds,

    ...rest
  } = data;

  const experienceOps: any = {};

  if (addExperiences?.length) {
    experienceOps.create = addExperiences.map((exp: any) => ({
      ...exp,
      startDate: new Date(exp.startDate),
      ...(exp.endDate && { endDate: new Date(exp.endDate) }),
    }));
  }

  if (updateExperiences?.length) {
    experienceOps.update = updateExperiences.map((exp: any) => ({
      where: { id: exp.id },
      data: {
        companyName: exp.companyName,
        role: exp.role,
        description: exp.description,
        startDate: new Date(exp.startDate),
        ...(exp.endDate && { endDate: new Date(exp.endDate) }),
      },
    }));
  }

  if (deleteExperienceIds?.length) {
    experienceOps.deleteMany = {
      id: { in: deleteExperienceIds },
    };
  }

  const projectOps: any = {};

  if (addProjects?.length) {
    projectOps.create = addProjects;
  }

  if (updateProjects?.length) {
    projectOps.update = updateProjects.map((proj: any) => ({
      where: { id: proj.id },
      data: {
        title: proj.title,
        description: proj.description,
        techStack: proj.techStack,
        githubUrl: proj.githubUrl,
        liveUrl: proj.liveUrl,
      },
    }));
  }

  if (deleteProjectIds?.length) {
    projectOps.deleteMany = {
      id: { in: deleteProjectIds },
    };
  }

  const certificateOps: any = {};

  if (addCertificates?.length) {
    certificateOps.create = addCertificates.map((cert: any) => ({
      ...cert,
      ...(cert.issuedDate && {
        issuedDate: new Date(cert.issuedDate),
      }),
    }));
  }

  if (updateCertificates?.length) {
    certificateOps.update = updateCertificates.map((cert: any) => ({
      where: { id: cert.id },
      data: {
        title: cert.title,
        issuer: cert.issuer,
        certificateUrl: cert.certificateUrl,
        ...(cert.issuedDate && {
          issuedDate: new Date(cert.issuedDate),
        }),
      },
    }));
  }

  if (deleteCertificateIds?.length) {
    certificateOps.deleteMany = {
      id: { in: deleteCertificateIds },
    };
  }

  return prisma.student.update({
    where: { userId },

    data: {
      ...rest,

      ...(addSkillIds && {
        skills: {
          connect: addSkillIds.map((id: number) => ({ id })),
        },
      }),

      ...(removeSkillIds && {
        skills: {
          disconnect: removeSkillIds.map((id: number) => ({ id })),
        },
      }),

      ...(Object.keys(experienceOps).length && {
        experiences: experienceOps,
      }),

      ...(Object.keys(projectOps).length && {
        projects: projectOps,
      }),

      ...(Object.keys(certificateOps).length && {
        certificates: certificateOps,
      }),
    },

    include: {
      skills: true,
      experiences: true,
      projects: true,
      certificates: true,
    },
  });
};

export const getStudentDetails = async (userId: number) => {
  return prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      cgpa: true,
      year: true,
      passingYear: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          status: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
        },
      },

      applications: {
        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,

          status: true,

          currentRound: true,

          reason: true,

          isAccepted: true,

          acceptedAt: true,

          createdAt: true,

          updatedAt: true,

          statusHistory: {
            orderBy: {
              createdAt: "asc",
            },

            select: {
              id: true,

              status: true,

              round: true,

              reason: true,

              remarks: true,

              createdAt: true,
            },
          },

          jobUniversity: {
            select: {
              id: true,

              status: true,

              universityId: true,

              minCgpa: true,

              university: {
                select: {
                  id: true,
                  name: true,
                },
              },

              job: {
                select: {
                  id: true,
                  title: true,
                  location: true,
                  salary: true,

                  company: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getInactiveStudentUsers = async (params: {
  page: number;
  limit: number;
}) => {
  const { page, limit } = params;

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
    status: "INACTIVE",
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },

      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        status: true,
        createdAt: true,

        student: {
          select: {
            id: true,
            year: true,
            passingYear: true,
            cgpa: true,
          },
        },
      },
    }),

    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: safeLimit ? Math.ceil(total / safeLimit) : 0,
    },
  };
};

export const getDeptWiseStats = async (universityId: number) => {
  return prisma.student.findMany({
    where: {
      universityId,
    },

    select: {
      id: true,
      universityId: true,

      department: {
        select: {
          name: true,
        },
      },

      applications: {
        where: {
          status: "OFFER_ACCEPTED",

          jobUniversity: {
            universityId,
          },
        },

        select: {
          status: true,

          jobUniversity: {
            select: {
              universityId: true,
            },
          },
        },
      },
    },
  });
};

export const getTotalPlacedStudentsRepo = async (universityId: number) => {
  const result = await prisma.application.groupBy({
    by: ["studentId"],

    where: {
      status: "OFFER_ACCEPTED",

      jobUniversity: {
        universityId,
      },
    },
  });

  return result.length;
};

export const getSalaryDataRepo = async (universityId: number) => {
  return prisma.application.findMany({
    where: {
      status: "OFFER_ACCEPTED",

      jobUniversity: {
        universityId,
      },
    },

    select: {
      student: {
        select: {
          id: true,
          departmentId: true,
        },
      },

      jobUniversity: {
        select: {
          salary: true,
          universityId: true,
        },
      },
    },
  });
};

// export const getDeptPlacedCountRepo = async () => {
//   return prisma.application.groupBy({
//     by: ["studentId"],
//     where: {
//       status: "SELECTED",
//     },
//   });
// };

// export const getAvgSalaryRepo = async () => {
//   const result = await prisma.application.findMany({
//     where: { status: "SELECTED" },
//     select: {
//       job: {
//         select: {
//           salary: true,
//         },
//       },
//     },
//   });

//   return result;
// };

// export const getDeptSalaryRepo = async () => {
//   return prisma.application.findMany({
//     where: {
//       status: "SELECTED",
//     },
//     select: {
//       job: {
//         select: { salary: true },
//       },
//       student: {
//         select: {
//           departmentId: true,
//         },
//       },
//     },
//   });
// };

// export const getUnplacedStudents = async () => {
//   return prisma.student.findMany({
//     where: {
//       applications: {
//         none: {
//           status: "SELECTED",
//         },
//       },
//     },
//     include: {
//       user: true,
//     },
//   });
// };

export const getEligibleUnplacedStudents = async (jobUniversityId: number) => {
  const jobUniversity = await prisma.jobUniversity.findUnique({
    where: {
      id: jobUniversityId,
    },

    include: {
      university: true,

      job: {
        select: {
          eligibleDepartments: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!jobUniversity) {
    throw new Error("Job university not found");
  }

  if (jobUniversity.status !== "APPROVED") {
    throw new Error("Job not approved");
  }

  const deptIds = jobUniversity.job.eligibleDepartments.map((d) => d.id);

  return prisma.student.findMany({
    where: {
      isPlaced: false,

      universityId: jobUniversity.universityId,

      departmentId: {
        in: deptIds,
      },

      ...(jobUniversity.minCgpa !== null && {
        cgpa: {
          gte: jobUniversity.minCgpa,
        },
      }),

      ...(jobUniversity.maxBacklogs !== null && {
        activeBacklogs: {
          lte: jobUniversity.maxBacklogs,
        },
      }),
    },

    include: {
      user: true,
    },
  });
};

export const markStudentPlaced = async (studentId: number) => {
  return prisma.student.update({
    where: { id: studentId },
    data: {
      isPlaced: true,
      placedAt: new Date(),
    },
  });
};

// export const getEligibleUnplacedStudentsForJobs = async (
//   jobUniversityIds: number[],
// ) => {
//   if (!jobUniversityIds.length) {
//     return [];
//   }

//   const jobUniversities = await prisma.jobUniversity.findMany({
//     where: {
//       id: {
//         in: jobUniversityIds,
//       },

//       status: "APPROVED",
//     },

//     select: {
//       id: true,

//       universityId: true,

//       minCgpa: true,

//       maxBacklogs: true,

//       job: {
//         select: {
//           eligibleDepartments: {
//             select: {
//               id: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!jobUniversities.length) {
//     throw new Error("No approved job universities found");
//   }

//   const eligibleStudentsMap = new Map<number, any>();

//   for (const jobUniversity of jobUniversities) {
//     const departmentIds = jobUniversity.job.eligibleDepartments.map(
//       (d) => d.id,
//     );

//     if (!departmentIds.length) {
//       continue;
//     }

//     const students = await prisma.student.findMany({
//       where: {
//         isPlaced: false,

//         universityId: jobUniversity.universityId,

//         departmentId: {
//           in: departmentIds,
//         },

//         ...(jobUniversity.minCgpa !== null && {
//           cgpa: {
//             gte: jobUniversity.minCgpa,
//           },
//         }),

//         ...(jobUniversity.maxBacklogs !== null && {
//           activeBacklogs: {
//             lte: jobUniversity.maxBacklogs,
//           },
//         }),
//       },

//       select: {
//         id: true,

//         universityId: true,

//         departmentId: true,

//         cgpa: true,

//         activeBacklogs: true,

//         user: {
//           select: {
//             id: true,
//             firstname: true,
//             lastname: true,
//             email: true,
//           },
//         },
//       },
//     });

//     for (const student of students) {
//       eligibleStudentsMap.set(student.id, student);
//     }
//   }

//   return Array.from(eligibleStudentsMap.values());
// };

export const getEligibleUnplacedStudentsForJobs = async (
  jobUniversityIds: number[],
) => {
  if (!jobUniversityIds.length) {
    return [];
  }

  const jobUniversities = await prisma.jobUniversity.findMany({
    where: {
      id: {
        in: jobUniversityIds,
      },

      status: "APPROVED",
    },

    select: {
      id: true,

      universityId: true,

      minCgpa: true,

      maxBacklogs: true,

      job: {
        select: {
          eligibleDepartments: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!jobUniversities.length) {
    throw new Error("No approved job universities found");
  }

  const results = [];

  for (const jobUniversity of jobUniversities) {
    const departmentIds = jobUniversity.job.eligibleDepartments.map(
      (d) => d.id,
    );

    if (!departmentIds.length) {
      continue;
    }

    const students = await prisma.student.findMany({
      where: {
        isPlaced: false,

        universityId: jobUniversity.universityId,

        departmentId: {
          in: departmentIds,
        },

        ...(jobUniversity.minCgpa !== null && {
          cgpa: {
            gte: jobUniversity.minCgpa,
          },
        }),

        ...(jobUniversity.maxBacklogs !== null && {
          activeBacklogs: {
            lte: jobUniversity.maxBacklogs,
          },
        }),
      },

      select: {
        id: true,

        universityId: true,

        departmentId: true,

        cgpa: true,

        activeBacklogs: true,

        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    results.push({
      jobUniversityId: jobUniversity.id,

      universityId: jobUniversity.universityId,

      students,
    });
  }

  return results;
};

export const getAppliedStudentsForJobs = async (jobIds: number[]) => {
  if (!jobIds.length) return [];

  return prisma.application.findMany({
    where: {
      jobUniversity: {
        jobId: { in: jobIds },
      },
    },
    select: {
      student: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
        },
      },
    },
  });
};
