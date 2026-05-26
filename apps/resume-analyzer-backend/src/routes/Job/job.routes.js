const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../middleware/auth-middleware");

const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  toggleJobHiredStatus,
  extractJDText
} = require("../../controllers/Jobs/job.controller");


const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Public
router.get("/", getJobs);
router.get("/user/my-jobs", authMiddleware, getMyJobs);
router.get("/:id", getJobById);

// Protected
router.post("/extract-jd", authMiddleware, upload.single("file"), extractJDText);
router.post("/", authMiddleware, upload.single("file"), createJob);

router.put("/:id", authMiddleware, upload.single("file"), updateJob);
router.patch("/:id/hired", authMiddleware, toggleJobHiredStatus);
router.delete("/:id", authMiddleware, deleteJob);

module.exports = router;
