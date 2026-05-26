import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const config: SMTPTransport.Options = {
  host: process.env.MAIL_HOST,

  port: Number(process.env.MAIL_PORT),

  secure: process.env.MAIL_SECURE === "true",

  auth: {
    user: process.env.MAIL_USER!,
    pass: process.env.MAIL_PASS!,
  },

  logger: true,

  debug: true,
};

export const transporter = nodemailer.createTransport(config);

type MailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};

export const sendMail = async ({ to, subject, html }: MailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Smart Campus Placement Portal" <${process.env.MAIL_USER}>`,

      to,

      subject,

      html,
    });

    return info;
  } catch (error) {
    console.error("Mail Error:", error);

    throw error;
  }
};
