const {
  extractTextFromPdf,
  extractResumeData,
  optimizeResumeForJD,
} = require("../../services/resumeAnalysis.service");

const optimizeResume = async (req, res) => {
  try {
    const { resumeUrl, jobDescription } = req.body;

    if (!resumeUrl || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "resumeUrl and jobDescription are required",
      });
    }

    const extractedText = await extractTextFromPdf(resumeUrl);

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        error: "Unable to extract resume text",
      });
    }

    const structuredResume = await extractResumeData(extractedText);

    const optimizedResume = await optimizeResumeForJD(
      structuredResume,
      jobDescription,
    );

    return res.json({
      success: true,
      optimizedResume,
    });
  } catch (error) {
    console.error("[Resume Optimization Error]", error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  optimizeResume,
};
