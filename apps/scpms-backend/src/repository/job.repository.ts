import { Prisma } from "@prisma/client";
import prisma from "../config/db";

export const createJob = async (data: any) => {
  const { eligibleDepartmentIds, skillIds, companyId, ...rest } = data;

  return prisma.job.create({
    data: {
      ...rest,

      company: {
        connect: { id: companyId },
      },

      ...(eligibleDepartmentIds?.length && {
        eligibleDepartments: {
          connect: eligibleDepartmentIds.map((id: number) => ({ id })),
        },
      }),

      ...(skillIds?.length && {
        skills: {
          connect: skillIds.map((id: number) => ({ id })),
        },
      }),
    },

    include: {
      company: true,
      eligibleDepartments: true,
      skills: true,
    },
  });
};

export const updateJob = async (id: number, data: any) => {
  const {
    eligibleDepartmentIds,
    addEligibleDepartmentIds,
    removeEligibleDepartmentIds,

    skillIds,
    addSkillIds,
    removeSkillIds,

    ...rest
  } = data;

  const departmentOps: any = {};

  if (eligibleDepartmentIds) {
    departmentOps.set = eligibleDepartmentIds.map((id: number) => ({ id }));
  } else {
    if (addEligibleDepartmentIds?.length) {
      departmentOps.connect = addEligibleDepartmentIds.map((id: number) => ({
        id,
      }));
    }

    if (removeEligibleDepartmentIds?.length) {
      departmentOps.disconnect = removeEligibleDepartmentIds.map(
        (id: number) => ({ id }),
      );
    }
  }

  const skillOps: any = {};

  if (skillIds) {
    skillOps.set = skillIds.map((id: number) => ({ id }));
  } else {
    if (addSkillIds?.length) {
      skillOps.connect = addSkillIds.map((id: number) => ({ id }));
    }

    if (removeSkillIds?.length) {
      skillOps.disconnect = removeSkillIds.map((id: number) => ({ id }));
    }
  }

  return prisma.job.update({
    where: { id },

    data: {
      ...rest,

      ...(Object.keys(departmentOps).length && {
        eligibleDepartments: departmentOps,
      }),

      ...(Object.keys(skillOps).length && {
        skills: skillOps,
      }),
    },

    include: {
      company: true,
      eligibleDepartments: true,
      skills: true,
    },
  });
};

export const getJobs = async (params: {
  page: number;
  limit: number;
  companyId?: number;
}) => {
  const { page, limit, companyId } = params;

  const skip = (page - 1) * limit;

  const where = {
    ...(companyId && { companyId }),
  };

  const [data, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        eligibleDepartments: true,
        skills: true,
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getJobById = async (id: number) => {
  return prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      eligibleDepartments: true,
      skills: true,
    },
  });
};

// export const getJobsByIds = async (jobIds: number[]) => {
//   return prisma.job.findMany({
//     where: {
//       id: {
//         in: jobIds,
//       },

//       isDeleted: false,
//     },

//     include: {
//       company: true,

//       eligibleDepartments: true,

//       skills: true,

//       universities: {
//         include: {
//           university: true,
//         },
//       },
//     },
//   });
// };

export const getJobsByIds = async (jobIds: number[]) => {
  return prisma.job.findMany({
    where: {
      id: {
        in: jobIds,
      },

      isDeleted: false,
    },

    include: {
      company: true,

      eligibleDepartments: true,

      skills: true,

      universities: {
        include: {
          university: true,
        },
      },
    },
  });
};

export const deleteJob = async (id: number) => {
  return prisma.job.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });
};
