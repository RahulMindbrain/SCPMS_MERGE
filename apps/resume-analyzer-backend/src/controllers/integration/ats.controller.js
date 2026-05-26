const {
  extractTextFromPdf,
  analyzeResumeText,
} = require("../../services/resumeAnalysis.service");

const analyzeJDMatch = async (req, res) => {
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

    const analysisData = await analyzeResumeText(extractedText, jobDescription);

    // console.log("ATS ANALYSIS DATA:", analysisData);

    return res.json({
      success: true,

      atsScore: analysisData.atsScore,

      suggestions: analysisData.suggestions,

      missingSkills: analysisData.keywordsMissing,

      topStrengths: analysisData.topStrengths,

      weaknesses: analysisData.weaknesses,
    });
  } catch (error) {
    console.error("[ATS Integration Error]", error.message);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  analyzeJDMatch,
};
