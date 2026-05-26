const prisma = require("../../prisma/client");
const { emitEvent } = require("../../utils/socket");

// Add Student (Creates a User with role 'student')
exports.createStudent = async (req, res) => {
  try {
    const { name, email, phone, course, password } = req.body;

    // Check if user already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: "Email already in use" });

    if (phone) {
      console.log(`[Student] Checking phone uniqueness for: "${phone}"`);
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        console.log(`[Student] Phone collision detected for: ${phone}`);
        return res.status(400).json({ message: "Mobile number already in use" });
      }
    }

    const student = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        course,
        password: password || "student123", // Default password if not provided
        role: "student",
        status: "Active"
      },
    });

    emitEvent("student_registered", { id: student.id, name: student.name });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Students with their average ATS scores
exports.getStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "student" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        course: true,
        status: true,
        github: true,
        linkedin: true,
        lastActive: true,
        updatedAt: true,
        resumes: {
          select: {
            analysis: {
              select: {
                atsScore: true,
              },
            },
          },
        },
      },
    });

    // Calculate average score for each student
    const formattedStudents = students.map(student => {
      const analyses = student.resumes
        .map(r => r.analysis)
        .filter(a => a != null);

      const avgScore = analyses.length > 0
        ? Math.round(analyses.reduce((sum, a) => sum + a.atsScore, 0) / analyses.length)
        : 0;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        course: student.course,
        status: student.status,
        github: student.github || null,
        linkedin: student.linkedin || null,
        score: avgScore,
        lastActive: student.lastActive || null,
        updatedAt: student.updatedAt || null,
      };
    });

    res.json(formattedStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await prisma.user.findFirst({
      where: { id: req.params.id, role: "student" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        course: true,
        status: true,
        github: true,
        linkedin: true,
        lastActive: true,
        updatedAt: true,
        resumes: {
          select: {
            id: true,
            fileUrl: true,
            fileName: true,
            createdAt: true,
            analysis: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Student
exports.updateStudent = async (req, res) => {
  try {
    const student = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(student);
    emitEvent("student_updated", { id: student.id });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id },
      include: { resumes: true }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Step-by-step cleanup of related records
    const resumeIds = student.resumes.map(r => r.id);
    if (resumeIds.length > 0) {
      await prisma.analysis.deleteMany({
        where: { resumeId: { in: resumeIds } }
      });
    }

    await prisma.resume.deleteMany({
      where: { userId: id }
    });

    await prisma.job.deleteMany({
      where: { userId: id }
    });

    await prisma.helpTicket.deleteMany({
      where: { userId: id }
    });

    await prisma.application.deleteMany({
      where: { userId: id }
    });

    await prisma.user.delete({
      where: { id },
    });

    emitEvent("student_deleted", { id });

    res.json({ message: "Student and all related data deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: error.message });
  }
};
