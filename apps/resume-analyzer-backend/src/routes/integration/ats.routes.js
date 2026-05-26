const express = require("express");

const {
  analyzeJDMatch,
} = require("../../controllers/integration/ats.controller");

const router = express.Router();

router.post("/analyze-jd-match", analyzeJDMatch);

module.exports = router;
