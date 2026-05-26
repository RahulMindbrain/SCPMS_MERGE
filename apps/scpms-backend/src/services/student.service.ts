import {
  acceptApplication,
  getApplicationByIdAndStudent,
  withdrawApplication,
  withdrawOtherApplications,
} from "../repository/application.repository";
import { getDepartmentById } from "../repository/department.repository";
import { getSkillsByIds } from "../repository/skill.repostiory";
import {
  createStudent,
  getStudentByUserId,
  markStudentPlaced,
  updateStudent,
} from "../repository/student.repository";
import { normalizeText, normalizeUrl } from "../utils/normalize.utils";
import {
  CreateStudentInput,
  UpdateStudentInput,
} from "../validators/sudent.validator";

// export const createStudentService = async (
//   userId: number,
//   departmentId: number,
//   year: number,
//   passingYear: number,
//   cgpa?: number,
// ) => {
//   const existing = await getStudentByUserId(userId);

//   if (existing) {
//     throw new Error("Student profile already exists");
//   }

//   const departmentExist = await getDepartmentById(departmentId);

//   if (!departmentExist) {
//     throw new Error("Department doesnot exist, Kindly choose valid id");
//   }

//   return createStudent(userId, departmentId, year, passingYear, cgpa);
// };

export const createStudentService = async (
  userId: number,
  data: CreateStudentInput,
) => {
  const existing = await getStudentByUserId(userId);

  if (existing) {
    throw new Error("Student profile already exists");
  }

  if (data.resumeUrl !== undefined) {
    data.resumeUrl = normalizeUrl(data.resumeUrl);
  }

  if (data.linkedinUrl !== undefined) {
    data.linkedinUrl = normalizeUrl(data.linkedinUrl);
  }

  if (data.githubUrl !== undefined) {
    data.githubUrl = normalizeUrl(data.githubUrl);
  }

  if (data.portfolioUrl !== undefined) {
    data.portfolioUrl = normalizeUrl(data.portfolioUrl);
  }

  data.experiences?.forEach((exp) => {
    exp.companyName = normalizeText(exp.companyName);
    exp.role = normalizeText(exp.role);

    if (exp.description !== undefined) {
      exp.description = normalizeText(exp.description);
    }
  });

  data.projects?.forEach((project) => {
    project.title = normalizeText(project.title);

    if (project.description !== undefined) {
      project.description = normalizeText(project.description);
    }

    if (project.techStack !== undefined) {
      project.techStack = normalizeText(project.techStack);
    }

    if (project.githubUrl !== undefined) {
      project.githubUrl = normalizeUrl(project.githubUrl);
    }

    if (project.liveUrl !== undefined) {
      project.liveUrl = normalizeUrl(project.liveUrl);
    }
  });

  data.certificates?.forEach((cert) => {
    cert.title = normalizeText(cert.title);
    cert.issuer = normalizeText(cert.issuer);

    if (cert.certificateUrl !== undefined) {
      cert.certificateUrl = normalizeUrl(cert.certificateUrl);
    }
  });
  if (!data.departmentId) {
    throw new Error("Department is required");
  }

  const dept = await getDepartmentById(data.departmentId);

  if (!dept) {
    throw new Error("Department does not exist");
  }

  if (data.skillIds?.length) {
    const skills = await getSkillsByIds(data.skillIds);

    const foundIds = skills.map((s) => s.id);

    const missing = data.skillIds.filter((id) => !foundIds.includes(id));

    if (missing.length) {
      throw new Error(`Invalid skill IDs: ${missing.join(", ")}`);
    }
  }

  return createStudent(userId, data);
};

export const getStudentProfileService = async (userId: number) => {
  const student = await getStudentByUserId(userId);

  if (!student) {
    throw new Error("Student profile not found");
  }

  return student;
};

// export const updateStudentService = async (
//   userId: number,
//   data: UpdateStudentInput,
// ) => {
//   const existing = await getStudentByUserId(userId);
//   if (!existing) throw new Error("Student profile not found");

//   const addSkillIds = data.addSkillIds ?? [];
//   const removeSkillIds = data.removeSkillIds ?? [];
//   const allSkillIds = [...addSkillIds, ...removeSkillIds];

//   if (allSkillIds.length) {
//     const skills = await getSkillsByIds(allSkillIds);
//     const foundIds = skills.map((s) => s.id);

//     const missing = allSkillIds.filter((id) => !foundIds.includes(id));
//     if (missing.length) {
//       throw new Error(`Invalid skill IDs: ${missing.join(", ")}`);
//     }
//   }

//   if (data.updateExperiences?.length) {
//     const existingIds = existing.experiences.map((e) => e.id);
//     const invalid = data.updateExperiences
//       .map((e) => e.id)
//       .filter((id) => !existingIds.includes(id));

//     if (invalid.length) {
//       throw new Error(`Invalid experience IDs: ${invalid.join(", ")}`);
//     }
//   }

//   if (data.deleteExperienceIds?.length) {
//     const existingIds = existing.experiences.map((e) => e.id);
//     const invalid = data.deleteExperienceIds.filter(
//       (id) => !existingIds.includes(id),
//     );

//     if (invalid.length) {
//       throw new Error(`Invalid deleteExperienceIds: ${invalid.join(", ")}`);
//     }
//   }

//   if (data.updateProjects?.length) {
//     const existingIds = existing.projects.map((p) => p.id);
//     const invalid = data.updateProjects
//       .map((p) => p.id)
//       .filter((id) => !existingIds.includes(id));

//     if (invalid.length) {
//       throw new Error(`Invalid project IDs: ${invalid.join(", ")}`);
//     }
//   }

//   if (data.deleteProjectIds?.length) {
//     const existingIds = existing.projects.map((p) => p.id);
//     const invalid = data.deleteProjectIds.filter(
//       (id) => !existingIds.includes(id),
//     );

//     if (invalid.length) {
//       throw new Error(`Invalid deleteProjectIds: ${invalid.join(", ")}`);
//     }
//   }

//   if (data.updateCertificates?.length) {
//     const existingIds = existing.certificates.map((c) => c.id);
//     const invalid = data.updateCertificates
//       .map((c) => c.id)
//       .filter((id) => !existingIds.includes(id));

//     if (invalid.length) {
//       throw new Error(`Invalid certificate IDs: ${invalid.join(", ")}`);
//     }
//   }

//   if (data.deleteCertificateIds?.length) {
//     const existingIds = existing.certificates.map((c) => c.id);
//     const invalid = data.deleteCertificateIds.filter(
//       (id) => !existingIds.includes(id),
//     );

//     if (invalid.length) {
//       throw new Error(`Invalid deleteCertificateIds: ${invalid.join(", ")}`);
//     }
//   }

//   return updateStudent(userId, data);
// };

export const updateStudentService = async (
  userId: number,
  data: UpdateStudentInput,
) => {
  const existing = await getStudentByUserId(userId);

  if (!existing) {
    throw new Error("Student profile not found");
  }

  if (data.resumeUrl !== undefined && data.resumeUrl !== null) {
    data.resumeUrl = normalizeUrl(data.resumeUrl);
  }

  if (data.linkedinUrl !== undefined && data.linkedinUrl !== null) {
    data.linkedinUrl = normalizeUrl(data.linkedinUrl);
  }

  if (data.githubUrl !== undefined && data.githubUrl !== null) {
    data.githubUrl = normalizeUrl(data.githubUrl);
  }

  if (data.portfolioUrl !== undefined && data.portfolioUrl !== null) {
    data.portfolioUrl = normalizeUrl(data.portfolioUrl);
  }

  data.addExperiences?.forEach((exp) => {
    exp.companyName = normalizeText(exp.companyName);
    exp.role = normalizeText(exp.role);

    if (exp.description !== undefined) {
      exp.description = normalizeText(exp.description);
    }
  });

  data.updateExperiences?.forEach((exp) => {
    exp.companyName = normalizeText(exp.companyName);
    exp.role = normalizeText(exp.role);

    if (exp.description !== undefined) {
      exp.description = normalizeText(exp.description);
    }
  });

  data.addProjects?.forEach((project) => {
    project.title = normalizeText(project.title);

    if (project.description !== undefined) {
      project.description = normalizeText(project.description);
    }

    if (project.techStack !== undefined) {
      project.techStack = normalizeText(project.techStack);
    }

    if (project.githubUrl !== undefined) {
      project.githubUrl = normalizeUrl(project.githubUrl);
    }

    if (project.liveUrl !== undefined) {
      project.liveUrl = normalizeUrl(project.liveUrl);
    }
  });

  data.updateProjects?.forEach((project) => {
    if (project.title !== undefined) {
      project.title = normalizeText(project.title);
    }

    if (project.description !== undefined) {
      project.description = normalizeText(project.description);
    }

    if (project.techStack !== undefined) {
      project.techStack = normalizeText(project.techStack);
    }

    if (project.githubUrl !== undefined) {
      project.githubUrl = normalizeUrl(project.githubUrl);
    }

    if (project.liveUrl !== undefined) {
      project.liveUrl = normalizeUrl(project.liveUrl);
    }
  });

  data.addCertificates?.forEach((cert) => {
    cert.title = normalizeText(cert.title);
    cert.issuer = normalizeText(cert.issuer);

    if (cert.certificateUrl !== undefined) {
      cert.certificateUrl = normalizeUrl(cert.certificateUrl);
    }
  });

  data.updateCertificates?.forEach((cert) => {
    if (cert.title !== undefined) {
      cert.title = normalizeText(cert.title);
    }

    if (cert.issuer !== undefined) {
      cert.issuer = normalizeText(cert.issuer);
    }

    if (cert.certificateUrl !== undefined) {
      cert.certificateUrl = normalizeUrl(cert.certificateUrl);
    }
  });

  const addSkillIds = data.addSkillIds ?? [];
  const removeSkillIds = data.removeSkillIds ?? [];
  const allSkillIds = [...addSkillIds, ...removeSkillIds];

  if (allSkillIds.length) {
    const skills = await getSkillsByIds(allSkillIds);

    const foundIds = skills.map((s) => s.id);

    const missing = allSkillIds.filter((id) => !foundIds.includes(id));

    if (missing.length) {
      throw new Error(`Invalid skill IDs: ${missing.join(", ")}`);
    }
  }

  return updateStudent(userId, data);
};

export const applicationActionService = async (
  userId: number,
  applicationId: number,
  action: "ACCEPT" | "REJECT",
) => {
  const student = await getStudentByUserId(userId);

  if (!student) {
    throw new Error("Student profile not found");
  }

  const application = await getApplicationByIdAndStudent(
    applicationId,
    student.id,
  );

  if (!application) {
    throw new Error("Application not found or unauthorized");
  }

  if (application.status !== "SELECTED") {
    throw new Error("Only selected applications can be acted upon");
  }

  if (action === "ACCEPT") {
    if (student.isPlaced) {
      throw new Error("You have already accepted an offer");
    }

    await acceptApplication(applicationId);

    await withdrawOtherApplications(student.id, applicationId);

    await markStudentPlaced(student.id);

    return { type: "ACCEPTED", applicationId };
  }

  if (action === "REJECT") {
    await withdrawApplication(applicationId);

    return { type: "REJECTED", applicationId };
  }

  throw new Error("Invalid action");
};
