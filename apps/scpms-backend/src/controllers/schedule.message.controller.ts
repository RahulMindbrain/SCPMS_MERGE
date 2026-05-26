import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import {
  getScheduleMessagesService,
  sendScheduleMessageService,
} from "../services/schedule.message.service";

export const sendScheduleMessageController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    if (!user?.id) {
      return sendError(res, 401, "Unauthorized");
    }

    const scheduleId = Number(req.params.id);

    if (isNaN(scheduleId)) {
      return sendError(res, 400, "Invalid schedule id");
    }

    const msg = await sendScheduleMessageService(
      scheduleId,
      user.id,
      req.body.message,
    );

    return sendSuccess(res, 201, "Message sent", msg);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getScheduleMessagesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const scheduleId = Number(req.params.id);

    if (isNaN(scheduleId)) {
      return sendError(res, 400, "Invalid schedule id");
    }

    const data = await getScheduleMessagesService(scheduleId, user.id);

    return sendSuccess(res, 200, "Messages fetched", data);
  } catch (error: any) {
    console.error(error);
    return sendError(res, 400, error.message);
  }
};
