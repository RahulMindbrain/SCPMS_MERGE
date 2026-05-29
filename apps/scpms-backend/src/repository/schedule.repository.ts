import prisma from "../config/db";
import {
  CompanyApprovalStatus,
  JobStatus,
  ScheduleStatus,
} from "@prisma/client";

const baseScheduleInclude = {
  company: {
    select: {
      id: true,
      name: true,
      userId: true,
    },
  },

  university: {
    select: {
      id: true,
      name: true,
    },
  },

  jobUniversities: {
    where: {
      status: JobStatus.APPROVED,
    },

    select: {
      id: true,

      universityId: true,

      status: true,

      salary: true,

      openings: true,

      minCgpa: true,

      maxBacklogs: true,

      sentAt: true,

      approvedAt: true,

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

          companyId: true,

          location: true,

          createdAt: true,

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
    },
  },
};

export const createInterviewSchedule = async (data: {
  title: string;
  companyId: number;
  startTime: Date;
  endTime: Date;
  venue?: string;
  createdBy: number;
}) => {
  return prisma.interviewSchedule.create({
    data,
    include: baseScheduleInclude,
  });
};

const jobUniversityScheduleSelect = {
  id: true,

  universityId: true,

  status: true,

  salary: true,

  openings: true,

  minCgpa: true,

  maxBacklogs: true,

  sentAt: true,

  approvedAt: true,

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
      description: true,
      location: true,
      status: true,
      createdAt: true,

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
};

export const attachJobsToSchedule = async (
  scheduleId: number,
  jobUniversityIds: number[],
) => {
  return prisma.jobUniversity.updateMany({
    where: {
      id: {
        in: jobUniversityIds,
      },

      interviewScheduleId: null,

      status: JobStatus.APPROVED,
    },

    data: {
      interviewScheduleId: scheduleId,
    },
  });
};

export const detachJobsFromSchedule = async (jobUniversityIds: number[]) => {
  return prisma.jobUniversity.updateMany({
    where: {
      id: {
        in: jobUniversityIds,
      },
    },

    data: {
      interviewScheduleId: null,
    },
  });
};

export const getScheduleById = async (id: number) => {
  return prisma.interviewSchedule.findUnique({
    where: {
      id,
    },

    include: {
      company: true,

      admin: {
        include: {
          user: true,
        },
      },

      university: {
        select: {
          id: true,
          name: true,
        },
      },

      jobUniversities: {
        where: {
          status: JobStatus.APPROVED,
        },

        select: {
          id: true,

          universityId: true,

          status: true,

          salary: true,

          openings: true,

          minCgpa: true,

          maxBacklogs: true,

          sentAt: true,

          approvedAt: true,

          job: {
            select: {
              id: true,

              title: true,

              location: true,

              companyId: true,
            },
          },

          university: {
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

export const getSchedulesForAdmin = async (
  universityId: number,
  companyId?: number,
  page: number = 1,
  limit: number = 10,
  status?: ScheduleStatus,
) => {
  // console.log("admin repository");
  const skip = (page - 1) * limit;

  // console.log("status =", status);

  const where = {
    universityId,
    ...(companyId && { companyId }),
    ...(status && {
      status,
    }),
  };

  // console.log("where =", where);

  const [items, total] = await prisma.$transaction([
    prisma.interviewSchedule.findMany({
      where,
      skip,
      take: limit,

      include: {
        company: true,
        university: true,
      },

      orderBy: {
        startTime: "asc",
      },
    }),

    prisma.interviewSchedule.count({
      where,
    }),
  ]);

  return {
    data: items,

    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSchedulesForCompany = async (
  companyId: number,
  universityId?: number,
  page: number = 1,
  limit: number = 10,
  status?: ScheduleStatus,
) => {
  // console.log("company repository");
  const skip = (page - 1) * limit;

  const where = {
    companyId,
    ...(universityId && { universityId }),
    ...(status && {
      status,
    }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.interviewSchedule.findMany({
      where,
      skip,
      take: limit,

      include: {
        company: true,
        university: true,
      },

      orderBy: {
        startTime: "asc",
      },
    }),

    prisma.interviewSchedule.count({
      where,
    }),
  ]);

  return {
    data: items,

    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAllSchedules = async (companyId: number) => {
  return prisma.interviewSchedule.findMany({
    where: {
      companyId,
    },
    include: baseScheduleInclude,
    orderBy: {
      startTime: "asc",
    },
  });
};

export const getSchedulesByCompany = async (companyId: number) => {
  return prisma.interviewSchedule.findMany({
    where: {
      companyId,
    },

    include: baseScheduleInclude,

    orderBy: {
      startTime: "asc",
    },
  });
};

export const getUpcomingSchedules = async () => {
  const now = new Date();

  return prisma.interviewSchedule.findMany({
    where: {
      endTime: {
        gte: now,
      },

      jobUniversities: {
        some: {
          status: JobStatus.APPROVED,
        },
      },
    },

    include: baseScheduleInclude,

    orderBy: {
      startTime: "asc",
    },
  });
};
export const getOngoingSchedules = async () => {
  const now = new Date();

  return prisma.interviewSchedule.findMany({
    where: {
      startTime: {
        lte: now,
      },

      endTime: {
        gte: now,
      },

      jobUniversities: {
        some: {
          status: JobStatus.APPROVED,
        },
      },
    },

    include: baseScheduleInclude,
  });
};

export const updateSchedule = async (
  id: number,
  data: Partial<{
    title: string;
    startTime: Date;
    endTime: Date;
    venue: string;
    status: ScheduleStatus;
  }>,
) => {
  return prisma.interviewSchedule.update({
    where: { id },
    data,
    include: baseScheduleInclude,
  });
};

export const deleteSchedule = async (id: number) => {
  return prisma.interviewSchedule.delete({
    where: { id },
  });
};

export const checkScheduleConflict = async (
  startTime: Date,
  endTime: Date,
  companyId: number,
  venue?: string,
) => {
  return prisma.interviewSchedule.findFirst({
    where: {
      AND: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        {
          OR: [{ companyId: companyId }, ...(venue ? [{ venue: venue }] : [])],
        },
      ],
    },
  });
};

export const createScheduleWithJobs = async (
  scheduleData: {
    title: string;
    companyId: number;
    universityId?: number;
    startTime: Date;
    endTime: Date;
    venue?: string;
    createdBy: number;
  },

  jobUniversityIds: number[],
) => {
  return prisma.$transaction(async (tx) => {
    const schedule = await tx.interviewSchedule.create({
      data: scheduleData,
    });

    const updated = await tx.jobUniversity.updateMany({
      where: {
        id: {
          in: jobUniversityIds,
        },

        interviewScheduleId: null,

        status: JobStatus.APPROVED,
      },

      data: {
        interviewScheduleId: schedule.id,
      },
    });

    if (updated.count !== jobUniversityIds.length) {
      throw new Error("Some job universities were already scheduled");
    }

    return tx.interviewSchedule.findUnique({
      where: {
        id: schedule.id,
      },

      include: baseScheduleInclude,
    });
  });
};

export const getScheduleWithParticipants = async (scheduleId: number) => {
  return prisma.interviewSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      company: {
        include: {
          user: true,
        },
      },
      admin: {
        select: {
          userId: true,

          user: {
            select: {
              email: true,
              firstname: true,
            },
          },
        },
      },
    },
  });
};

// export const getScheduleWithJobsAndApplications = async (
//   scheduleId: number,
// ) => {
//   return prisma.interviewSchedule.findUnique({
//     where: { id: scheduleId },
//     include: {
//       company: {
//         select: {
//           id: true,
//           name: true,
//           userId: true,
//         },
//       },
//       jobs: {
//         select: {
//           id: true,
//           title: true,
//           applications: {
//             select: {
//               id: true,
//               student: {
//                 select: {
//                   id: true,
//                   user: {
//                     select: {
//                       id: true,
//                       firstname: true,
//                       lastname: true,
//                       email: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });
// };

export const getScheduleWithJobsAndApplications = async (
  scheduleId: number,
) => {
  return prisma.interviewSchedule.findUnique({
    where: {
      id: scheduleId,
    },

    include: {
      company: {
        select: {
          id: true,
          name: true,
          userId: true,
        },
      },

      university: {
        select: {
          id: true,
          name: true,
        },
      },

      admin: {
        include: {
          user: true,
        },
      },
      jobUniversities: {
        where: {
          status: JobStatus.APPROVED,
        },

        select: {
          id: true,

          universityId: true,

          status: true,

          salary: true,

          openings: true,

          minCgpa: true,

          maxBacklogs: true,

          sentAt: true,

          approvedAt: true,

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

          applications: {
            select: {
              id: true,

              status: true,

              currentRound: true,

              reason: true,

              createdAt: true,

              acceptedAt: true,

              student: {
                select: {
                  id: true,

                  universityId: true,

                  departmentId: true,

                  cgpa: true,

                  activeBacklogs: true,

                  isPlaced: true,

                  user: {
                    select: {
                      id: true,
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

                  university: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },

              history: {
                orderBy: {
                  createdAt: "asc",
                },

                select: {
                  id: true,

                  status: true,

                  round: true,

                  reason: true,

                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const updateScheduleApprovalStatus = async (
  scheduleId: number,
  data: {
    companyApprovalStatus: CompanyApprovalStatus;
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string | null;
  },
) => {
  return prisma.interviewSchedule.update({
    where: {
      id: scheduleId,
    },

    data,
  });
};

export const getSchedulesByCompanyIdRepo = async (companyId: number) => {
  return prisma.interviewSchedule.findMany({
    where: {
      companyId,
    },

    include: {
      jobUniversities: {
        where: {
          status: JobStatus.APPROVED,
        },

        select: {
          id: true,

          universityId: true,

          status: true,

          salary: true,

          openings: true,

          minCgpa: true,

          maxBacklogs: true,

          job: {
            select: {
              id: true,

              title: true,

              location: true,
            },
          },

          university: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      startTime: "asc",
    },
  });
};

// export const getUpcomingSchedulesForStudent = async (studentId: number) => {
//   const now = new Date();

//   return prisma.interviewSchedule.findMany({
//     where: {
//       startTime: {
//         gte: now,
//       },
//       jobs: {
//         some: {
//           applications: {
//             some: {
//               studentId,
//             },
//           },
//         },
//       },
//     },
//     include: {
//       company: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//       jobs: {
//         select: {
//           id: true,
//           title: true,
//         },
//       },
//     },
//     orderBy: {
//       startTime: "asc",
//     },
//   });
// };

export const getUpcomingSchedulesForStudent = async (
  studentId: number,
  skip: number,
  take: number,
  page: number,
) => {
  const now = new Date();

  const where = {
    startTime: {
      gte: now,
    },

    jobUniversities: {
      some: {
        status: JobStatus.APPROVED,

        applications: {
          some: {
            studentId,
          },
        },
      },
    },
  };

  const [items, total] = await prisma.$transaction([
    prisma.interviewSchedule.findMany({
      where,

      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },

        university: {
          select: {
            id: true,
            name: true,
          },
        },

        jobUniversities: {
          where: {
            status: JobStatus.APPROVED,

            applications: {
              some: {
                studentId,
              },
            },
          },

          select: {
            id: true,

            universityId: true,

            status: true,

            salary: true,

            openings: true,

            minCgpa: true,

            maxBacklogs: true,

            sentAt: true,

            approvedAt: true,

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
                createdAt: true,

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

            applications: {
              where: {
                studentId,
              },

              select: {
                id: true,

                status: true,

                currentRound: true,

                isAccepted: true,

                acceptedAt: true,

                reason: true,

                createdAt: true,
              },
            },
          },
        },
      },

      orderBy: {
        startTime: "asc",
      },

      skip,

      take,
    }),

    prisma.interviewSchedule.count({
      where,
    }),
  ]);

  return {
    items,

    pagination: {
      page,

      limit: take,

      total,

      totalPages: Math.ceil(total / take),
    },
  };
};

export const getUpcomingSchedulesForCompany = async (
  companyId: number,
  universityId: number | undefined,
  skip: number,
  take: number,
  page: number,
) => {
  const now = new Date();

  const where = {
    companyId,

    ...(universityId && {
      universityId,
    }),

    startTime: {
      gte: now,
    },

    jobUniversities: {
      some: {
        status: JobStatus.APPROVED,

        ...(universityId && {
          universityId,
        }),
      },
    },
  };

  const [items, total] = await prisma.$transaction([
    prisma.interviewSchedule.findMany({
      where,

      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },

        university: {
          select: {
            id: true,
            name: true,
          },
        },

        jobUniversities: {
          where: {
            status: JobStatus.APPROVED,

            ...(universityId && {
              universityId,
            }),
          },

          select: {
            id: true,

            universityId: true,

            status: true,

            salary: true,

            openings: true,

            minCgpa: true,

            maxBacklogs: true,

            sentAt: true,

            approvedAt: true,

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
                createdAt: true,

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

            applications: {
              select: {
                id: true,

                status: true,

                currentRound: true,

                isAccepted: true,

                acceptedAt: true,

                createdAt: true,
              },
            },
          },
        },
      },

      orderBy: {
        startTime: "asc",
      },

      skip,

      take,
    }),

    prisma.interviewSchedule.count({
      where,
    }),
  ]);

  return {
    items,

    pagination: {
      page,

      limit: take,

      total,

      totalPages: Math.ceil(total / take),
    },
  };
};

export const getUpcomingSchedulesForAdmin = async (
  userId: number,
  skip: number,
  take: number,
  page: number,
) => {
  const now = new Date();

  const admin = await prisma.admin.findUnique({
    where: {
      userId,
    },

    select: {
      id: true,
      universityId: true,
    },
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  const where = {
    universityId: admin.universityId,

    startTime: {
      gte: now,
    },

    jobUniversities: {
      some: {
        universityId: admin.universityId,

        status: JobStatus.APPROVED,
      },
    },
  };

  const [items, total] = await prisma.$transaction([
    prisma.interviewSchedule.findMany({
      where,

      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },

        university: {
          select: {
            id: true,
            name: true,
          },
        },

        jobUniversities: {
          where: {
            universityId: admin.universityId,

            status: JobStatus.APPROVED,
          },

          select: {
            id: true,

            universityId: true,

            status: true,

            salary: true,

            openings: true,

            minCgpa: true,

            maxBacklogs: true,

            sentAt: true,

            approvedAt: true,

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
                createdAt: true,

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

            applications: {
              select: {
                id: true,

                status: true,

                currentRound: true,

                isAccepted: true,

                acceptedAt: true,

                createdAt: true,
              },
            },
          },
        },
      },

      orderBy: {
        startTime: "asc",
      },

      skip,

      take,
    }),

    prisma.interviewSchedule.count({
      where,
    }),
  ]);

  return {
    items,

    pagination: {
      page,

      limit: take,

      total,

      totalPages: Math.ceil(total / take),
    },
  };
};
