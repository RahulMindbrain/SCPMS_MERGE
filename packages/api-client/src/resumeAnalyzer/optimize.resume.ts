import axios from "axios";

interface OptimizeResumePayload {
  resumeUrl: string;
  jobDescription: string;
}

export const optimizeResumeAgainstJD = async (
  payload: OptimizeResumePayload,
) => {
  const baseUrl = process.env.RESUME_ANALYZER_URL;

  if (!baseUrl) {
    throw new Error("RESUME_ANALYZER_URL is not defined");
  }

  const response = await axios.post(
    `${baseUrl}/integration/optimize-resume`,
    payload,
  );

  return response.data;
};
