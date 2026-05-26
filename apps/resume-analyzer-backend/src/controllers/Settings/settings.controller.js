// const { prisma } = require("../../prisma/client");


// // 📤 EXPORT DATA
// const exportData = async (req, res) => {
//   try {
//     const userId = req.userId;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       include: {
//         resumes: {
//           include: { analysis: true }
//         }
//       }
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({ success: true, data: user });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // 📥 IMPORT DATA
// const importData = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const data = req.body;

//     if (!data || !Array.isArray(data.resumes)) {
//       return res.status(400).json({ error: "Invalid import data" });
//     }

//     for (const resume of data.resumes) {

//       // 🔥 IMPORTANT: ensure resume belongs to user
//       const savedResume = await prisma.resume.upsert({
//         where: { id: resume.id || undefined }, // prevent crash if id missing
//         update: {
//           fileUrl: resume.fileUrl,
//           fileName: resume.fileName,
//         },
//         create: {
//           userId,
//           fileUrl: resume.fileUrl,
//           fileName: resume.fileName,
//         },
//       });

//       // Analysis
//       if (resume.analysis) {
//         await prisma.analysis.upsert({
//           where: { resumeId: savedResume.id },
//           update: resume.analysis,
//           create: {
//             ...resume.analysis,
//             resumeId: savedResume.id,
//           },
//         });
//       }
//     }

//     res.json({ success: true, message: "Data imported successfully" });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // 🔄 RESET SETTINGS
// const resetSettings = async (req, res) => {
//   try {
//     const userId = req.userId;

//     await prisma.user.update({
//       where: { id: userId },
//       data: {
//         bio: null,
//         phone: null,
//         // add more default fields here
//       },
//     });

//     res.json({ success: true, message: "Settings reset to default" });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // 🚨 DELETE ALL DATA (VERY IMPORTANT API)
// const deleteAllData = async (req, res) => {
//   try {
//     const userId = req.userId;

//     // 1️⃣ Get all resumes
//     const resumes = await prisma.resume.findMany({
//       where: { userId },
//       select: { id: true }
//     });

//     const resumeIds = resumes.map(r => r.id);

//     // 2️⃣ Delete analysis first (relation dependency)
//     await prisma.analysis.deleteMany({
//       where: {
//         resumeId: { in: resumeIds }
//       }
//     });

//     // 3️⃣ Delete resumes
//     await prisma.resume.deleteMany({
//       where: { userId }
//     });

//     // 4️⃣ Optional: delete user OR keep account
//     await prisma.user.update({
//       where: { id: userId },
//       data: {
//         bio: null,
//         phone: null,
//       }
//     });

//     res.json({
//       success: true,
//       message: "All user data deleted successfully"
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// module.exports = {
//   exportData,
//   importData,
//   resetSettings,
//   deleteAllData
// };


const prisma = require("../../prisma/client");

//   EXPORT DATA
const exportData = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resumes: {
          include: { analysis: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, data: user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   IMPORT DATA
const importData = async (req, res) => {
  try {
    const userId = req.userId;
    const data = req.body;

    if (!data || !Array.isArray(data.resumes)) {
      return res.status(400).json({ error: "Invalid import data" });
    }

    for (const resume of data.resumes) {

      //   Prevent duplicates (optional but recommended)
      const existing = await prisma.resume.findFirst({
        where: {
          userId,
          fileName: resume.fileName,
        },
      });

      if (existing) continue;

      //  Create Resume
      const savedResume = await prisma.resume.create({
        data: {
          userId,
          fileUrl: resume.fileUrl,
          fileName: resume.fileName,
        },
      });

      //  Create Analysis 
      if (resume.analysis) {
        await prisma.analysis.create({
          data: {
            resumeId: savedResume.id,
            atsScore: resume.analysis.atsScore || 0,
            scoreBreakdown: resume.analysis.scoreBreakdown || {},
            keywordsMissing: resume.analysis.keywordsMissing || [],
            jobsMatched: resume.analysis.jobsMatched || 0,
            suggestions: resume.analysis.suggestions || [],
            trends: resume.analysis.trends || [],
          },
        });
      }
    }

    res.json({
      success: true,
      message: "Data imported successfully",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔄 RESET SETTINGS
const resetSettings = async (req, res) => {
  try {
    const userId = req.userId;

    await prisma.user.update({
      where: { id: userId },
      data: {
        bio: null,
        phone: null,
      },
    });

    res.json({
      success: true,
      message: "Settings reset to default",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚨 DELETE ALL DATA
const deleteAllData = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.user?.role;

    if (role === 'admin') {
      // 🚨 ADMIN PURGE: Delete EVERYTHING related to students
      await prisma.analysis.deleteMany({});
      await prisma.application.deleteMany({});
      await prisma.helpTicket.deleteMany({});
      await prisma.resume.deleteMany({});

      // Keep admins, delete students
      await prisma.user.deleteMany({
        where: { role: 'student' }
      });

      return res.json({
        success: true,
        message: "Platform has been purged. All students, resumes, and reports deleted."
      });
    }

    // STUDENT: Delete only their own data
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId },
      select: { id: true },
    });

    const resumeIds = resumes.map((r) => r.id);

    // Delete related analysis
    await prisma.analysis.deleteMany({
      where: {
        resumeId: { in: resumeIds },
      },
    });

    // Delete related applications
    await prisma.application.deleteMany({
      where: { userId }
    });

    // Delete related help tickets
    await prisma.helpTicket.deleteMany({
      where: { userId }
    });

    // Delete resumes
    await prisma.resume.deleteMany({
      where: { userId },
    });

    // Reset user profile fields
    await prisma.user.update({
      where: { id: userId },
      data: {
        bio: null,
        phone: null,
        github: null,
        twitter: null,
        linkedin: null
      },
    });

    res.json({
      success: true,
      message: "All account data deleted successfully",
    });

  } catch (err) {
    console.error(`[Delete All Data Error]:`, err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  exportData,
  importData,
  resetSettings,
  deleteAllData,
};
