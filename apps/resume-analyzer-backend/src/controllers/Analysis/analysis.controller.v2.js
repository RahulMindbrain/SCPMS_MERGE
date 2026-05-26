const prisma = require("../../prisma/client");
const {
  analyzeResumeText,
  extractTextFromPdf,
  generateCareerRoadmap,
} = require("../../services/resumeAnalysis.service");

const analyzeResume = async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) return res.status(400).json({ error: "resumeId is required" });

    const userId = req.userId || req.user?.id;
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: userId },
    });

    if (!resume) {
      console.warn(`[Analysis] Resume not found or unauthorized: ${resumeId}`);
      return res.status(404).json({ error: "Resume not found" });
    }

    console.log(`[Analysis] Starting fresh analysis for resume: ${resumeId}`);

    const extractedText = resume.extractedText || (await extractTextFromPdf(resume.fileUrl));
    if (!resume.extractedText && extractedText) {
      await prisma.resume.update({ where: { id: resume.id }, data: { extractedText } });
    }

    if (!extractedText) {
      return res.status(400).json({ error: "Could not extract text from resume for analysis." });
    }

    // Allow dynamic overrides from the request body (set by the frontend modal)
    const { targetRole: dynamicRole, userType: dynamicUserType, yearsOfExperience: dynamicExp } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true, targetRole: true, yearsOfExperience: true }
    });

    const analysisData = await analyzeResumeText(extractedText, null, {
      userType: dynamicUserType || user?.userType,
      targetRole: dynamicRole || user?.targetRole,
      yearsOfExperience: dynamicExp || user?.yearsOfExperience
    });

    // Generate career roadmap
    let roadmap = null;
    try {
      roadmap = await generateCareerRoadmap(analysisData);
      analysisData.roadmap = roadmap;
    } catch (roadmapErr) {
      console.warn("[Analysis] Roadmap generation failed:", roadmapErr.message);
    }

    console.log(`[Analysis] AI returned score: ${analysisData.atsScore}`);

    const analysis = await prisma.analysis.upsert({
      where: { resumeId },
      update: {
        atsScore: analysisData.atsScore,
        scoreBreakdown: analysisData.scoreBreakdown || {},
        keywordsMissing: analysisData.keywordsMissing,
        jobsMatched: analysisData.jobsMatched,
        suggestions: analysisData.suggestions,
        trends: analysisData.trends,
        summary: analysisData.summary,
        experienceLevel: analysisData.experienceLevel,
        topStrengths: analysisData.topStrengths,
        weaknesses: analysisData.weaknesses,
        roadmap: roadmap,
      },
      create: {
        resumeId,
        atsScore: analysisData.atsScore,
        scoreBreakdown: analysisData.scoreBreakdown || {},
        keywordsMissing: analysisData.keywordsMissing,
        jobsMatched: analysisData.jobsMatched,
        suggestions: analysisData.suggestions,
        trends: analysisData.trends,
        summary: analysisData.summary,
        experienceLevel: analysisData.experienceLevel,
        topStrengths: analysisData.topStrengths,
        weaknesses: analysisData.weaknesses,
        roadmap: roadmap,
      },
    });

    res.json({
      success: true,
      ...analysis,
      ...analysisData,
      extractedText,
      skillExtraction: analysisData.skillsExtracted,
    });
  } catch (err) {
    console.error("[Analysis Error]", err.message);
    if (err.message?.includes("Validation Error:")) {
      return res.status(400).json({ error: err.message.replace("Validation Error:", "").trim() });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = { analyzeResume };
