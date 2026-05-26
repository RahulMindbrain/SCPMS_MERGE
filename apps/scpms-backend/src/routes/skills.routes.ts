import { Router } from "express";
import {
  createSkillController,
  deleteSkillController,
  getAllSkillsController,
  getSkillByIdController,
  updateSkillController,
} from "../controllers/skills.controller";
import authenticateUser from "../middlewares/authenticateUser";
import { authorizeRoles } from "../middlewares/verifyRole";

const Skillsroute = Router();

Skillsroute.post(
  "/add",
  authenticateUser,
  authorizeRoles("ADMIN"),
  createSkillController,
);
Skillsroute.get("/get-all", getAllSkillsController);
Skillsroute.get("/get/:id", getSkillByIdController);
Skillsroute.put(
  "/update/:id",
  authenticateUser,
  authorizeRoles("ADMIN"),
  updateSkillController,
);
Skillsroute.delete(
  "/delete/:id",
  authenticateUser,
  authorizeRoles("ADMIN"),
  deleteSkillController,
);

export default Skillsroute;
