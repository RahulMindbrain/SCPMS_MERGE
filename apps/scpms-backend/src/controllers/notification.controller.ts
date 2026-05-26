import {
  createNotificationService,
  deleteNotificationService,
  getNotificationsPaginatedService,
  getNotificationsService,
  getUnreadCountService,
  getUpcomingEventsService,
  markAllAsReadService,
  markAsReadService,
  markNotificationAsReadService,
} from "../services/notification.service";
import { sendError, sendSuccess } from "../utils/response";

import { Request, Response } from "express";

export const createNotificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await createNotificationService(req.body);
    return sendSuccess(res, 201, "Notification created", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const data = await getNotificationsPaginatedService(user.id, page, limit);

    return sendSuccess(res, 200, "Notifications fetched", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const markAsReadController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { id } = req.params;

    const data = await markNotificationAsReadService(Number(id), user.id);

    return sendSuccess(res, 200, "Marked as read", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const deleteNotificationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;
    const { id } = req.params;

    await deleteNotificationService(Number(id), user.id);

    return sendSuccess(res, 200, "Notification deleted");
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getUnreadCountController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const count = await getUnreadCountService(user.id);

    return sendSuccess(res, 200, "Unread count fetched", { count });
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const markAllAsReadController = async (_req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const data = await markAllAsReadService(user.id);

    return sendSuccess(res, 200, "All notifications marked as read", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getUpcomingEventsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id, role } = res.locals.user;

    if (!id) {
      return sendError(res, 401, "Unauthorized");
    }

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const data = await getUpcomingEventsService(id, role, page, limit);

    return sendSuccess(res, 200, "Upcoming events fetched", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};
