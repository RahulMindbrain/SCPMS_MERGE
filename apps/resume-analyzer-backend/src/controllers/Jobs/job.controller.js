const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { emitEvent } = require("../../utils/socket");
const { extractTextFromPdf, extractTextFromDocx, extractStructuredJDText } = require("../../services/resumeAnalysis.service");



//   Create Job
exports.createJob = async (req, res) => {
  try {
    const { title, company, location, description, type, experience, requirements, responsibilities, tags, salary, jdSource, jdText } = req.body;

    let finalDescription = description || jdText || "";
    let finalJdText = jdText || "";

    if (req.file) {
      const { buffer, originalname } = req.file;
      try {
        if (originalname.toLowerCase().endsWith(".pdf")) {
          finalJdText = await extractTextFromPdf(buffer);
        } else if (originalname.toLowerCase().endsWith(".docx")) {
          finalJdText = await extractTextFromDocx(buffer);
        }

        // If finalDescription was empty, use extracted text
        if (!finalDescription) finalDescription = finalJdText;
      } catch (err) {
        console.error("JD Extraction failed:", err.message);
        // Fallback to manual entry if extraction fails, or we could return error
      }
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
        location,
        description: finalDescription,
        type: type || "Full-time",
        experience,
        requirements,
        responsibilities,
        skillsRequired: tags || [], // frontend sends 'tags'
        salary,
        userId: req.userId || req.user?.id || req.user?._id,
        jdSource: jdSource || (req.file ? "FILE" : "MANUAL"),
        jdText: finalJdText || finalDescription
      }
    });


    res.status(201).json(job);
    emitEvent("job_updated", { action: "create", id: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   Get All Jobs  
exports.getJobs = async (req, res) => {
  try {
    const { search, skill } = req.query;
    const currentUserId = req.userId || req.user?.id || req.user?._id;
    const isValidId = currentUserId && /^[0-9a-fA-F]{24}$/.test(currentUserId);

    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          search
            ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } }
              ]
            }
            : {},
          skill
            ? {
              skillsRequired: { has: skill }
            }
            : {}
        ]
      },
      include: {
        _count: {
          select: { applications: true }
        },
        ...(isValidId ? {
          applications: {
            where: { userId: currentUserId },
            select: { id: true }
          }
        } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    const jobsWithStatus = jobs.map(j => ({
      ...j,
      isApplied: isValidId ? (j.applications?.length > 0) : false
    }));

    res.json(jobsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   Get Single Job
exports.getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   Update Job
exports.updateJob = async (req, res) => {
  try {
    const { tags, ...rest } = req.body;
    const data = { ...rest };
    if (tags) data.skillsRequired = tags;

    // Handle JD file update if needed (optional, but good for completeness)
    if (req.file) {
      const { buffer, originalname } = req.file;
      try {
        let extracted = "";
        if (originalname.toLowerCase().endsWith(".pdf")) {
          extracted = await extractTextFromPdf(buffer);
        } else if (originalname.toLowerCase().endsWith(".docx")) {
          extracted = await extractTextFromDocx(buffer);
        }
        data.jdText = extracted;
        data.jdSource = "FILE";
        if (!data.description) data.description = extracted;
      } catch (err) {
        console.error("JD Extraction failed:", err.message);
      }
    }

    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: data
    });


    res.json(job);
    emitEvent("job_updated", { action: "update", id: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   Delete Job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Manual Cascade: Delete related applications first
    await prisma.application.deleteMany({
      where: { jobId: id }
    });

    await prisma.job.delete({
      where: { id: id }
    });

    res.json({ message: "Job and related applications deleted successfully" });
    emitEvent("job_updated", { action: "delete", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Get My Jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Hired Status
exports.toggleJobHiredStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) return res.status(404).json({ message: "Job not found" });

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { isHired: !job.isHired }
    });

    res.json({ success: true, job: updatedJob });
    emitEvent("job_updated", { action: "toggle_hired", id: updatedJob.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.extractJDText = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { buffer, originalname } = req.file;
    let extractedText = '';

    if (originalname.toLowerCase().endsWith('.pdf')) {
      extractedText = await extractTextFromPdf(buffer);
    } else if (originalname.toLowerCase().endsWith('.docx')) {
      extractedText = await extractTextFromDocx(buffer);
    } else if (originalname.toLowerCase().endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Invalid file type. Please upload PDF, DOCX, or TXT.' });
    }


    // Check if user wants structured data (detailed extraction)
    const { structured } = req.query;
    if (structured === 'true') {
      const { extractStructuredJDText } = require("../../services/resumeAnalysis.service");
      const structuredData = await extractStructuredJDText(extractedText);
      return res.json(structuredData);
    }

    res.json({ text: extractedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

