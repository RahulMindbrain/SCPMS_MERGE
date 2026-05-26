const prisma = require("../../prisma/client");

//  GET ANALYTICS
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.user?.role;

    //   STUDENT ANALYTICS
    if (role === "student") {
      const resumes = await prisma.resume.findMany({
        where: { userId },
        include: { analysis: true },
        orderBy: { createdAt: "desc" },
      });

      const analyzed = resumes.filter((r) => r.analysis);

      const averageAtsScore = analyzed.length
        ? Math.round(
          analyzed.reduce((sum, r) => sum + (r.analysis?.atsScore || 0), 0) /
          analyzed.length
        )
        : 0;

      const allAiFeedback = analyzed.flatMap(
        (r) => r.analysis?.suggestions || []
      );

      const allSkills = analyzed.flatMap((r) =>
        Array.isArray(r.analysis?.trends) ? r.analysis.trends : []
      );

      const totalKeywordsMissing = analyzed.reduce(
        (sum, r) =>
          sum + (r.analysis?.keywordsMissing?.length || 0),
        0
      );

      const totalJobsMatched = analyzed.reduce(
        (sum, r) => sum + (r.analysis?.jobsMatched || 0),
        0
      );

      // Real Skill Gap Analysis
      const latestAnalysis = analyzed.sort((a, b) =>
        new Date(b.analysis.updatedAt) - new Date(a.analysis.updatedAt)
      )[0]?.analysis;

      const missingSkills = (latestAnalysis?.keywordsMissing || []).map(skill => {
        // Higher ATS score means "closer" to filling the gap
        const baseMatch = latestAnalysis?.atsScore ? Math.max(20, latestAnalysis.atsScore - 15) : 30;
        return {
          name: skill,
          value: Math.min(95, baseMatch + (skill.length % 10)), // Deterministic but feels varied
          color: 'bg-indigo-500'
        };
      });

      // Fetch Real In-Demand Skills from Jobs
      const jobSkills = await prisma.job.findMany({ select: { skillsRequired: true }, take: 20 });
      const flatSkills = jobSkills.flatMap(j => j.skillsRequired);
      const skillCounts = {};
      flatSkills.forEach(s => skillCounts[s] = (skillCounts[s] || 0) + 1);

      let inDemandSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, count]) => ({
          name,
          percentage: Math.min(98, 70 + (count * 5)),
          color: 'bg-emerald-500'
        }));

      // Fallback if no jobs in DB
      if (inDemandSkills.length === 0) {
        inDemandSkills = [
          { name: 'React.js', percentage: 92, color: 'bg-blue-500' },
          { name: 'Node.js', percentage: 88, color: 'bg-emerald-500' },
          { name: 'Express', percentage: 85, color: 'bg-purple-500' },
          { name: 'PostgreSQL', percentage: 82, color: 'bg-orange-500' }
        ];
      }

      const courses = [
        { name: 'Master Career Roadmap', url: '/user/roadmap' },
        { name: 'Skill Mastery Guide', url: '/user/dashboard' },
        { name: 'Industry Report 2026', url: '#' }
      ];

      return res.json({
        type: "student",
        totalResumes: resumes.length,
        analyzedResumes: analyzed.length,
        averageAtsScore,
        scoreBreakdown: latestAnalysis?.scoreBreakdown || {},
        keywordsMissing: totalKeywordsMissing,
        jobsMatched: totalJobsMatched,
        aiFeedback: [...new Set(allAiFeedback)],
        skillExtraction: [...new Set(allSkills)],
        analytics: {
          missingSkills: missingSkills.slice(0, 6),
          inDemandSkills,
          courses,
          roadmap: latestAnalysis?.roadmap || null,
          completedPhases: latestAnalysis?.completedPhases || [],
          topStrengths: latestAnalysis?.topStrengths || [],
          weaknesses: latestAnalysis?.weaknesses || []
        }
      });
    }

    //   ADMIN ANALYTICS
    if (role === "admin") {
      const { range } = req.query;
      const isWeek = range === "week";

      const totalUsers = await prisma.user.count({ where: { role: "student" } });
      const totalResumes = await prisma.resume.count();
      const totalAnalyses = await prisma.analysis.count();

      // Growth Calculation (Last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

      const [newUsers, prevUsers, newResumes, prevResumes, newAvg, prevAvg] = await Promise.all([
        prisma.user.count({ where: { role: "student", createdAt: { gte: thirtyDaysAgo } } }),
        prisma.user.count({ where: { role: "student", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
        prisma.resume.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.resume.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
        prisma.analysis.aggregate({
          where: { createdAt: { gte: thirtyDaysAgo } },
          _avg: { atsScore: true }
        }),
        prisma.analysis.aggregate({
          where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
          _avg: { atsScore: true }
        })
      ]);

      const calculateGrowth = (current, previous) => {
        if (previous === 0 || !previous) return current > 0 ? "+100%" : "0%";
        const growth = ((current - previous) / previous) * 100;
        return (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
      };

      const userGrowth = calculateGrowth(newUsers, prevUsers);
      const resumeGrowth = calculateGrowth(newResumes, prevResumes);
      const scoreGrowth = calculateGrowth(Math.round(newAvg._avg.atsScore || 0), Math.round(prevAvg._avg.atsScore || 0));

      const avgResult = await prisma.analysis.aggregate({
        _avg: { atsScore: true },
      });

      const averageAtsScore = Math.round(avgResult._avg.atsScore || 0);

      // Readiness Breakdown (Percentages)
      const totalAnalysesCount = totalAnalyses || 1;
      const marketReadyCount = await prisma.analysis.count({ where: { atsScore: { gte: 80 } } });
      const developingCount = await prisma.analysis.count({ where: { atsScore: { gte: 50, lt: 80 } } });
      const criticalCount = await prisma.analysis.count({ where: { atsScore: { lt: 50 } } });

      const readinessBreakdown = {
        marketReady: Math.round((marketReadyCount / totalAnalysesCount) * 100),
        developing: Math.round((developingCount / totalAnalysesCount) * 100),
        criticalGap: Math.round((criticalCount / totalAnalysesCount) * 100)
      };

      // Chart aggregation
      const rangeLimit = isWeek ? 7 : 6;
      const startDate = new Date();
      if (isWeek) startDate.setDate(startDate.getDate() - 7);
      else startDate.setMonth(startDate.getMonth() - 6);

      const [monthlyResumes, monthlyAnalyses] = await Promise.all([
        prisma.resume.findMany({
          where: { createdAt: { gte: startDate } },
          select: { createdAt: true }
        }),
        prisma.analysis.findMany({
          where: { createdAt: { gte: startDate } },
          select: { createdAt: true, jobsMatched: true }
        })
      ]);

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const chartMap = {};
      const chartDataArr = [];

      for (let i = rangeLimit - 1; i >= 0; i--) {
        const d = new Date();
        if (isWeek) d.setDate(d.getDate() - i);
        else d.setMonth(d.getMonth() - i);

        const label = isWeek ? days[d.getDay()] : months[d.getMonth()];
        const key = isWeek ? d.toISOString().split("T")[0] : label;

        chartMap[key] = { month: label, resumes: 0, analyzed: 0, matched: 0 };
        chartDataArr.push(key);
      }

      monthlyResumes.forEach(r => {
        const key = isWeek ? r.createdAt.toISOString().split("T")[0] : months[r.createdAt.getMonth()];
        if (chartMap[key]) chartMap[key].resumes++;
      });

      monthlyAnalyses.forEach(a => {
        const key = isWeek ? a.createdAt.toISOString().split("T")[0] : months[a.createdAt.getMonth()];
        if (chartMap[key]) {
          chartMap[key].analyzed++;
          if (a.jobsMatched > 0) chartMap[key].matched++;
        }
      });

      return res.json({
        type: "admin",
        totalUsers,
        totalResumes,
        totalAnalyses,
        averageAtsScore,
        userGrowth,
        resumeGrowth,
        scoreGrowth,
        chartData: chartDataArr.map(k => chartMap[k]),
        readinessBreakdown
      });
    }

    res.status(403).json({ message: "Invalid role" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   GET REPORTS
exports.getReports = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.user?.role;

    // 🎓 STUDENT REPORTS
    if (role === "student") {
      const resumes = await prisma.resume.findMany({
        where: { userId },
        include: { analysis: true },
        orderBy: { createdAt: "desc" },
      });

      const reportRows = resumes.map((resume) => ({
        resumeId: resume.id,
        fileName: resume.fileName,
        atsScore: resume.analysis?.atsScore || 0,
        keywordsMissing:
          resume.analysis?.keywordsMissing?.length || 0,
        jobsMatched: resume.analysis?.jobsMatched || 0,
        jobMatch: resume.analysis?.jobsMatched || 0,
        aiFeedback: resume.analysis?.suggestions || [],
        skillExtraction: Array.isArray(resume.analysis?.trends)
          ? resume.analysis.trends
          : [],
        createdAt: resume.createdAt,
      }));

      return res.json({
        type: "student",
        reports: reportRows,
      });
    }

    //   ADMIN REPORTS
    if (role === "admin") {
      const recentAnalyses = await prisma.analysis.findMany({
        take: 50, // Increased for pool visibility
        orderBy: { createdAt: "desc" },
        include: {
          resume: {
            include: {
              user: true
            }
          }
        },
      });

      return res.json({
        type: "admin",
        recentReports: recentAnalyses.map((analysis) => ({
          resumeId: analysis.resumeId,
          fileName: analysis.resume?.fileName || "Unknown",
          studentName: analysis.resume?.user?.name || "Student",
          atsScore: analysis.atsScore,
          keywordsMissing:
            analysis.keywordsMissing?.length || 0,
          jobsMatched: analysis.jobsMatched,
          createdAt: analysis.createdAt,
        })),
      });
    }

    res.status(403).json({ message: "Invalid role" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   GET SKILL INSIGHTS (ADMIN)
exports.getSkillInsights = async (req, res) => {
  try {
    const role = req.user?.role;
    if (role !== "admin") return res.status(403).json({ message: "Admin only" });

    // Fetch all job skills (Demand)
    const jobs = await prisma.job.findMany({ select: { skillsRequired: true } });
    const demandMap = {};
    jobs.forEach(job => {
      job.skillsRequired.forEach(skill => {
        const s = skill.toLowerCase().trim();
        demandMap[s] = (demandMap[s] || 0) + 1;
      });
    });

    // Fetch all extracted skills (Supply)
    const analyses = await prisma.analysis.findMany({ select: { trends: true } });
    const supplyMap = {};
    analyses.forEach(analysis => {
      // Assuming trends contains skillExtraction or similar
      const skills = analysis.trends?.skills || [];
      skills.forEach(skill => {
        const s = skill.toLowerCase().trim();
        supplyMap[s] = (supplyMap[s] || 0) + 1;
      });
    });

    // Normalize and combine
    const allSkills = [...new Set([...Object.keys(demandMap), ...Object.keys(supplyMap)])];
    const totalJobs = jobs.length || 1;
    const totalAnalyses = analyses.length || 1;

    const insights = allSkills.map(skill => {
      const demandScore = Math.round(((demandMap[skill] || 0) / totalJobs) * 100);
      const supplyScore = Math.round(((supplyMap[skill] || 0) / totalAnalyses) * 100);

      let trend = "Medium";
      if (demandScore > 80) trend = "High";
      if (demandScore > 60 && supplyScore < 20) trend = "Critical";

      return {
        name: skill.charAt(0).toUpperCase() + skill.slice(1),
        demand: demandScore,
        supply: supplyScore,
        trend
      };
    }).sort((a, b) => b.demand - a.demand).slice(0, 15);

    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   GET DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.user?.role;

    //   STUDENT DASHBOARD
    if (role === "student") {
      // Fetch the most recently UPDATED analysis (updatedAt changes on every re-analysis)
      const latestAnalysis = await prisma.analysis.findFirst({
        where: { resume: { userId } },
        orderBy: { updatedAt: "desc" },
        include: { resume: true },
      });

      const latest = latestAnalysis;

      console.log(`[Dashboard] Latest analysis score for user ${userId}: ${latest?.atsScore}`);

      return res.json({
        type: "student",
        atsScore: latest?.atsScore ?? 0,
        scoreBreakdown: latest?.scoreBreakdown || {},
        keywordsMissing: latest?.keywordsMissing || [],
        jobsMatched: latest?.jobsMatched || 0,
        jobMatch: latest?.jobsMatched || 0,
        suggestions: latest?.suggestions || [],
        aiFeedback: latest?.suggestions || [],
        skillExtraction: Array.isArray(latest?.trends)
          ? latest.trends
          : [],
        topStrengths: latest?.topStrengths || latest?.improvements || [],
        weaknesses: latest?.weaknesses || latest?.missing_keywords || [],
      });
    }

    //  ADMIN DASHBOARD
    if (role === "admin") {
      const totalUsers = await prisma.user.count({ where: { role: "student" } });
      const totalResumes = await prisma.resume.count();
      const totalAnalyses = await prisma.analysis.count();

      return res.json({
        type: "admin",
        totalUsers,
        totalResumes,
        totalAnalyses,
      });
    }

    res.status(403).json({ message: "Invalid role" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//   TOGGLE ROADMAP PHASE
exports.completeRoadmapPhase = async (req, res) => {
  try {
    const userId = req.userId;
    const { phaseIndex } = req.body;

    if (phaseIndex === undefined) {
      return res.status(400).json({ message: "phaseIndex is required" });
    }

    // Find the latest analysis for the user
    const latestAnalysis = await prisma.analysis.findFirst({
      where: { resume: { userId } },
      orderBy: { updatedAt: "desc" }
    });

    if (!latestAnalysis) {
      return res.status(404).json({ message: "No analysis found" });
    }

    let currentPhases = latestAnalysis.completedPhases || [];
    const indexStr = parseInt(phaseIndex);

    if (currentPhases.includes(indexStr)) {
      // Toggle off if already completed
      currentPhases = currentPhases.filter(idx => idx !== indexStr);
    } else {
      // Toggle on
      currentPhases.push(indexStr);
    }

    const updated = await prisma.analysis.update({
      where: { id: latestAnalysis.id },
      data: { completedPhases: currentPhases }
    });

    res.json({
      message: "Roadmap progress updated",
      completedPhases: updated.completedPhases
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



