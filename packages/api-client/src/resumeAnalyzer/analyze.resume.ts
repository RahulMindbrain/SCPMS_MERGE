import axios from "axios";

interface AnalyzeResumePayload {
  resumeUrl: string;
  jobDescription: string;
}

export const analyzeResumeAgainstJD = async (payload: AnalyzeResumePayload) => {
  const response = await axios.post(
    `${process.env.RESUME_ANALYZER_URL}/integration/analyze-jd-match`,
    payload,
  );

  return response.data;
};
