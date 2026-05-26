import { optimizeResumeAgainstJD } from "@repo/api-client";

export const optimizeStudentResume = async (
  student: any,
  jobUniversity: any,
) => {
  if (!student.resumeUrl) {
    throw new Error("Resume not uploaded");
  }

  if (!jobUniversity.description) {
    throw new Error("Job description missing");
  }

  console.log("CALLING OPTIMIZATION API");

  const optimizedResume = await optimizeResumeAgainstJD({
    resumeUrl: student.resumeUrl,

    jobDescription: jobUniversity.description,
  });

  //   console.log("OPTIMIZED RESUME:", optimizedResume);

  return optimizedResume;
};
