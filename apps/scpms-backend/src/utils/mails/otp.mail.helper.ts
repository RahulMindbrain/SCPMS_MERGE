import { sendEmailService } from "../../services/mail/mail.service";

export const sendOtpEmail = async (email: string, otp: string) => {
  const html = `
    <div style="font-family: Arial; line-height: 1.5">
      <h2>Password Reset OTP</h2>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing: 2px;">${otp}</h1>
      <p>This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES} minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  return sendEmailService({
    recipients: email,
    subject: "Password Reset OTP",
    html,
  });
};
