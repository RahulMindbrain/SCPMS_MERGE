import { getCompanyByUserId } from "../repository/company.repository";
import { findExistingCompanyUniversityPairs } from "../repository/company.university.repository";
import { getDepartmentsByIds } from "../repository/department.repository";
import {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  //getJobsByIds,
  updateJob,
} from "../repository/job.repository";
import { createJobUniversity } from "../repository/job.university.repository";
import { getSkillsByIds } from "../repository/skill.repostiory";
import { getUniversitiesByIds } from "../repository/university.repository";
import { normalizeText } from "../utils/normalize.utils";

export const createJobService = async (data: any, userId: number) => {
  const { eligibleDepartmentIds, skillIds, universities, ...jobData } = data;

  const company = await getCompanyByUserId(userId);

  if (!company) {
    throw new Error("Company profile not found");
  }

  if (jobData.title !== undefined) {
    jobData.title = normalizeText(jobData.title);
  }

  if (jobData.location !== undefined) {
    jobData.location = normalizeText(jobData.location);
  }

  if (eligibleDepartmentIds?.length) {
    const departments = await getDepartmentsByIds(eligibleDepartmentIds);

    const foundIds = new Set(departments.map((d) => d.id));

    const missing = eligibleDepartmentIds.filter(
      (id: number) => !foundIds.has(id),
    );

    if (missing.length) {
      throw new Error(`Invalid department IDs: ${missing.join(", ")}`);
    }
  }

  if (skillIds?.length) {
    const skills = await getSkillsByIds(skillIds);

    const foundIds = new Set(skills.map((s) => s.id));

    const missing = skillIds.filter((id: number) => !foundIds.has(id));

    if (missing.length) {
      throw new Error(`Invalid skill IDs: ${missing.join(", ")}`);
    }
  }

  const job = await createJob({
    title: jobData.title,
    location: jobData.location,

    companyId: company.id,

    eligibleDepartmentIds,
    skillIds,
  });

  return job;
};

export const getJobsService = async (params: {
  page?: number;
  limit?: number;
  companyId?: number;
}) => {
  const page = params.page ?? 1;

  const envLimit = Number(process.env.DEFAULT_PAGE_LIMIT);
  const finalLimit =
    params.limit ?? (Number.isFinite(envLimit) && envLimit > 0 ? envLimit : 10);

  return getJobs({
    page,
    limit: finalLimit,
    ...(params.companyId && { companyId: params.companyId }),
  });
};

export const updateJobService = async (id: number, data: any) => {
  if (!id || isNaN(id)) {
    throw new Error("Invalid job id");
  }

  const { eligibleDepartmentIds, skillIds, ...jobData } = data;

  if (jobData.title !== undefined) {
    jobData.title = normalizeText(jobData.title);
  }
  if (jobData.description !== undefined) {
    jobData.description = normalizeText(jobData.description);
  }
  if (jobData.location !== undefined) {
    jobData.location = normalizeText(jobData.location);
  }

  let deptSet: any[] | undefined;
  if (eligibleDepartmentIds) {
    if (eligibleDepartmentIds.length) {
      const departments = await getDepartmentsByIds(eligibleDepartmentIds);
      const foundIds = new Set(departments.map((d) => d.id));
      const missing = eligibleDepartmentIds.filter(
        (id: number) => !foundIds.has(id),
      );
      if (missing.length) {
        throw new Error(`Invalid department IDs: ${missing.join(", ")}`);
      }
      deptSet = eligibleDepartmentIds.map((id: number) => ({ id }));
    } else {
      deptSet = [];
    }
  }

  let skillSet: any[] | undefined;
  if (skillIds) {
    if (skillIds.length) {
      const skills = await getSkillsByIds(skillIds);
      const foundIds = new Set(skills.map((s) => s.id));
      const missing = skillIds.filter((id: number) => !foundIds.has(id));
      if (missing.length) {
        throw new Error(`Invalid skill IDs: ${missing.join(", ")}`);
      }
      skillSet = skillIds.map((id: number) => ({ id }));
    } else {
      skillSet = [];
    }
  }

  return updateJob(id, {
    ...jobData,
    ...(deptSet !== undefined && {
      eligibleDepartments: { set: deptSet },
    }),
    ...(skillSet !== undefined && {
      skills: { set: skillSet },
    }),
  });
};

export const deleteJobService = async (id: number) => {
  return deleteJob(id);
};

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
    throw new Error("Some universities are invalid");
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
    throw new Error(
      `Company not approved for universities: ${invalid.join(", ")}`,
    );
  }

  return createJobUniversity(jobId, jobUniversities);
};
