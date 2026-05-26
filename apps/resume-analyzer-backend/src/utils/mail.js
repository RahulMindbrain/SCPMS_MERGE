const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"MindVista" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Signup Verification - MindVista",
    html: `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <!-- Header with Logo -->
          <!-- Header area -->
          <div style="background-color: #f0f4ff; padding: 45px 20px; text-align: center; border-bottom: 2px solid #e0e7ff;">
            <h1 style="color: #4338ca; margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1.5px; font-family: 'Inter', 'Segoe UI', Arial, sans-serif;">MindVista</h1>
          </div>
















          
          <!-- Content Area -->
          <div style="padding: 40px 30px; text-align: center;">
            <p style="color: #475569; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
              Hello! Welcome to <strong>MindVista</strong>. Please use the following code to verify your email and start your journey.
            </p>
            
            <!-- OTP Box -->
            <div style="background-color: #f1f5f9; padding: 25px; border-radius: 16px; border: 2px dashed #cbd5e1; margin-bottom: 30px;">
              <span style="font-size: 24px; font-weight: 900; color: #1e293b; letter-spacing: 8px; font-family: monospace;">
                ${otp}
              </span>
            </div>

            
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 0;">
              This code will expire in <strong>5 minutes</strong>.<br/>
              If you didn't request this, you can safely ignore this email.
            </p>

          </div>
          
          <!-- Footer -->
          <div style="padding: 20px; text-align: center; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              &copy; 2026 MindVista. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };


  return transporter.sendMail(mailOptions);
};


module.exports = { sendOTP };
