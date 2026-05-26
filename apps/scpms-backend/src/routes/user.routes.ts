import { Router } from "express";
// import { createAdminController } from "../controllers/admin.controller";
import {
  createUserController,
  getUserController,
  updateUserController,
} from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { registerSchema, updateUserSchema } from "../validators/auth.validator";
import authenticateUser from "../middlewares/authenticateUser";

const UserRoutes = Router();

UserRoutes.post("/register", validate(registerSchema), createUserController);

UserRoutes.get("/fetch", authenticateUser, getUserController);

UserRoutes.put(
  "/update",
  authenticateUser,
  validate(updateUserSchema),
  updateUserController,
);

export default UserRoutes;
