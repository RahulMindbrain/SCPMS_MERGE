import { Router } from "express";
import {
  createDepartmentController,
  getDepartmentsController,
  getDepartmentByIdController,
  updateDepartmentController,
  deleteDepartmentController,
} from "../controllers/department.controller";
import { authorizeRoles } from "../middlewares/verifyRole";
import authenticateUser from "../middlewares/authenticateUser";

const DepartmentRoutes = Router();

DepartmentRoutes.post(
  "/",
  authenticateUser,
  authorizeRoles("ADMIN"),
  createDepartmentController,
);

DepartmentRoutes.get("/", getDepartmentsController);

DepartmentRoutes.get("/:id", getDepartmentByIdController);

DepartmentRoutes.put(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN"),
  updateDepartmentController,
);

DepartmentRoutes.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("ADMIN"),
  deleteDepartmentController,
);

export default DepartmentRoutes;
