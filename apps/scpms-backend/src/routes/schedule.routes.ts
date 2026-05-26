import { Router } from "express";
import {
  createScheduleController,
  getAllSchedulesController,
  getScheduleByIdController,
  getCompanySchedulesController,
  updateScheduleController,
  deleteScheduleController,
  addJobsController,
  removeJobsController,
  updateScheduleApprovalController,
  getSchedulesForUserController,
} from "../controllers/schedule.controller";

import authenticateUser from "../middlewares/authenticateUser";
import { authorizeRoles } from "../middlewares/verifyRole";

import {
  getScheduleMessagesController,
  sendScheduleMessageController,
} from "../controllers/schedule.message.controller";

import { getScheduleApplicationsController } from "../controllers/application.controller";
import requireActiveUser from "../middlewares/requireActiveUser";

const scheduleRoute = Router();

scheduleRoute.post(
  "/",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  createScheduleController,
);

scheduleRoute.get(
  "/",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN", "COMPANY"),
  getAllSchedulesController,
);

scheduleRoute.put(
  "/:id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  updateScheduleController,
);

scheduleRoute.delete(
  "/:id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  deleteScheduleController,
);

scheduleRoute.post(
  "/:id/jobs",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),
  addJobsController,
);

scheduleRoute.delete(
  "/jobs",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN"),

  removeJobsController,
);

scheduleRoute.get(
  "/company",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  getCompanySchedulesController,
);

scheduleRoute.get(
  "/:id/applications",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN", "COMPANY"),
  getScheduleApplicationsController,
);

scheduleRoute.post(
  "/:id/messages",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN", "COMPANY"),
  sendScheduleMessageController,
);

scheduleRoute.get(
  "/:id/messages",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN", "COMPANY"),
  getScheduleMessagesController,
);

scheduleRoute.put(
  "/:id/approval",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("COMPANY"),
  updateScheduleApprovalController,
);

scheduleRoute.get(
  "/by-company-id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN", "COMPANY"),
  getSchedulesForUserController,
);

scheduleRoute.get(
  "/:id",
  authenticateUser,
  requireActiveUser,
  authorizeRoles("ADMIN", "COMPANY", "STUDENT"),
  getScheduleByIdController,
);

export default scheduleRoute;
