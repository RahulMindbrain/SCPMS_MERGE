import { sendEmailService } from "./mail.service";

type ScheduleDiscussionParams = {
  schedule: any;
  senderRole: "ADMIN" | "COMPANY";
  senderName: string;
  recipientEmail: string;
  message: string;
};

export const sendScheduleDiscussionEmail = async ({
  schedule,
  senderRole,
  senderName,
  recipientEmail,
  message,
}: ScheduleDiscussionParams) => {
  const subject = `Interview Schedule Discussion: ${schedule.title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      
      <p><strong>${senderRole}</strong> (${senderName}) sent a message:</p>

      <div style="margin: 12px 0; padding: 10px; border-left: 3px solid #007bff;">
        ${message}
      </div>

      <hr/>

      <p><strong>Schedule Details:</strong></p>
      <ul>
        <li><strong>Title:</strong> ${schedule.title}</li>
        <li><strong>Date:</strong> ${new Date(schedule.startTime).toLocaleString()}</li>
        <li><strong>Venue:</strong> ${schedule.venue || "Online"}</li>
      </ul>

      <p style="margin-top: 16px; font-size: 12px; color: #555;">
        Please reply via the portal to continue this discussion.
      </p>

    </div>
  `;

  return sendEmailService({
    recipients: recipientEmail,
    subject,
    html,
    fromName: "Placement Cell",
  });
};
