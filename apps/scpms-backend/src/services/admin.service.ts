import bcrypt from "bcrypt";
import {
  Company,
  CompanyApprovalStatus,
  Job,
  JobStatus,
  NotificationType,
  Role,
} from "@prisma/client";
import {
  createUser,
  findUserByEmail,
  getUsersByIds,
} from "../repository/user.repository";
import {
  activateUsers,
  createAdminWithUniversity,
  getActiveStudentsByYear,
  getAdminCount,
  getJobs,
  getStudents,
} from "../repository/admin.repository";
import { hashPassword } from "../utils/hashPassword";
import {
  getDeptWiseStats,
  getEligibleUnplacedStudents,
  // getInactiveStudents,
  getInactiveStudentUsers,
  getSalaryDataRepo,
  getStudentByUserId,
  getTotalPlacedStudentsRepo,
} from "../repository/student.repository";
import { sendSuccess } from "../utils/response";
import {
  activateCompanies,
  getCompanies,
  getCompanyById,
  getCompanyByUserId,
  getInactiveCompanies,
} from "../repository/company.repository";
import { getJobById } from "../repository/job.repository";
import { sendEmailService } from "./mail/mail.service";
import { emitToUsers } from "../socket";
import { SOCKET_EVENTS } from "../socket.event";
import { createManyNotifications } from "../repository/notification.repository";
import { runInBackground } from "../utils/Background.task";

import {
  normalizeEmails,
  normalizeName,
  normalizeText,
} from "../utils/normalize.utils";
import prisma from "../config/db";
import {
  getPendingCompanyRequestsByIds,
  getRequestsByUniversity,
  hasApprovedUniversity,
  updateCompanyRequestStatus,
} from "../repository/company.university.repository";
import { updateCompanyUniversityStatus } from "../repository/superadmin.repository";
import { getUniversityByAdminId } from "../repository/university.repository";
import {
  getJobUniversities,
  updateJobUniversityStatus,
} from "../repository/job.university.repository";

export const registerAdminService = async (data: {
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
  university: {
    name: string;
    code?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}) => {
  let { firstname, lastname, email, password, university } = data;

  firstname = normalizeName(firstname);
  lastname = lastname ? normalizeName(lastname) : undefined;
  email = normalizeEmails(email);

  if (!university?.name) {
    throw new Error("University name is required");
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const userData = {
    firstname,
    ...(lastname ? { lastname } : {}),
    email,
    password: hashedPassword,
  };

  return prisma.$transaction(async (tx) => {
    return createAdminWithUniversity(tx, userData, university);
  });
};

export const getStudentsService = async (
  params: {
    page?: number;
    limit?: number;
    passingYear?: number;
    year?: number;
    minCgpa?: number;
    maxCgpa?: number;
    departmentId?: number;
    status?: "ACTIVE" | "INACTIVE";
    universityId?: number;
  },
  user?: any,
) => {
  if (user?.role === "ADMIN") {
    const admin = await getUniversityByAdminId(user.id);

    if (!admin?.university?.id) {
      throw new Error("Admin not linked to university");
    }

    params.universityId = admin.university.id;
  } else if (user?.role === "STUDENT") {
    const student = await getStudentByUserId(user.id);

    if (!student?.university.id) {
      throw new Error("Student not linked to university");
    }

    params.universityId = student.university.id;
  }

  const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_LIMIT || "10", 10);

  const MAX_LIMIT = 50;

  let finalLimit = params.limit ?? DEFAULT_LIMIT;

  if (!finalLimit || finalLimit < 1) {
    finalLimit = DEFAULT_LIMIT;
  }

  if (finalLimit > MAX_LIMIT) {
    finalLimit = MAX_LIMIT;
  }

  let finalPage = params.page ?? 1;

  if (!finalPage || finalPage < 1) {
    finalPage = 1;
  }

  return getStudents({
    ...params,
    page: finalPage,
    limit: finalLimit,
  });
};

// export const getCompaniesService = async (params: {
//   page?: number;
//   limit?: number;
//   status?: "ACTIVE" | "INACTIVE";
// }) => {
//   const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_LIMIT || "10", 10);
//   const MAX_LIMIT = 50;

//   let finalLimit = params.limit ?? DEFAULT_LIMIT;

//   if (!finalLimit || finalLimit < 1) {
//     finalLimit = DEFAULT_LIMIT;
//   }

//   if (finalLimit > MAX_LIMIT) {
//     finalLimit = MAX_LIMIT;
//   }

//   let finalPage = params.page ?? 1;

//   if (!finalPage || finalPage < 1) {
//     finalPage = 1;
//   }

//   return getCompanies({
//     ...params,
//     page: finalPage,
//     limit: finalLimit,
//   });
// };

export const getActiveStudentsService = async (params: {
  page?: number;
  limit?: number;
  year?: number;
  passingYear?: number;
}) => {
  const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_LIMIT || "10", 10);
  const MAX_LIMIT = 50;

  let finalPage = params.page ?? 1;
  let finalLimit = params.limit ?? DEFAULT_LIMIT;

  if (finalPage < 1) finalPage = 1;
  if (finalLimit < 1) finalLimit = DEFAULT_LIMIT;
  if (finalLimit > MAX_LIMIT) finalLimit = MAX_LIMIT;

  const query: {
    page: number;
    limit: number;
    year?: number;
    passingYear?: number;
  } = {
    page: finalPage,
    limit: finalLimit,
  };

  if (params.year !== undefined) {
    query.year = params.year;
  }

  if (params.passingYear !== undefined) {
    query.passingYear = params.passingYear;
  }

  return getActiveStudentsByYear(query);
};

export const getInactiveStudentsService = async (params: {
  page?: number;
  limit?: number;
  passingYearFrom?: number;
}) => {
  const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_LIMIT || "10", 10);
  const MAX_LIMIT = 50;

  let page = params.page ?? 1;
  let limit = params.limit ?? DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return getInactiveStudentUsers({
    page,
    limit,
  });
};

export const getCompaniesService = async (params: {
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "INACTIVE";
}) => {
  const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_LIMIT || "10", 10);
  const MAX_LIMIT = 50;

  let page = params.page ?? 1;
  let limit = params.limit ?? DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const query: {
    page: number;
    limit: number;
    status?: "ACTIVE" | "INACTIVE";
  } = {
    page,
    limit,
  };

  if (params.status !== undefined) {
    query.status = params.status;
  }

  return getCompanies(query);
};

export const activateUsersService = async (userIds: number[]) => {
  if (!userIds || userIds.length === 0) {
    throw new Error("User IDs are required");
  }

  const users = await getUsersByIds(userIds);

  if (!users.length) {
    throw new Error("No users found");
  }

  const foundIds = users.map((u) => u.id);
  const missingIds = userIds.filter((id) => !foundIds.includes(id));

  if (missingIds.length) {
    throw new Error(`Users not found: ${missingIds.join(", ")}`);
  }

  const invalidUsers = users.filter(
    (u) => u.role !== "STUDENT" || u.status !== "INACTIVE",
  );

  if (invalidUsers.length) {
    throw new Error(
      `Invalid users (must be STUDENT & INACTIVE): ${invalidUsers.map((u) => u.id).join(", ")}`,
    );
  }

  const result = await activateUsers(userIds);

  return {
    updatedCount: result.count,
  };
};

export const getInactiveCompaniesService = async (params: {
  page?: number;
  limit?: number;
}) => {
  const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_PAGE_LIMIT || "10", 10);
  const MAX_LIMIT = 50;

  let page = params.page ?? 1;
  let limit = params.limit ?? DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return getInactiveCompanies({ page, limit });
};

export const updateJobUniversityStatusService = async (
  ids: number[],
  status: "APPROVED" | "REJECTED",
  adminId: number,
) => {
  const admin = await getUniversityByAdminId(adminId);

  if (!admin || !admin.university) {
    throw new Error("Admin not linked to any university");
  }

  return updateJobUniversityStatus(ids, status, admin.university.id);
};

export const activateCompaniesService = async (userIds: number[]) => {
  try {
    const users = await getUsersByIds(userIds);

    if (!users.length) {
      throw new Error("No users found");
    }

    const nonCompanyUsers = users.filter((u) => u.role !== "COMPANY");

    if (nonCompanyUsers.length) {
      throw new Error(
        `Some users are not companies: ${nonCompanyUsers
          .map((u) => u.id)
          .join(", ")}`,
      );
    }

    const alreadyActive = users.filter((u) => u.status === "ACTIVE");

    if (alreadyActive.length) {
      throw new Error(
        `Some companies already active: ${alreadyActive
          .map((u) => u.id)
          .join(", ")}`,
      );
    }

    const validUserIds: number[] = [];

    const rejected: {
      userId: number;
      reason: string;
    }[] = [];

    for (const user of users) {
      try {
        const company = await getCompanyByUserId(user.id);

        if (!company) {
          rejected.push({
            userId: user.id,
            reason: "Company profile not found",
          });

          continue;
        }

        validUserIds.push(user.id);
      } catch (innerErr: any) {
        rejected.push({
          userId: user.id,
          reason: innerErr.message || "Validation failed",
        });
      }
    }

    if (!validUserIds.length) {
      throw new Error("No companies eligible for activation");
    }

    const activated = await activateCompanies(validUserIds);

    return {
      activatedCount: activated.count ?? validUserIds.length,

      activatedIds: validUserIds,

      rejected,
    };
  } catch (err: any) {
    throw new Error(err.message || "Failed to activate companies");
  }
};

// export const getDashboardStatsService = async () => {
//   try {
//     const [students, totalPlaced, salaryData] = await Promise.all([
//       getDeptWiseStats(),
//       getTotalPlacedStudentsRepo(),
//       getSalaryDataRepo(),
//     ]);

//     const deptMap: any = {};

//     students.forEach((student) => {
//       const dept = student.department.name;

//       if (!deptMap[dept]) {
//         deptMap[dept] = {
//           total: 0,
//           placed: 0,
//         };
//       }

//       deptMap[dept].total++;

//       if (
//         student.applications.some(
//           (app) =>
//             app.status === "SELECTED" &&
//             app.jobUniversity.universityId === student.universityId,
//         )
//       ) {
//         deptMap[dept].placed++;
//       }
//     });

//     const deptStats = Object.entries(deptMap).map(([dept, data]: any) => ({
//       department: dept,
//       totalStudents: data.total,
//       placedStudents: data.placed,
//       percentage:
//         data.total > 0
//           ? Number(((data.placed / data.total) * 100).toFixed(2))
//           : 0,
//     }));

//     let totalSalary = 0;

//     const deptSalaryMap: any = {};

//     salaryData.forEach((item) => {
//       const salary = item.jobUniversity?.salary;
//       if (!salary) return;
//       const deptId = item.student.departmentId;

//       totalSalary += salary;

//       if (!deptSalaryMap[deptId]) {
//         deptSalaryMap[deptId] = [];
//       }

//       deptSalaryMap[deptId].push(salary);
//     });

//     const avgSalary =
//       salaryData.length > 0 ? Math.round(totalSalary / salaryData.length) : 0;

//     const deptAvgSalary = Object.entries(deptSalaryMap).map(
//       ([deptId, salaries]: any) => ({
//         departmentId: Number(deptId),
//         avgSalary: Math.round(
//           salaries.reduce((a: number, b: number) => a + b, 0) / salaries.length,
//         ),
//       }),
//     );

//     return {
//       totalPlacedStudents: totalPlaced,
//       avgSalary,
//       deptStats,
//       deptAvgSalary,
//     };
//   } catch (error) {
//     console.error("Dashboard Service Error:", error);
//     throw error;
//   }
// };

export const getDashboardStatsService = async (userId: number) => {
  try {
    const admin = await getUniversityByAdminId(userId);

    if (!admin || !admin.university) {
      throw new Error("Admin not linked to any university");
    }

    const universityId = admin.university.id;

    const [students, totalPlaced, salaryData] = await Promise.all([
      getDeptWiseStats(universityId),
      getTotalPlacedStudentsRepo(universityId),
      getSalaryDataRepo(universityId),
    ]);

    const deptMap: Record<
      string,
      {
        total: number;
        placed: number;
      }
    > = {};

    students.forEach((student) => {
      const dept = student.department?.name;

      if (!dept) return;

      if (!deptMap[dept]) {
        deptMap[dept] = {
          total: 0,
          placed: 0,
        };
      }

      deptMap[dept].total++;

      const isPlaced = student.applications?.some(
        (app) =>
          app.status === "OFFER_ACCEPTED" &&
          app.jobUniversity?.universityId === universityId,
      );

      if (isPlaced) {
        deptMap[dept].placed++;
      }
    });

    const deptStats = Object.entries(deptMap).map(([dept, data]) => ({
      department: dept,
      totalStudents: data.total,
      placedStudents: data.placed,
      percentage:
        data.total > 0
          ? Number(((data.placed / data.total) * 100).toFixed(2))
          : 0,
    }));

    const studentSalaryMap: Record<number, number> = {};

    salaryData.forEach((item) => {
      const studentId = item.student.id;
      const salary = item.jobUniversity?.salary;

      if (!salary) return;

      if (
        !studentSalaryMap[studentId] ||
        salary > studentSalaryMap[studentId]
      ) {
        studentSalaryMap[studentId] = salary;
      }
    });

    let totalSalary = 0;

    const deptSalaryMap: Record<number, number[]> = {};

    const processedStudents = new Set<number>();

    salaryData.forEach((item) => {
      const studentId = item.student.id;

      if (processedStudents.has(studentId)) return;

      const finalSalary = studentSalaryMap[studentId];

      if (!finalSalary) return;

      const deptId = item.student.departmentId;

      totalSalary += finalSalary;

      if (!deptSalaryMap[deptId]) {
        deptSalaryMap[deptId] = [];
      }

      deptSalaryMap[deptId].push(finalSalary);

      processedStudents.add(studentId);
    });

    const totalStudentsPlaced = Object.keys(studentSalaryMap).length;

    const avgSalary =
      totalStudentsPlaced > 0
        ? Math.round(totalSalary / totalStudentsPlaced)
        : 0;

    const deptAvgSalary = Object.entries(deptSalaryMap).map(
      ([deptId, salaries]) => ({
        departmentId: Number(deptId),
        avgSalary: Math.round(
          salaries.reduce((a, b) => a + b, 0) / salaries.length,
        ),
      }),
    );

    return {
      universityId,
      totalPlacedStudents: totalPlaced,
      avgSalary,
      deptStats,
      deptAvgSalary,
    };
  } catch (error) {
    console.error("Dashboard Service Error:", error);
    throw error;
  }
};

export const getJobsByCompanyIdServices = async (params: {
  companyId: number;
  page: number;
  limit: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  universityId?: number;
}) => {
  try {
    const { companyId, page, limit, status, universityId } = params;

    return getJobUniversities({
      page,
      limit,
      companyId,
      ...(status && { status }),
      ...(universityId && { universityId }),
    });
  } catch (error: any) {
    console.log(error);
    throw error;
  }
};

export const getCompanyRequestsService = async (
  universityId: number,
  status?: CompanyApprovalStatus,
) => {
  if (!universityId) {
    throw new Error("UniversityId required");
  }

  return getRequestsByUniversity(universityId, status);
};

export const updateCompanyRequestsService = async (
  ids: number[],
  status: "APPROVED" | "REJECTED",
  adminId: number,
) => {
  const admin = await getUniversityByAdminId(adminId);

  if (!admin || !admin.university) {
    throw new Error("Admin not found");
  }

  const universityId = admin.university.id;

  const validRequests = await getPendingCompanyRequestsByIds(ids, universityId);

  const validIds = new Set(validRequests.map((r) => r.id));
  const invalidIds = ids.filter((id) => !validIds.has(id));

  if (invalidIds.length) {
    throw new Error(
      `Invalid or unauthorized request IDs: ${invalidIds.join(", ")}`,
    );
  }

  return updateCompanyUniversityStatus(
    validRequests.map((r) => r.id),
    status,
    admin.id,
  );
};
