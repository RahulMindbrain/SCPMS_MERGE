import { sendEmailService } from "./mail.service";

type Student = {
  email: string;
  firstname?: string;
};

type InterviewNotificationParams = {
  students: Student[];
  schedule: any;
  companyName: string;
};

export const sendInterviewNotificationEmail = async ({
  students,
  schedule,
  companyName,
}: InterviewNotificationParams) => {
  const subject = `Interview Scheduled - ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">

      <p>Dear Student,</p>

      <p>
        Your interview for <strong>${companyName}</strong> has been scheduled.
      </p>

      <hr/>

      <p><strong>Interview Details:</strong></p>

      <ul>
        <li><strong>Date:</strong> ${new Date(schedule.startTime).toLocaleString()}</li>
        <li><strong>End Time:</strong> ${new Date(schedule.endTime).toLocaleString()}</li>
        <li><strong>Venue:</strong> ${schedule.venue || "Online"}</li>
      </ul>

      <p style="margin-top: 16px;">
        Please ensure you are available on time and prepared.
      </p>

      <p>Best regards,<br/>Placement Cell</p>

    </div>
  `;

  return sendEmailService({
    recipients: students.map((s) => s.email),
    subject,
    html,
    fromName: "Placement Cell",
  });
};
