const express = require("express");
const router = express.Router();
const { applyToJob, getMyApplications, getJobApplicants } = require("../../controllers/Application/application.controller");
const { authMiddleware } = require("../../middleware/auth-middleware");

// Re-using the same auth logic pattern seen in resume.routes or others
// If req.userId is expected, usually there is an auth middleware
router.post("/apply", authMiddleware, applyToJob);
router.get("/my-applications", authMiddleware, getMyApplications);
router.get("/job/:jobId", authMiddleware, getJobApplicants);

module.exports = router;
