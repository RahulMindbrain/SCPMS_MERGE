const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET FAQS
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany();

    return res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- CREATE TICKET ----------------
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, subject, and message are required",
      });
    }

    const ticket = await prisma.helpTicket.create({
      data: {
        userId,
        subject,
        message,
      },
    });

    return res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- GET USER TICKETS ----------------
exports.getTickets = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const tickets = await prisma.helpTicket.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- ADMIN: GET ALL TICKETS ----------------
exports.adminGetAllTickets = async (req, res) => {
  try {
    console.log("[Support Fix] Fetching all tickets for admin...");
    const tickets = await prisma.helpTicket.findMany({
      include: {
        user: {
          select: { name: true, email: true, profilePic: true }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`[Support Fix] Found ${tickets.length} tickets.`);

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("[Support Fix] Error in adminGetAllTickets:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- ADMIN: UPDATE TICKET (Reply/Resolve) ----------------
exports.adminUpdateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;

    const ticket = await prisma.helpTicket.update({
      where: { id },
      data: {
        reply,
        status: status || "RESOLVED"
      },
    });

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- ADMIN: CREATE FAQ ----------------
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required",
      });
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
      },
    });

    return res.status(201).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- ADMIN: DELETE FAQ ----------------
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.faq.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
