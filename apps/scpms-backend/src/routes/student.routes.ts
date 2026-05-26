import { Router } from "express";
import {
  applicationActionController,
  createStudentController,
  getStudentProfileController,
  updateStudentController,
} from "../controllers/sutdent.controller";
import { authorizeRoles } from "../middlewares/verifyRole";
import authenticateUser from "../middlewares/authenticateUser";
import { validate } from "../middlewares/validate";
import {
  createStudentSchema,
  updateStudentSchema,
} from "../validators/sudent.validator";
import { getJobsController } from "../controllers/job.controller";
import {
  createApplicationController,
  getApplicationsController,
} from "../controllers/application.controller";
import { getCloudinarySignatureController } from "../cloudinaryUploads/cloudinary";
import requireActiveUser from "../middlewares/requireActiveUser";

const StudentRoutes = Router();

StudentRoutes.post(
  "/profile",
  authenticateUser,
  authorizeRoles("STUDENT"),
  validate(createStudentSchema),
  createStudentController,
);

StudentRoutes.get(
  "/profile",
  authenticateUser,
  authorizeRoles("STUDENT"),
  getStudentProfileController,
);

StudentRoutes.put(
  "/profile",
  authenticateUser,
  authorizeRoles("STUDENT"),
  requireActiveUser,
  validate(updateStudentSchema),
  updateStudentController,
);

StudentRoutes.get(
  "/show-all-jobs",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("STUDENT"),
  getJobsController,
);

StudentRoutes.post(
  "/apply-job",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("STUDENT"),
  createApplicationController,
);

StudentRoutes.get(
  "/get-job-application",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("STUDENT"),
  getApplicationsController,
);

StudentRoutes.put(
  "/application/:applicationId/offer-response",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("STUDENT"),
  applicationActionController,
);

export default StudentRoutes;
