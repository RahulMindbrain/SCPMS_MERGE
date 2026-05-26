import { getCompanyByUserId } from "../repository/company.repository";
import { findExistingCompanyUniversityPairs } from "../repository/company.university.repository";
import { getJobById } from "../repository/job.repository";
import {
  createJobUniversity,
  getJobUniversities,
  getJobUniversityByPair,
  reapplyJobUniversity,
  updateJobUniversityStatus,
} from "../repository/job.university.repository";
import { getStudentByUserId } from "../repository/student.repository";
import {
  getUniversitiesByIds,
  getUniversityByAdminId,
} from "../repository/university.repository";

export const sendJobToUniversitiesService = async (
  jobId: number,
  jobUniversities: any[],
  userId: number,
) => {
  const job = await getJobById(jobId);
  if (!job) throw new Error("Job not found");

  const company = await getCompanyByUserId(userId);
  if (!company || company.id !== job.companyId) {
    throw new Error("Unauthorized");
  }

  if (!jobUniversities?.length) {
    throw new Error("At least one university is required");
  }

  const universityIds = jobUniversities.map((u) => u.universityId);

  const universities = await getUniversitiesByIds(universityIds);
  if (universities.length !== universityIds.length) {
    throw new Error("Invalid universities");
  }

  const approvals = await findExistingCompanyUniversityPairs(
    company.id,
    universityIds,
  );

  const approvedSet = new Set(
    approvals.filter((a) => a.status === "APPROVED").map((a) => a.universityId),
  );

  const invalid = universityIds.filter((id) => !approvedSet.has(id));
  if (invalid.length) {
    throw new Error(`Not approved for universities: ${invalid.join(", ")}`);
  }

  return createJobUniversity(jobId, jobUniversities);
};

export const updateJobUniversityStatusService = async (
  ids: number[],
  status: "APPROVED" | "REJECTED",
  adminId: number,
  reason?: string,
) => {
  const admin = await getUniversityByAdminId(adminId);

  if (!admin?.university?.id) {
    throw new Error("Admin not linked to university");
  }

  if (status === "REJECTED" && !reason) {
    throw new Error("Rejection reason is required");
  }

  return updateJobUniversityStatus(ids, status, admin.university.id, reason);
};

export const getJobUniversitiesService = async (
  params: {
    page?: number;
    limit?: number;
    universityId?: number;
    companyId?: number;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    departmentId?: number;
    minCgpa?: number;
  },
  user?: any,
) => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(Math.max(1, params.limit ?? 10), 50);

  const filters: any = {
    page,
    limit,
  };

  if (user?.role === "STUDENT") {
    const student = await getStudentByUserId(user.id);

    if (!student) {
      throw new Error("Student profile not found");
    }

    filters.universityId = student.university?.id;
    filters.departmentId = student.department?.id;
    filters.minCgpa = student.cgpa ?? 0;
    filters.status = "APPROVED";
  } else if (user?.role === "ADMIN") {
    const admin = await getUniversityByAdminId(user.id);

    if (!admin || !admin.university) {
      throw new Error("Admin not linked to any university");
    }

    filters.universityId = admin.university.id;

    if (params.status) filters.status = params.status;
    if (params.departmentId) filters.departmentId = params.departmentId;
    if (params.minCgpa !== undefined) filters.minCgpa = params.minCgpa;
  } else if (user?.role === "COMPANY") {
    const company = await getCompanyByUserId(user.id);

    if (!company) {
      throw new Error("Company profile not found");
    }

    filters.companyId = company.id;

    if (params.status) filters.status = params.status;
    if (params.universityId) filters.universityId = params.universityId;
  } else {
    Object.assign(filters, params);
  }

  return getJobUniversities(filters);
};

export const reapplyJobUniversityService = async (
  jobId: number,
  universityId: number,
  userId: number,
  data: any,
) => {
  const company = await getCompanyByUserId(userId);
  if (!company) throw new Error("Company not found");

  const job = await getJobById(jobId);
  if (!job || job.companyId !== company.id) {
    throw new Error("Unauthorized job access");
  }

  const existing = await getJobUniversityByPair(jobId, universityId);

  if (!existing) {
    throw new Error("Job not found for this university");
  }

  if (existing.status !== "REJECTED") {
    throw new Error("Only rejected jobs can be reapplied");
  }

  const result = await reapplyJobUniversity(jobId, universityId, data);

  if (result.count === 0) {
    throw new Error("Reapply failed");
  }

  return {
    message: "Reapplied successfully",
  };
};
