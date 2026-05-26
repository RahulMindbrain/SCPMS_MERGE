import { sendMail } from "../../utils/mails/transporter.mail";

type SendEmailParams = {
  recipients: string | string[];
  subject?: string;
  message?: string;
  html?: string;
  fromName?: string;
};

export const sendEmailService = async ({
  recipients,
  subject,
  message,
  html,
  //fromName,
}: SendEmailParams) => {
  try {
    if (!recipients) {
      throw new Error("Recipients are required");
    }

    const finalSubject = subject || "Notification from Placement Portal";

    const finalHtml =
      html ||
      (message
        ? `<p>${message}</p>`
        : `<p>You have a new job notification. Visit the site to know more.</p>`);

    const emails = Array.isArray(recipients) ? recipients : [recipients];

    if (emails.length <= 20) {
      return await sendMail({
        to: emails,
        subject: finalSubject,
        html: finalHtml,
        //fromName,
      });
    }

    const results = await Promise.all(
      emails.map((email) =>
        sendMail({
          to: email,
          subject: finalSubject,
          html: finalHtml,
          // fromName,
        }),
      ),
    );

    return results;
  } catch (error) {
    console.error("Email Service Error:", error);
    throw error;
  }
};
