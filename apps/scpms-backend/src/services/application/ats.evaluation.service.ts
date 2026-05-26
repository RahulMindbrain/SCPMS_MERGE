import { analyzeResumeAgainstJD } from "@repo/api-client";

export const evaluateATSForApplication = async (
  student: any,
  jobUniversity: any,
) => {
  console.log("student :", student);
  console.log("jobUniversity :", jobUniversity);
  if (!student.resumeUrl) {
    throw new Error("Resume not uploaded");
  }

  if (!jobUniversity.description) {
    throw new Error("Job description missing");
  }

  const atsResult = await analyzeResumeAgainstJD({
    resumeUrl: student.resumeUrl,

    jobDescription: jobUniversity.description,
  });

  return atsResult;
};
