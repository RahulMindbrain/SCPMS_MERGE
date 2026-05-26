const prisma = require("../../prisma/client");
const { uploadBufferToCloudinary } = require("../../config/cloudinary.config");
const {
  extractTextFromPdf,
  extractTextFromDocx,
  analyzeResumeText,
  generateCareerRoadmap,
} = require("../../services/resumeAnalysis.service");

const BASE_SKILLS = [
  "node.js",
  "react",
  "mongodb",
  "prisma",
  "express",
  "aws",
  "docker",
  "typescript",
  "python",
  "javascript",
  "sql",
  "html",
  "css",
  "tailwind",
];

async function saveAnalysis(resumeId, analysisData) {
  const data = {
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
    roadmap: analysisData.roadmap,
  };

  return prisma.analysis.upsert({
    where: { resumeId },
    update: data,
    create: {
      resumeId,
      ...data,
    },
  });
}

function fallbackJobMatch(jobDescription, resumeAnalysis) {
  const text = jobDescription.toLowerCase();
  const matchedSkills = BASE_SKILLS.filter((skill) =>
    text.includes(skill) || text.includes(skill.replace(".", ""))
  );
  const jobMatch = Math.min(
    100,
    (resumeAnalysis?.jobsMatched || 0) * 1.2 + matchedSkills.length * 10
  );
  return {
    jobMatch: Math.round(jobMatch),
    matchedSkills,
    recommendedRoles: [
      "Full Stack Developer",
      "Backend Engineer",
      "Software Engineer",
    ],
    aiFeedback: resumeAnalysis?.suggestions || [],
  };
}

const uploadResume = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File is required" });

    const userId = req.userId || req.user?.id || req.user?._id;
    console.log("[Upload] userId:", userId, "| file:", file.originalname);

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    // Step 1: Extract text from buffer BEFORE uploading to Cloudinary
    const isDocx = file.originalname.toLowerCase().endsWith(".docx");
    let extractedText = "";
    console.log(`[Upload] Starting extraction for ${file.originalname} (${file.size} bytes). Type: ${isDocx ? 'DOCX' : 'PDF'}`);

    try {
      extractedText = isDocx
        ? await extractTextFromDocx(file.buffer)
        : await extractTextFromPdf(file.buffer);

      console.log(`[Upload] Extraction complete. Text length: ${extractedText?.length || 0}`);
      if (extractedText) {
        console.log(`[Upload] Sample text: "${extractedText.substring(0, 50)}..."`);
      }
    } catch (extractErr) {
      console.error("[Upload] Text extraction failed:", extractErr.message);
      throw extractErr;
    }

    // Step 2: Upload buffer to Cloudinary (with graceful fallback)
    let fileUrl = "local://resume_pending_upload";
    try {
      const cloudResult = await uploadBufferToCloudinary(file.buffer, file.originalname);
      fileUrl = cloudResult.secure_url;
      console.log("[Upload] Cloudinary upload successful:", fileUrl);
    } catch (cloudErr) {
      console.error("[Upload] Cloudinary upload failed (using fallback):", cloudErr.message);
      // ✅ Graceful fallback: continue without cloud URL — text is still extracted and analysis will work
      // fileUrl stays as placeholder; user can view analysis results even if PDF preview won't work
    }

    // Step 3: Save resume to database
    const resume = await prisma.resume.create({
      data: {
        userId: userId,
        fileUrl: fileUrl,
        fileName: file.originalname,
        extractedText: extractedText,
      },
    });

    // Step 4: AI Analysis
    let analysisData;
    try {
      if (extractedText) {
        // Fetch user data for personalized analysis
        const user = await prisma.user.findUnique({ where: { id: userId } });

        analysisData = await analyzeResumeText(extractedText, null, {
          userType: user?.userType,
          targetRole: user?.targetRole,
          yearsOfExperience: user?.yearsOfExperience
        });


        // Step 4.5: Generate Career Roadmap
        console.log("[Upload] Generating Career Roadmap...");
        try {
          const roadmap = await generateCareerRoadmap(analysisData);
          analysisData.roadmap = roadmap;
        } catch (roadmapErr) {
          console.error("[Upload] Roadmap generation failed:", roadmapErr.message);
          analysisData.roadmap = null;
        }
      } else {
        throw new Error("No text extracted from resume");
      }
    } catch (analysisError) {
      console.error("[Upload] Analysis Validation Failed:", analysisError.message);

      // If it's a validation failure from our service, block the upload entirely
      if (analysisError.message?.includes("does not appear to be a professional resume") ||
        analysisError.message?.includes("valid resume payload") ||
        analysisError.message?.includes("Validation Error:")) {
        throw analysisError;
      }

      // For other technical errors, keep a fallback (though blocking is safer)
      analysisData = {
        atsScore: 0,
        keywordsMissing: [],
        jobsMatched: 0,
        suggestions: [`⚠️ Platform Error: ${analysisError.message}`],
        trends: [],
        summary: "Analysis failed due to a technical error.",
        skillsExtracted: [],
        experienceLevel: "N/A",
        topStrengths: [],
        weaknesses: [],
      };
    }

    await saveAnalysis(resume.id, analysisData);

    console.log("[Upload SUCCESS] Resume saved:", resume.id);
    res.json({ success: true, resume: { ...resume, extractedText }, analysis: analysisData });
  } catch (err) {
    console.error("[Upload ERROR]", err.message);

    // Clean, professional response for validation failures
    if (err.message?.includes("Validation Error:")) {
      return res.status(400).json({
        error: err.message.replace("Validation Error:", "").trim()
      });
    }

    res.status(500).json({ error: err.message });
  }
};

const matchResume = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ error: "resumeId and jobDescription are required" });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.userId },
      include: { analysis: true },
    });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    res.json({ success: true, resumeId, ...fallbackJobMatch(jobDescription, resume.analysis) });
  } catch (err) {
    if (err.message?.includes("Validation Error:")) {
      return res.status(400).json({ error: err.message.replace("Validation Error:", "").trim() });
    }
    res.status(500).json({ error: err.message });
  }
};

const getResumeFeedback = async (req, res) => {
  try {
    const { resumeId } = req.query;
    if (!resumeId) return res.status(400).json({ error: "resumeId query parameter is required" });

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.userId },
      include: { analysis: true },
    });
    if (!resume || !resume.analysis) return res.status(404).json({ error: "Analysis not available" });

    res.json({
      success: true,
      resumeId,
      atsScore: resume.analysis.atsScore,
      keywordsMissing: resume.analysis.keywordsMissing,
      jobsMatched: resume.analysis.jobsMatched,
      aiFeedback: resume.analysis.suggestions,
      skillExtraction: resume.analysis.trends,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reanalyzeResume = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ error: "resumeId and jobDescription are required" });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.userId },
      include: { analysis: true },
    });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    let extractedText = resume.extractedText;
    if (!extractedText) {
      const isDocx = resume.fileUrl.toLowerCase().endsWith(".docx");
      extractedText = isDocx
        ? await extractTextFromDocx(resume.fileUrl) // Note: Docx extraction might need a buffer, but re-analyzing might need a download if buffer is gone
        : await extractTextFromPdf(resume.fileUrl);

      await prisma.resume.update({ where: { id: resume.id }, data: { extractedText } });
    }

    // Fetch user data for personalized analysis
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    analysisData = await analyzeResumeText(extractedText, jobDescription, {
      userType: user?.userType,
      targetRole: user?.targetRole,
      yearsOfExperience: user?.yearsOfExperience
    });

    // Generate Roadmap
    console.log("[Reanalyze] Generating Career Roadmap...");
    try {
      const roadmap = await generateCareerRoadmap(analysisData);
      analysisData.roadmap = roadmap;
    } catch (roadmapErr) {
      console.error("[Reanalyze] Roadmap generation failed:", roadmapErr.message);
    }

    await saveAnalysis(resume.id, analysisData);
    res.json({ success: true, resumeId, analysis: analysisData });
  } catch (err) {
    if (err.message?.includes("Validation Error:")) {
      return res.status(400).json({ error: err.message.replace("Validation Error:", "").trim() });
    }
    res.status(500).json({ error: err.message });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      include: { analysis: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: req.userId },
      include: { analysis: true },
    });
    if (!resume) return res.status(404).json({ error: "Resume not found" });
    res.json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?.id || req.user?._id;

    console.log(`[Delete Operation] Initiated for Resume ID: ${id} by User ID: ${userId}`);

    if (!id) {
      return res.status(400).json({ error: "Missing resume ID" });
    }

    // 1. Find the resume first to verify ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });

    if (!resume) {
      console.warn(`[Delete FAIL] Resume ${id} not found or unauthorized for user ${userId}`);
      return res.status(404).json({ error: "Resume not found or you don't have permission to delete it" });
    }

    // 2. Delete associated analysis records first
    const deletedAnalysis = await prisma.analysis.deleteMany({
      where: { resumeId: id }
    });
    console.log(`[Delete Info] Cleaned up ${deletedAnalysis.count} associated analysis records.`);

    // 3. Delete the resume
    await prisma.resume.delete({
      where: { id: id }
    });

    console.log(`[Delete SUCCESS] Successfully removed resume ${id} and all related data.`);
    res.json({ success: true, message: "Resume and analysis deleted successfully" });

  } catch (err) {
    console.error(`[Delete CRITICAL ERROR] Failed to delete resume ${req.params.id}:`, err);
    res.status(500).json({
      error: "Failed to delete resume",
      details: err.message,
      code: "DELETE_FAILED"
    });
  }
};

module.exports = {
  uploadResume,
  matchResume,
  getResumeFeedback,
  reanalyzeResume,
  getMyResumes,
  getResumeById,
  deleteResume,
};
