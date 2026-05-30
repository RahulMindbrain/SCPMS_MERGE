import { ApplicationStatus, InterviewRound, Prisma } from "@prisma/client";
import prisma from "../config/db";

export const createApplication = async (
  tx: Prisma.TransactionClient,
  data: any,
) => {
  return tx.application.create({
    data,

    include: {
      student: {
        include: {
          user: true,
        },
      },

      jobUniversity: {
        include: {
          job: {
            include: {
              company: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getApplications = async (
  user: any,
  filters: any,
  page: number,
  limit: number,
) => {
  try {
    let where: any = {};

    if (user.role === "STUDENT") {
      where.studentId = user.studentId;
    } else if (user.role === "COMPANY") {
      where.jobUniversity = {
        job: {
          companyId: user.companyId,
        },
      };
    } else if (user.role === "ADMIN") {
    }
    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters.companyId) {
      where.jobUniversity = {
        ...(where.jobUniversity || {}),

        job: {
          companyId: filters.companyId,
        },
      };
    }

    if (filters.jobId) {
      where.jobUniversity = {
        ...(where.jobUniversity || {}),

        jobId: filters.jobId,
      };
    }

    if (filters.jobUniversityId) {
      where.jobUniversityId = filters.jobUniversityId;
    }

    if (filters.applicationId) {
      where.id = filters.applicationId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const skip = (page - 1) * limit;

    const [applications, totalCount, statusCounts] = await Promise.all([
      prisma.application.findMany({
        where,

        skip,

        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,

          status: true,

          currentRound: true,

          createdAt: true,

          updatedAt: true,

          jobUniversity: {
            select: {
              id: true,

              universityId: true,

              status: true,

              salary: true,

              openings: true,

              minCgpa: true,

              maxBacklogs: true,

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

                  companyId: true,

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

          student: {
            select: {
              id: true,

              cgpa: true,

              activeBacklogs: true,

              isPlaced: true,

              user: {
                select: {
                  firstname: true,
                  lastname: true,
                  email: true,
                },
              },

              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),

      prisma.application.count({
        where,
      }),

      prisma.application.groupBy({
        by: ["status"],

        _count: {
          status: true,
        },

        where,
      }),
    ]);

    return {
      applications,

      statusCounts,

      pagination: {
        totalCount,

        totalPages: Math.ceil(totalCount / limit),

        currentPage: page,

        limit,
      },
    };
  } catch (error) {
    console.error("Repository Error:", error);

    throw error;
  }
};

export const updateApplicationStatus = async (
  tx: Prisma.TransactionClient,

  id: number,

  data: {
    status: ApplicationStatus;

    currentRound?: any;

    reason?: string;
  },
) => {
  return tx.application.update({
    where: { id },

    data: {
      status: data.status,

      ...(data.currentRound && {
        currentRound: data.currentRound,
      }),

      ...(data.reason && {
        reason: data.reason,
      }),
    },

    include: {
      student: {
        include: {
          user: true,
        },
      },

      jobUniversity: {
        include: {
          job: {
            include: {
              company: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const deleteApplication = async (id: number) => {
  return prisma.application.delete({ where: { id } });
};

export const getTotalPlacedStudents = async () => {
  return prisma.application.groupBy({
    by: ["studentId"],

    where: {
      status: "OFFER_ACCEPTED",
    },
  });
};

export const getApplicationById = async (id: number) => {
  return prisma.application.findUnique({
    where: { id },
  });
};

export const acceptApplication = async (id: number) => {
  return prisma.application.update({
    where: { id },

    data: {
      status: "OFFER_ACCEPTED",
      isAccepted: true,
      acceptedAt: new Date(),
    },
  });
};

export const withdrawApplication = async (id: number) => {
  return prisma.application.update({
    where: { id },

    data: {
      status: "OFFER_REJECTED",
      rejectedAt: new Date(),
    },
  });
};

export const getApplicationByIdAndStudent = async (
  applicationId: number,
  studentId: number,
) => {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      studentId: studentId,
    },
  });
};

export const withdrawOtherApplications = async (
  studentId: number,
  acceptedApplicationId: number,
) => {
  return prisma.application.updateMany({
    where: {
      studentId: studentId,

      id: {
        not: acceptedApplicationId,
      },

      status: "SELECTED",
    },

    data: {
      status: "OFFER_REJECTED",
    },
  });
};

export const getApplicationsBySchedule = async (
  scheduleId: number,
  universityId: number,
  page?: number,
  limit?: number,
) => {
  const isPaginated =
    typeof page === "number" &&
    typeof limit === "number" &&
    page > 0 &&
    limit > 0;

  const where = {
    jobUniversity: {
      interviewScheduleId: scheduleId,
      universityId,
    },
  };

  if (!isPaginated) {
    const applications = await prisma.application.findMany({
      where,

      orderBy: {
        createdAt: "asc",
      },

      select: {
        id: true,

        status: true,

        currentRound: true,

        jobUniversity: {
          select: {
            id: true,

            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },

        student: {
          select: {
            id: true,

            department: {
              select: {
                id: true,
                name: true,
              },
            },

            user: {
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return applications.map((app) => ({
      applicationId: app.id,

      status: app.status,

      currentRound: app.currentRound,

      jobUniversityId: app.jobUniversity.id,

      jobId: app.jobUniversity.job.id,

      jobTitle: app.jobUniversity.job.title,

      studentId: app.student.id,

      department: app.student.department,

      name: `${app.student.user.firstname} ${app.student.user.lastname}`,

      email: app.student.user.email,
    }));
  }

  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        createdAt: "asc",
      },

      select: {
        id: true,

        status: true,

        currentRound: true,

        jobUniversity: {
          select: {
            id: true,

            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },

        student: {
          select: {
            id: true,

            department: true,

            user: {
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            },
          },
        },
      },
    }),

    prisma.application.count({
      where,
    }),
  ]);

  const mapped = applications.map((app) => ({
    applicationId: app.id,

    status: app.status,

    currentRound: app.currentRound,

    jobUniversityId: app.jobUniversity.id,

    jobId: app.jobUniversity.job.id,

    jobTitle: app.jobUniversity.job.title,

    studentId: app.student.id,

    department: app.student.department,

    name: `${app.student.user.firstname} ${app.student.user.lastname}`,

    email: app.student.user.email,
  }));

  return {
    data: mapped,

    meta: {
      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getScheduleJobsDetails = async (scheduleId: number) => {
  return prisma.interviewSchedule.findUnique({
    where: {
      id: scheduleId,
    },

    include: {
      company: {
        select: {
          name: true,
        },
      },

      jobUniversities: {
        select: {
          id: true,

          universityId: true,

          status: true,

          salary: true,

          openings: true,

          minCgpa: true,

          maxBacklogs: true,

          approvedAt: true,

          job: {
            select: {
              id: true,

              title: true,

              location: true,

              createdAt: true,
            },
          },

          university: {
            select: {
              id: true,

              name: true,
            },
          },

          _count: {
            select: {
              applications: true,
            },
          },
        },
      },
    },
  });
};

export const createApplicationHistory = async (
  tx: Prisma.TransactionClient,

  data: {
    applicationId: number;

    status: ApplicationStatus;

    round?: InterviewRound | null;

    reason?: string | null;

    remarks?: string | null;

    createdBy?: number | null;
  },
) => {
  return tx.applicationStatusHistory.create({
    data: {
      applicationId: data.applicationId,

      status: data.status,

      ...(data.round !== null &&
        data.round !== undefined && {
          round: data.round,
        }),

      ...(data.reason !== null &&
        data.reason !== undefined && {
          reason: data.reason,
        }),

      ...(data.remarks !== null &&
        data.remarks !== undefined && {
          remarks: data.remarks,
        }),

      ...(data.createdBy !== null &&
        data.createdBy !== undefined && {
          createdBy: data.createdBy,
        }),
    },
  });
};
