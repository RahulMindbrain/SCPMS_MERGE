const express = require("express");
const router = express.Router();
const { getAllReports } = require("../../controllers/Reports/reports.controller");

router.get("/all", getAllReports);

module.exports = router;
