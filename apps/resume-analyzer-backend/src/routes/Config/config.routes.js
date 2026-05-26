const express = require("express");
const router = express.Router();
const configController = require("../../controllers/Config/config.controller");
const { protect, admin } = require("../../middleware/auth-middleware");

// --- Public Config Routes ---
// Needed for maintenance mode check and onboarding selection
router.get("/", configController.getSystemConfig);
router.get("/tracks", configController.getTracks);

// --- Admin-Only Management Routes ---
router.use(protect);
router.use(admin);

// System Config update
router.put("/", configController.updateSystemConfig);

// Prompts
router.get("/prompts", configController.getPrompts);
router.put("/prompts/:key", configController.updatePrompt);

// Job Tracks Management
router.post("/tracks", configController.createTrack);
router.put("/tracks/:id", configController.updateTrack);
router.delete("/tracks/:id", configController.deleteTrack);

// Platform Purge
router.post("/purge", configController.purgePlatformData);

module.exports = router;


