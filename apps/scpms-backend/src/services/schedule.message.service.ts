import {
  createScheduleMessage,
  getScheduleMessages,
} from "../repository/schedule.message.repository";
import { getScheduleWithParticipants } from "../repository/schedule.repository";
import {
  resolveDirection,
  resolveParticipants,
} from "../utils/mails/mail.helper";
import { sendScheduleDiscussionEmail } from "./mail/mail.schedule.service";

export const sendScheduleMessageService = async (
  scheduleId: number,
  senderId: number,
  message: string,
) => {
  if (!message?.trim()) {
    throw new Error("Message cannot be empty");
  }

  const schedule = await getScheduleWithParticipants(scheduleId);

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  if (schedule.companyApprovalStatus !== "PENDING") {
    throw new Error("Communication closed for this schedule");
  }

  const participants = resolveParticipants(schedule);

  const { senderRole, senderName, recipientEmail } = resolveDirection(
    senderId,
    participants,
  );

  const savedMessage = await createScheduleMessage({
    scheduleId,
    senderId,
    message,
  });

  sendScheduleDiscussionEmail({
    schedule,
    senderRole,
    senderName,
    recipientEmail,
    message,
  }).catch(console.error);

  return savedMessage;
};

export const getScheduleMessagesService = async (
  scheduleId: number,
  userId: number,
) => {
  const schedule = await getScheduleWithParticipants(scheduleId);

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  const participants = resolveParticipants(schedule);

  resolveDirection(userId, participants);

  const messages = await getScheduleMessages(scheduleId);

  return messages;
};
