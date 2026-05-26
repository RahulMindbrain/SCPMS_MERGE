// routes/profile.routes.js
const express = require("express");
const router = express.Router();
const { createProfile, updateProfile } = require("../../controllers/Profile/profile.controller");
const { authMiddleware } = require("../../middleware/auth-middleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create profile
router.post("/", createProfile);

// Update profile (requires login)
router.put("/:id", authMiddleware, upload.single("profilePic"), updateProfile);

module.exports = router;