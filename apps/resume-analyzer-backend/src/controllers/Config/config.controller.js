const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();



// --- System Config (Maintenance Mode, etc.) ---

exports.getSystemConfig = async (req, res) => {
    try {
        let config = await prisma.systemConfig.findFirst();
        if (!config) {
            config = await prisma.systemConfig.create({
                data: { maintenanceMode: false }
            });
        }
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSystemConfig = async (req, res) => {
    try {
        const { maintenanceMode } = req.body;
        const existing = await prisma.systemConfig.findFirst();

        let config;
        if (existing) {
            config = await prisma.systemConfig.update({
                where: { id: existing.id },
                data: { maintenanceMode }
            });
        } else {
            config = await prisma.systemConfig.create({
                data: { maintenanceMode }
            });
        }
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// --- Prompts Management ---


exports.getPrompts = async (req, res) => {
    try {
        const prompts = await prisma.aIPrompt.findMany();
        res.json({ success: true, prompts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePrompt = async (req, res) => {
    try {
        const { key } = req.params;
        const { content, isActive } = req.body;

        const prompt = await prisma.aIPrompt.upsert({
            where: { key },
            update: { content, isActive },
            create: { key, content, isActive: isActive ?? true }
        });

        res.json({ success: true, prompt });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Job Tracks Management ---

exports.getTracks = async (req, res) => {
    try {
        const tracks = await prisma.jobTrack.findMany({
            where: { isActive: true }
        });
        res.json({ success: true, tracks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTrack = async (req, res) => {
    try {
        const { name, skills } = req.body;
        const track = await prisma.jobTrack.create({
            data: { name, skills, isActive: true }
        });
        res.json({ success: true, track });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTrack = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, skills, isActive } = req.body;

        const track = await prisma.jobTrack.update({
            where: { id },
            data: { name, skills, isActive }
        });

        res.json({ success: true, track });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTrack = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.jobTrack.update({
            where: { id: id },
            data: { isActive: false }
        });
        res.json({ success: true, message: "Track deactivated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Platform Purge (Clear DB) ---

exports.purgePlatformData = async (req, res) => {
    try {
        // 1. Delete all dependencies first
        await prisma.analysis.deleteMany({});
        await prisma.application.deleteMany({});
        await prisma.helpTicket.deleteMany({});
        await prisma.resume.deleteMany({});

        // 2. Delete all students, but keep admins
        await prisma.user.deleteMany({
            where: { role: "student" }
        });

        res.json({
            success: true,
            message: "Platform has been purged. All students, resumes, and reports deleted."
        });
    } catch (error) {
        console.error("[Purge Error]", error);
        res.status(500).json({ error: error.message });
    }
};

