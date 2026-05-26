const prisma = require("../../prisma/client");

const analyzeResume = async (req, res) => {
  try {
    const { resumeId } = req.body;

    const atsScore = Math.floor(Math.random() * 100);
    const keywordsMissing = Math.floor(Math.random() * 50);
    const jobsMatched = Math.floor(Math.random() * 50);
    const aiFeedback = [
      "Use more action verbs in the experience section.",
      "Include measurable achievements for each project.",
      "Match keywords exactly from the job description."
    ];
    const skillsExtracted = [
      "Node.js",
      "Express",
      "MongoDB",
      "Prisma"
    ];

    const analysis = await prisma.analysis.create({
      data: {
        resumeId,
        atsScore,
        keywordsMissing,
        jobsMatched,
        suggestions: aiFeedback,
        trends: skillsExtracted
      },
    });

    res.json({
      ...analysis,
      aiFeedback,
      skillExtraction: skillsExtracted,
      jobMatch: jobsMatched
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { analyzeResume };  