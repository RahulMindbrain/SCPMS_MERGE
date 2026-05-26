const prisma = require("../../prisma/client");
const { emitEvent } = require("../../utils/socket");

const applyToJob = async (req, res) => {
    try {
        const { jobId, resumeId } = req.body;
        const userId = req.userId || req.user?.id || req.user?._id;

        console.log(`[Apply] Request: User ${userId} applying to Job ${jobId} with Resume ${resumeId}`);

        if (!jobId || !resumeId) {
            console.error("[Apply] Error: Missing jobId or resumeId");
            return res.status(400).json({ error: "jobId and resumeId are required" });
        }

        if (!userId) {
            console.error("[Apply] Error: Missing userId in request");
            return res.status(401).json({ error: "User unauthorized" });
        }

        // Step 0: Check if job is hired
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (job?.isHired) {
            return res.status(400).json({ error: "This job is no longer accepting applications." });
        }

        // Step 1: Check if already applied
        const existing = await prisma.application.findFirst({
            where: {
                userId,
                jobId
            }
        });

        if (existing) {
            return res.status(400).json({ error: "You have already applied for this job" });
        }

        // Step 2: Create application record
        const application = await prisma.application.create({
            data: {
                userId,
                jobId,
                resumeId,
                status: "Applied"
            }
        });

        console.log(`[Apply] Success: User ${userId} applied to Job ${jobId} with Resume ${resumeId}`);
        emitEvent("application_submitted", { jobId, userId, applicationId: application.id });
        res.json({ success: true, application });

    } catch (err) {
        console.error("[Apply Error]", err.message);
        res.status(500).json({ error: "Failed to apply for job: " + err.message });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id || req.user?._id;
        const applications = await prisma.application.findMany({
            where: { userId },
            include: {
                job: true,
                resume: {
                    include: { analysis: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getJobApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;
        console.log(`[GetApplicants] Fetching candidates for Job ID: ${jobId}`);

        const applications = await prisma.application.findMany({
            where: { jobId },
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                },
                resume: {
                    include: { analysis: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        console.log(`[GetApplicants] Successfully retrieved ${applications.length} applications for Job ${jobId}`);
        res.json({ success: true, applications });
    } catch (err) {
        console.error(`[GetApplicants Error] Job ${req.params.jobId}:`, err.message);
        res.status(500).json({ error: "Failed to fetch applicants: " + err.message });
    }
};

module.exports = {
    applyToJob,
    getMyApplications,
    getJobApplicants
};
