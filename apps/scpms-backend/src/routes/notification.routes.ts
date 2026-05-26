import { Router } from "express";
import {
  deleteNotificationController,
  getNotificationsController,
  getUnreadCountController,
  getUpcomingEventsController,
  markAllAsReadController,
  markAsReadController,
} from "../controllers/notification.controller";
import authenticateUser from "../middlewares/authenticateUser";
import { authorizeRoles } from "../middlewares/verifyRole";
import requireActiveUser from "../middlewares/requireActiveUser";

const notificationRouter = Router();

notificationRouter.get("/", authenticateUser, getNotificationsController);

notificationRouter.get(
  "/unread-count",
  authenticateUser,
  requireActiveUser,
  getUnreadCountController,
);

notificationRouter.put(
  "/mark-all-read",
  authenticateUser,
  requireActiveUser,
  markAllAsReadController,
);

notificationRouter.put(
  "/:id/read",
  authenticateUser,
  requireActiveUser,
  markAsReadController,
);

notificationRouter.delete(
  "/:id",
  authenticateUser,
  requireActiveUser,
  deleteNotificationController,
);

notificationRouter.get(
  "/upcoming-events",
  authenticateUser,
  requireActiveUser,
  //authorizeRoles("STUDENT"),
  getUpcomingEventsController,
);

export default notificationRouter;
