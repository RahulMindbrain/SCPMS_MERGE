const express = require("express");
const router = express.Router();
const {
  exportData,
  importData,
  resetSettings,
  deleteAllData
} = require("../../controllers/Settings/settings.controller");

const { authMiddleware } = require("../../middleware/auth-middleware");

// Data Management
router.get("/export", authMiddleware, exportData);
// console.log("EXPORT HIT ");
router.post("/import", authMiddleware, importData);
// console.log("IMPORT HIT ");
router.post("/reset", authMiddleware, resetSettings);
router.delete("/", authMiddleware, deleteAllData);

module.exports = router;