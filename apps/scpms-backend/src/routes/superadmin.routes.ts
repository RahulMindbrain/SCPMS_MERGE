// src/routes/superadmin.routes.ts

import { Router } from "express";

import {
  createSuperAdminController,
  getSuperAdminByIdController,
  getAllSuperAdminsController,
  updateSuperAdminController,
  deleteSuperAdminController,
  getAdminsController,
  activateAdminsController,
  deactivateAdminsController,
  getCompaniesController,
  activateCompaniesController,
  getUniversitiesController,
} from "../controllers/superadmin.controller";

import authenticateUser from "../middlewares/authenticateUser";
import { authorizeRoles } from "../middlewares/verifyRole";
import requireActiveUser from "../middlewares/requireActiveUser";

const saRouter = Router();

saRouter.post("/register", createSuperAdminController);
saRouter.get("/", getAllSuperAdminsController);

saRouter.get(
  "/admins",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("SUPER_ADMIN"),
  getAdminsController,
);

saRouter.put(
  "/admins/activate",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("SUPER_ADMIN"),
  activateAdminsController,
);

saRouter.put(
  "/admins/deactivate",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("SUPER_ADMIN"),
  deactivateAdminsController,
);

saRouter.get(
  "/companies",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("SUPER_ADMIN"),
  getCompaniesController,
);

saRouter.put(
  "/companies/activate",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("SUPER_ADMIN"),
  activateCompaniesController,
);

saRouter.get(
  "/universities",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("SUPER_ADMIN"),
  getUniversitiesController,
);

saRouter.get("/:id", getSuperAdminByIdController);
saRouter.put(
  "/:id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("SUPER_ADMIN"),
  updateSuperAdminController,
);
saRouter.delete(
  "/:id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("SUPER_ADMIN"),
  deleteSuperAdminController,
);
// console.log("super admin routes hit");

export default saRouter;
