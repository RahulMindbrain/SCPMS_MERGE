const express = require("express");

const {
  optimizeResume,
} = require("../../controllers/integration/optimize.resume.controller");

const router = express.Router();

router.post("/optimize-resume", optimizeResume);

module.exports = router;
