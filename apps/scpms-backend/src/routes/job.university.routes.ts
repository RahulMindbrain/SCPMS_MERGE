import express from "express";
import {
  sendJobToUniversitiesController,
  updateJobUniversityStatusController,
  getJobUniversitiesController,
  reapplyJobUniversityController,
} from "../controllers/job.university.controller";
import { authorizeRoles } from "../middlewares/verifyRole";
import requireActiveUser from "../middlewares/requireActiveUser";
import authenticateUser from "../middlewares/authenticateUser";
import { validate } from "../middlewares/validate";
import { createJobUniversitySchema } from "../validators/jobUniversity.validator";

const jobUniversityRouter = express.Router();

jobUniversityRouter.post(
  "/send",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  validate(createJobUniversitySchema),
  sendJobToUniversitiesController,
);

jobUniversityRouter.put(
  "/status",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  updateJobUniversityStatusController,
);

jobUniversityRouter.get(
  "/",
  authenticateUser,
  requireActiveUser,
  getJobUniversitiesController,
);

jobUniversityRouter.put(
  "/reapply",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  reapplyJobUniversityController,
);

export default jobUniversityRouter;
