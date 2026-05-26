import { Router } from "express";
import {
  createCompanyController,
  getCompanyProfileController,
  requestUniversityController,
  updateCompanyController,
} from "../controllers/company.controller";
import { authorizeRoles } from "../middlewares/verifyRole";
import { validate } from "../middlewares/validate";
import {
  createCompanySchema,
  updateCompanySchema,
} from "../validators/company.validators";
import authenticateUser from "../middlewares/authenticateUser";
import {
  createJobController,
  getJobsController,
  updateJobController,
} from "../controllers/job.controller";
import { createJobSchema } from "../validators/job.validator";
import {
  getApplicationsController,
  updateApplicationController,
} from "../controllers/application.controller";
import requireActiveUser from "../middlewares/requireActiveUser";
import {
  getCompanyRequestsController,
  reapplyUniversityController,
} from "../controllers/companyuniversity.controller";

const CompanyRoutes = Router();

CompanyRoutes.post(
  "/profile",
  authenticateUser,
  authorizeRoles("COMPANY"),
  validate(createCompanySchema),
  createCompanyController,
);

CompanyRoutes.get(
  "/profile",
  authenticateUser,
  authorizeRoles("COMPANY"),
  getCompanyProfileController,
);

CompanyRoutes.put(
  "/profile",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  validate(updateCompanySchema),
  updateCompanyController,
);

CompanyRoutes.post(
  "/request-university",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  requestUniversityController,
);

CompanyRoutes.get(
  "/requests",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  getCompanyRequestsController,
);

CompanyRoutes.post(
  "/post-job",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  validate(createJobSchema),
  createJobController,
);

CompanyRoutes.put(
  "/post-job/:id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  updateJobController,
);

CompanyRoutes.get(
  "/get-jobs",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  getJobsController,
);

CompanyRoutes.get(
  "/get-job-application",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  getApplicationsController,
);

CompanyRoutes.put(
  "/update-job-status/:id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  updateApplicationController,
);

CompanyRoutes.put(
  "/reapply-university",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  reapplyUniversityController,
);

export default CompanyRoutes;
