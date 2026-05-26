const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllReports = async (req, res) => {
    try {
        const { startDate, endDate, range } = req.query;
        let where = {};

        if (startDate || endDate) {
            where.createdAt = {};
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && !isNaN(start.getTime())) where.createdAt.gte = start;
            if (end && !isNaN(end.getTime())) where.createdAt.lte = end;

            // If no valid dates were provided after all, remove the createdAt filter
            if (Object.keys(where.createdAt).length === 0) {
                delete where.createdAt;
            }
        } else if (range && range !== 'all') {
            const now = new Date();
            let start;
            if (range === '24h') start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            else if (range === '7d') start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            else if (range === '30d') start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            else if (range === '1y') start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

            if (start) {
                where.createdAt = { gte: start };
            }
        }

        // Fetch all analyses with filtering
        const analyses = await prisma.analysis.findMany({
            where,
            select: {
                id: true,
                resumeId: true,
                atsScore: true,
                summary: true,
                experienceLevel: true,
                jobsMatched: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get all unique resume IDs, filtering out any invalid ones
        const resumeIds = [...new Set(analyses.map(a => a.resumeId).filter(Boolean))];

        // 1. Fetch Resumes (Manual join to handle orphans gracefully)
        const resumes = resumeIds.length > 0 ? await prisma.resume.findMany({
            where: { id: { in: resumeIds } }
        }) : [];

        // 2. Fetch Users associated with these resumes
        const userIds = [...new Set(resumes.map(r => r.userId).filter(Boolean))];
        const users = userIds.length > 0 ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true }
        }) : [];

        // 3. Create maps for quick lookup
        const userMap = users.reduce((acc, user) => {
            acc[user.id.toString()] = user;
            return acc;
        }, {});

        const resumeMap = resumes.reduce((acc, resume) => {
            if (resume && resume.id) {
                const user = resume.userId ? userMap[resume.userId.toString()] : null;
                acc[resume.id.toString()] = {
                    ...resume,
                    user: user || { name: 'Unknown User', email: 'N/A' }
                };
            }
            return acc;
        }, {});

        // 4. Join Analysis -> Resume -> User
        const reports = analyses
            .map(analysis => {
                const resumeIdStr = analysis.resumeId ? analysis.resumeId.toString() : null;
                const resume = resumeIdStr ? resumeMap[resumeIdStr] : null;
                return {
                    ...analysis,
                    resume
                };
            })
            .filter(report => report.resume); // Skip reports where resume was totally missing

        res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};
