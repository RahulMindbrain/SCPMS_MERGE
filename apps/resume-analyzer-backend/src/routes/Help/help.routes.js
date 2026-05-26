const express = require("express");
const router = express.Router();

const helpController = require("../../controllers/Help/help.controller");
const { protect, admin } = require("../../middleware/auth-middleware");

// GET FAQS (Publicly accessible by authenticated users)
router.get("/faqs", protect, helpController.getFaqs);

// CREATE TICKET
router.post("/ticket", protect, helpController.createTicket);

// GET USER TICKETS
router.get("/ticket/:userId", protect, helpController.getTickets);

// ADMIN: GET ALL TICKETS
router.get("/admin/tickets", protect, admin, helpController.adminGetAllTickets);

// ADMIN: UPDATE TICKET (Reply/Resolve)
router.put("/admin/ticket/:id", protect, admin, helpController.adminUpdateTicket);

// ADMIN: FAQ MANAGEMENT
router.post("/admin/faq", protect, admin, helpController.createFaq);
router.delete("/admin/faq/:id", protect, admin, helpController.deleteFaq);

module.exports = router;
