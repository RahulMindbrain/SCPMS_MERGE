import prisma from "../config/db";

export const createJobUniversity = async (
  jobId: number,
  jobUniversities: any[],
) => {
  await prisma.jobUniversity.createMany({
    data: jobUniversities.map((u) => ({
      jobId,
      universityId: u.universityId,
      salary: u.salary,
      minCgpa: u.minCgpa,
      maxBacklogs: u.maxBacklogs,
      openings: u.openings,
      description: u.description,
    })),

    skipDuplicates: true,
  });

  return prisma.jobUniversity.findMany({
    where: {
      jobId,
      universityId: {
        in: jobUniversities.map((u) => u.universityId),
      },
    },

    include: {
      university: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
        },
      },

      job: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

export const updateJobUniversityStatus = async (
  ids: number[],
  status: "APPROVED" | "REJECTED",
  universityId: number,
  reason?: string,
) => {
  const now = new Date();

  await prisma.jobUniversity.updateMany({
    where: {
      id: { in: ids },
      universityId,
      status: "PENDING",
    },

    data: {
      status,

      ...(status === "APPROVED" && {
        approvedAt: now,
      }),

      ...(status === "REJECTED" && {
        rejectedAt: now,

        rejectionCount: {
          increment: 1,
        },

        ...(reason && {
          rejectionReason: reason,
        }),
      }),
    },
  });

  const data = await prisma.jobUniversity.findMany({
    where: {
      id: { in: ids },
      universityId,
    },

    include: {
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

          company: {
            select: {
              id: true,
              name: true,

              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    count: data.length,
    data,
  };
};

export const updateJobUniversities = async (jobId: number, updates: any[]) => {
  const operations = updates.map((u) =>
    prisma.jobUniversity.update({
      where: {
        jobId_universityId: {
          jobId,
          universityId: u.universityId,
        },
      },
      data: {
        ...(u.salary !== undefined && { salary: u.salary }),
        ...(u.minCgpa !== undefined && { minCgpa: u.minCgpa }),
        ...(u.maxBacklogs !== undefined && { maxBacklogs: u.maxBacklogs }),
        ...(u.openings !== undefined && { openings: u.openings }),
        ...(u.description !== undefined && { description: u.description }),
      },
    }),
  );

  return prisma.$transaction(operations);
};

export const getJobUniversities = async (params: {
  page: number;
  limit: number;
  universityId?: number;
  companyId?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  departmentId?: number;
  minCgpa?: number;
}) => {
  const {
    page,
    limit,
    universityId,
    companyId,
    status,
    departmentId,
    minCgpa,
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {
    ...(universityId && {
      universityId,
    }),

    ...(status && {
      status,
    }),

    ...(minCgpa !== undefined && {
      minCgpa: {
        lte: minCgpa,
      },
    }),

    job: {
      isDeleted: false,

      ...(companyId && {
        companyId,
      }),

      ...(departmentId && {
        eligibleDepartments: {
          some: {
            id: departmentId,
          },
        },
      }),
    },
  };

  const [data, total] = await Promise.all([
    prisma.jobUniversity.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        sentAt: "desc",
      },

      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            companyId: true,
            eligibleDepartments: {
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
          },
        },

        university: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.jobUniversity.count({
      where,
    }),
  ]);

  return {
    data,

    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const reapplyJobUniversity = async (
  jobId: number,
  universityId: number,
  data: {
    salary?: number;
    minCgpa?: number;
    maxBacklogs?: number;
    openings?: number;
    description?: string;
  },
) => {
  return prisma.jobUniversity.updateMany({
    where: {
      jobId,
      universityId,
      status: "REJECTED",
    },
    data: {
      status: "PENDING",
      sentAt: new Date(),
      rejectionReason: null,

      ...(data.salary !== undefined && { salary: data.salary }),
      ...(data.minCgpa !== undefined && { minCgpa: data.minCgpa }),
      ...(data.maxBacklogs !== undefined && {
        maxBacklogs: data.maxBacklogs,
      }),
      ...(data.openings !== undefined && { openings: data.openings }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
    },
  });
};

export const getJobUniversityByPair = async (
  jobId: number,
  universityId: number,
) => {
  return prisma.jobUniversity.findUnique({
    where: {
      jobId_universityId: {
        jobId,
        universityId,
      },
    },
    select: {
      id: true,
      jobId: true,
      universityId: true,
      status: true,
      rejectionReason: true,
      rejectionCount: true,
      sentAt: true,
      approvedAt: true,
      rejectedAt: true,
    },
  });
};

export const getJobUniversitiesByJobAndUniversityIds = async (
  jobId: number,
  universityIds: number[],
) => {
  if (!universityIds.length) return [];

  return prisma.jobUniversity.findMany({
    where: {
      jobId,
      universityId: {
        in: universityIds,
      },
    },
    select: {
      universityId: true,
      status: true,
    },
  });
};

export const getJobUniversityById = async (id: number) => {
  return prisma.jobUniversity.findUnique({
    where: { id },

    include: {
      university: true,

      job: {
        include: {
          company: {
            include: {
              user: true,
            },
          },

          eligibleDepartments: true,

          skills: true,
        },
      },
    },
  });
};

export const getApplicationByStudentAndJobUniversity = async (
  studentId: number,
  jobUniversityId: number,
) => {
  return prisma.application.findFirst({
    where: {
      studentId,
      jobUniversityId,
    },
  });
};

export const getJobUniversityDisplayDetails = async (id: number) => {
  return prisma.jobUniversity.findUnique({
    where: {
      id,
    },

    include: {
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

          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};
