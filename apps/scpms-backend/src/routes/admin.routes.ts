import { Router } from "express";
import {
  activateCompaniesController,
  activateUsersController,
  getCompaniesController,
  getDashboardStatsController,
  getInactiveCompaniesController,
  getInactiveStudentsController,
  getJobsByCompanyIdController,
  getStudentsController,
  // updateJobStatusByAdminController,
  registerAdminController,
  getCompanyRequestsController,
  updateCompanyRequestsController,
} from "../controllers/admin.controller";
import { validate } from "../middlewares/validate";
import { adminSchema } from "../validators/auth.validator";
import authenticateUser from "../middlewares/authenticateUser";
import { authorizeRoles } from "../middlewares/verifyRole";
import { getJobsController } from "../controllers/job.controller";
import {
  getApplicationsController,
  updateApplicationController,
} from "../controllers/application.controller";
import { sendBulkMailController } from "../controllers/bulkmail.controller";
import { getCompanyById } from "../repository/company.repository";
import requireActiveUser from "../middlewares/requireActiveUser";

const adminRoutes = Router();

adminRoutes.post("/register", validate(adminSchema), registerAdminController);

adminRoutes.get(
  "/get-students",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  getStudentsController,
);

adminRoutes.get(
  "/get-companies",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  getCompaniesController,
);

adminRoutes.get(
  "/get-inactive-students",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  getInactiveStudentsController,
);

adminRoutes.get(
  "/university/company-requests",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  getCompanyRequestsController,
);

adminRoutes.put(
  "/university/company-requests",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  updateCompanyRequestsController,
);

adminRoutes.put(
  "/activate-users",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  activateUsersController,
);

adminRoutes.get(
  "/get-inactive-companies",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  getInactiveCompaniesController,
);

adminRoutes.put(
  "/activate-companies",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  activateCompaniesController,
);

// adminRoutes.put(
//   "/update-job-status",
//   authenticateUser,
//   requireActiveUser,
//   authorizeRoles("ADMIN"),
//   updateJobStatusByAdminController,
// );

adminRoutes.get(
  "/jobs",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  getJobsController,
);

adminRoutes.get(
  "/applications",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  getApplicationsController,
);

adminRoutes.put(
  "/applications/:id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  updateApplicationController,
);
adminRoutes.get(
  "/dashboard",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  getDashboardStatsController,
);

adminRoutes.post(
  "/send-mails",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  sendBulkMailController,
);

adminRoutes.get(
  "/get-jobs-company/:id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  getJobsByCompanyIdController,
);

export default adminRoutes;
