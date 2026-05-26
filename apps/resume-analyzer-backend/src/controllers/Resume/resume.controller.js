// const prisma = require("../../prisma/client");


// // Upload Resume
// const uploadResume = async (req, res) => {
//   try {
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ error: "File is required" });
//     }

//     const resume = await prisma.resume.create({
//       data: {
//         userId: req.userId,
//         fileUrl: file.path,
//         fileName: file.originalname,
//       },
//     });

//     res.json(resume);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // Match Resume
// const matchResume = async (req, res) => {
//   try {
//     const { resumeId, jobDescription } = req.body;

//     if (!resumeId || !jobDescription) {
//       return res.status(400).json({
//         error: "resumeId and jobDescription are required",
//       });
//     }

//     const resume = await prisma.resume.findUnique({
//       where: { id: resumeId },
//       include: { analysis: true },
//     });

//     if (!resume) {
//       return res.status(404).json({ error: "Resume not found" });
//     }

//     const text = jobDescription.toLowerCase();

//     const knownSkills = [
//       "node.js",
//       "react",
//       "mongodb",
//       "prisma",
//       "express",
//       "aws",
//       "docker",
//       "typescript",
//       "python",
//     ];

//     const matchedSkills = knownSkills.filter((skill) =>
//       text.includes(skill.replace(".", ""))
//     );

//     const jobMatchScore = Math.min(
//       100,
//       Math.round(
//         (resume.analysis?.jobsMatched || 0) * 1.2 +
//         matchedSkills.length * 10
//       )
//     );

//     return res.json({
//       resumeId,
//       jobDescription,
//       jobMatch: jobMatchScore,
//       matchedSkills,
//       recommendedRoles: [
//         "Full Stack Developer",
//         "Backend Engineer",
//         "Software Engineer",
//       ],
//       aiFeedback: resume.analysis?.suggestions || [],
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// //  Get Resume Feedback
// const getResumeFeedback = async (req, res) => {
//   try {
//     const resumeId = req.query.resumeId;

//     if (!resumeId) {
//       return res.status(400).json({
//         error: "resumeId query parameter is required",
//       });
//     }

//     const resume = await prisma.resume.findUnique({
//       where: { id: resumeId },
//       include: { analysis: true },
//     });

//     if (!resume) {
//       return res.status(404).json({ error: "Resume not found" });
//     }

//     if (!resume.analysis) {
//       return res.status(404).json({
//         error: "Analysis not available for this resume",
//       });
//     }

//     const analysis = resume.analysis;

//     return res.json({
//       resumeId,
//       atsScore: analysis.atsScore,
//       keywordsMissing: analysis.keywordsMissing,
//       jobsMatched: analysis.jobsMatched,
//       jobMatch: analysis.jobsMatched,
//       aiFeedback: analysis.suggestions || [],
//       skillExtraction: analysis.trends || [],
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// //  Re-analyze Resume
// const reanalyzeResume = async (req, res) => {
//   try {
//     const { resumeId, jobDescription } = req.body;

//     if (!resumeId || !jobDescription) {
//       return res.status(400).json({
//         error: "resumeId and jobDescription are required",
//       });
//     }

//     const resume = await prisma.resume.findUnique({
//       where: { id: resumeId },
//       include: { analysis: true },
//     });

//     if (!resume) {
//       return res.status(404).json({ error: "Resume not found" });
//     }

//     const text = jobDescription.toLowerCase();

//     const knownSkills = [
//       "node.js",
//       "react",
//       "mongodb",
//       "prisma",
//       "express",
//       "aws",
//       "docker",
//       "typescript",
//       "python",
//     ];

//     const matchedSkills = knownSkills.filter((skill) =>
//       text.includes(skill.replace(".", ""))
//     );

//     const missingSkills = knownSkills.filter(
//       (skill) => !matchedSkills.includes(skill)
//     );

//     const atsScore = Math.min(100, matchedSkills.length * 12);

//     const feedback = missingSkills.length
//       ? [`Consider adding: ${missingSkills.slice(0, 3).join(", ")}`]
//       : ["Great match with job description"];

//     let updatedAnalysis;

//     if (resume.analysis) {
//       updatedAnalysis = await prisma.analysis.update({
//         where: { id: resume.analysis.id },
//         data: {
//           atsScore,
//           keywordsMissing: missingSkills,
//           jobsMatched: matchedSkills.length,
//           suggestions: feedback,
//           trends: matchedSkills,
//         },
//       });
//     } else {
//       updatedAnalysis = await prisma.analysis.create({
//         data: {
//           resumeId,
//           atsScore,
//           keywordsMissing: missingSkills,
//           jobsMatched: matchedSkills.length,
//           suggestions: feedback,
//           trends: matchedSkills,
//         },
//       });
//     }

//     return res.json({
//       success: true,
//       resumeId,
//       atsScore,
//       matchedSkills,
//       missingSkills,
//       feedback,
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get all resumes for the authenticated user
// const getMyResumes = async (req, res) => {
//   try {
//     const resumes = await prisma.resume.findMany({
//       where: { userId: req.userId },
//       include: {
//         analysis: true,
//         user: {
//           select: {
//             name: true,
//             email: true,
//           },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     res.json({
//       success: true,
//       count: resumes.length,
//       resumes,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get single resume by ID
// const getResumeById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const resume = await prisma.resume.findFirst({
//       where: {
//         id: id,
//         userId: req.userId, // Ensure user owns this resume
//       },
//       include: {
//         analysis: true,
//         user: {
//           select: {
//             name: true,
//             email: true,
//           },
//         },
//       },
//     });

//     if (!resume) {
//       return res.status(404).json({ error: "Resume not found" });
//     }

//     res.json({
//       success: true,
//       resume,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete resume by ID
// const deleteResume = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if resume exists and belongs to user
//     const resume = await prisma.resume.findFirst({
//       where: {
//         id: id,
//         userId: req.userId,
//       },
//     });

//     if (!resume) {
//       return res.status(404).json({ error: "Resume not found" });
//     }

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   } finally {
//     await prisma.resume.delete({
//       where: { id },
//     }); // Delete resume after response to avoid delay
//     res.json({ success: true, message: "Resume deleted successfully" });              
//   }
// };

// module.exports = {
//   uploadResume,
//   matchResume,
//   getResumeFeedback,
//   reanalyzeResume,
//   getMyResumes,
//   getResumeById,
//   deleteResume
// };

const prisma = require("../../prisma/client");
const { emitEvent } = require("../../utils/socket");

//  Upload Resume
const uploadResume = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    const resume = await prisma.resume.create({
      data: {
        userId: req.userId,
        fileUrl: file.path,
        fileName: file.originalname,
      },
    });

    //   Create default analysis
    await prisma.analysis.create({
      data: {
        resumeId: resume.id,
        atsScore: 0,
        keywordsMissing: [],
        jobsMatched: 0,
        suggestions: [],
        trends: [],
      },
    });

    emitEvent("analysis_completed", { resumeId: resume.id, userId: req.userId, atsScore: 0 });

    res.json({ success: true, resume });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   Match Resume
const matchResume = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        error: "resumeId and jobDescription are required",
      });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.userId,
      },
      include: { analysis: true },
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const text = jobDescription.toLowerCase();

    const knownSkills = [
      "node.js",
      "react",
      "mongodb",
      "prisma",
      "express",
      "aws",
      "docker",
      "typescript",
      "python",
    ];

    const matchedSkills = knownSkills.filter(
      (skill) =>
        text.includes(skill) || text.includes(skill.replace(".", ""))
    );

    const jobMatchScore = Math.min(
      100,
      (resume.analysis?.jobsMatched || 0) * 1.2 +
      matchedSkills.length * 10
    );

    res.json({
      success: true,
      resumeId,
      jobMatch: Math.round(jobMatchScore),
      matchedSkills,
      recommendedRoles: [
        "Full Stack Developer",
        "Backend Engineer",
        "Software Engineer",
      ],
      aiFeedback: resume.analysis?.suggestions || [],
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   Get Resume Feedback
const getResumeFeedback = async (req, res) => {
  try {
    const { resumeId } = req.query;

    if (!resumeId) {
      return res.status(400).json({
        error: "resumeId query parameter is required",
      });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.userId,
      },
      include: { analysis: true },
    });

    if (!resume || !resume.analysis) {
      return res.status(404).json({
        error: "Analysis not available",
      });
    }

    const analysis = resume.analysis;

    res.json({
      success: true,
      resumeId,
      atsScore: analysis.atsScore,
      keywordsMissing: analysis.keywordsMissing,
      jobsMatched: analysis.jobsMatched,
      aiFeedback: analysis.suggestions,
      skillExtraction: analysis.trends,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Reanalyze Resume
const reanalyzeResume = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        error: "resumeId and jobDescription are required",
      });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.userId,
      },
      include: { analysis: true },
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const text = jobDescription.toLowerCase();

    const knownSkills = [
      "node.js",
      "react",
      "mongodb",
      "prisma",
      "express",
      "aws",
      "docker",
      "typescript",
      "python",
    ];

    const matchedSkills = knownSkills.filter(
      (skill) =>
        text.includes(skill) || text.includes(skill.replace(".", ""))
    );

    const missingSkills = knownSkills.filter(
      (skill) => !matchedSkills.includes(skill)
    );

    const atsScore = Math.min(100, matchedSkills.length * 12);

    const feedback = missingSkills.length
      ? [`Add skills: ${missingSkills.slice(0, 3).join(", ")}`]
      : ["Great match!"];

    let updatedAnalysis;

    if (resume.analysis) {
      updatedAnalysis = await prisma.analysis.update({
        where: { id: resume.analysis.id },
        data: {
          atsScore,
          keywordsMissing: missingSkills,
          jobsMatched: matchedSkills.length,
          suggestions: feedback,
          trends: matchedSkills,
        },
      });
    } else {
      updatedAnalysis = await prisma.analysis.create({
        data: {
          resumeId,
          atsScore,
          keywordsMissing: missingSkills,
          jobsMatched: matchedSkills.length,
          suggestions: feedback,
          trends: matchedSkills,
        },
      });
    }

    emitEvent("analysis_completed", { resumeId, userId: req.user.id, atsScore });

    res.json({
      success: true,
      resumeId,
      atsScore,
      matchedSkills,
      missingSkills,
      feedback,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 Get All Resumes
const getMyResumes = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      include: { analysis: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: resumes.length,
      resumes,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 Get Resume by ID
const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      include: { analysis: true },
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json({ success: true, resume });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑 Delete Resume
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    await prisma.analysis.deleteMany({
      where: { resumeId: id },
    });

    await prisma.resume.delete({
      where: { id },
    });

    emitEvent("resume_deleted", { id, userId: req.userId });

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
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