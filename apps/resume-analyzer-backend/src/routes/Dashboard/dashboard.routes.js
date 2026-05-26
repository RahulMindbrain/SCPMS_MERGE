const express = require('express');
const { getDashboard, getAnalytics, getReports, getSkillInsights, completeRoadmapPhase } = require("../../controllers/Dashboard/dashboard.controller");
const { authMiddleware } = require("../../middleware/auth-middleware");

const router = express.Router();

router.get("/", authMiddleware, getDashboard);
router.get("/analytics", authMiddleware, getAnalytics);
router.get("/reports", authMiddleware, getReports);
router.get("/insights", authMiddleware, getSkillInsights);
router.patch("/roadmap/complete", authMiddleware, completeRoadmapPhase);

module.exports = router;