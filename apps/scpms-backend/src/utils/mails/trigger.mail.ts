import { sendEmailService } from "../../services/mail/mail.service";

export const triggerScheduleEmail = async (
  schedule: any,
  senderId: number,
  message: string,
) => {
  const isAdmin = schedule.createdBy === senderId;

  const recipient = isAdmin
    ? schedule.company.user.email
    : schedule.admin.user.email;

  await sendEmailService({
    recipients: recipient,
    subject: `Schedule Discussion: ${schedule.title}`,
    message,
  });
};
