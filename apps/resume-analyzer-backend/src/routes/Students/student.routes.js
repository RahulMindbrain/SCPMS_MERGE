const express = require("express");
const router = express.Router();

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../../controllers/Student/student.controller");

const { authMiddleware } = require("../../middleware/auth-middleware");
const authorize = require("../../middleware/roles");

// Routes
router.post("/", authMiddleware, authorize(["admin"]), createStudent);
router.get("/", authMiddleware, authorize(["admin"]), getStudents);
router.get("/:id", authMiddleware, authorize(["admin"]), getStudentById);
router.put("/:id", authMiddleware, authorize(["admin"]), updateStudent);
router.delete("/:id", authMiddleware, authorize(["admin"]), deleteStudent);

module.exports = router;