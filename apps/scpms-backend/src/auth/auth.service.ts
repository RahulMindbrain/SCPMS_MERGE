import {
  clearOtp,
  findByEmail,
  findById,
  getUserOtpState,
  incrementOtpAttempts,
  logoutRepo,
  storeOtpByUserId,
  storeRefreshToken,
  updatePasswordById,
} from "../repository/auth.repository";
import { findActiveToken } from "../repository/user.repository";
//old
// import { generateOtp } from "../utils/hashPassword";
import { generateOtp } from "@repo/auth";

//old
// import {
//   generateAccessToken,
//   generateRefreshToken,
// } from "../utils/tokenGeneration";

//new
import { generateAccessToken, generateRefreshToken } from "@repo/auth";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/mails/otp.mail.helper";
import { normalizeEmails } from "../utils/normalize.utils";

const OTP_EXPIRY = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const MAX_GEN = Number(process.env.OTP_MAX_GENERATIONS || 5);
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

export const loginService = async (email: string, password: string) => {
  email = normalizeEmails(email);
  const existUser = await findByEmail(email);

  if (!existUser) {
    throw new Error("Invalid email or password");
  }

  //   if (existUser.status === "INACTIVE") {
  //     throw new Error("Account not approved");
  //   }

  const isPassword = await bcrypt.compare(password, existUser.password);

  if (!isPassword) {
    throw new Error("Invalid mobile or password");
  }

  const { password: _p, ...safeUser } = existUser;

  const accessToken = generateAccessToken(existUser.id, existUser.role);
  const refreshToken = generateRefreshToken(existUser.id, existUser.role);
  // console.log("Access Token:", accessToken);
  // console.log("Refresh Token:", refreshToken);

  await storeRefreshToken(existUser.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: safeUser,
  };
};

export const generateAccessService = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string,
    ) as { id: number; role: string };

    const user = await findById(decoded.id);

    if (!user) {
      throw new Error("Invalid or expired refresh token");
    }

    if (user.status === "INACTIVE") {
      throw new Error("Account not approved");
    }

    const tokenRecord = await findActiveToken(user.id, refreshToken);

    if (!tokenRecord) {
      throw new Error("Invalid or expired refresh token");
    }

    const newAccessToken = generateAccessToken(user.id, user.role);

    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken,
    };
  } catch (err) {
    //console.log("REFRESH ERROR:", err);
    throw new Error("Invalid or expired refresh token");
  }
};

export const logoutService = async (id: number) => {
  if (!id) {
    throw new Error("User id is required");
  }

  await logoutRepo(id);
  return true;
};

export const forgotPasswordService = async (email: string) => {
  email = normalizeEmails(email);
  const user = await getUserOtpState(email);
  if (!user) throw new Error("User not found");

  const now = new Date();

  if (
    user.otp &&
    user.otpExpiry &&
    now.getTime() < new Date(user.otpExpiry).getTime()
  ) {
    throw new Error("OTP already sent. Please wait.");
  }

  if (user.otpGenerations >= MAX_GEN) {
    throw new Error("OTP request limit reached");
  }

  const { otp, hashedOtp } = await generateOtp();
  console.log(otp);

  const updated = await storeOtpByUserId(user.id, hashedOtp, OTP_EXPIRY);

  await sendOtpEmail(user.email, otp);

  return {
    message: "OTP sent",
    otpExpiry: updated.otpExpiry,
  };
};

export const resendOtpService = async (email: string) => {
  email = normalizeEmails(email);

  const user = await getUserOtpState(email);

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  if (user.otp && user.otpExpiry && now.getTime() < user.otpExpiry.getTime()) {
    throw new Error("OTP still valid. Cannot resend yet.");
  }

  if (user.otpGenerations >= MAX_GEN) {
    throw new Error("Max resend limit reached");
  }

  const { otp, hashedOtp } = await generateOtp();

  const updated = await storeOtpByUserId(user.id, hashedOtp, OTP_EXPIRY);

  await sendOtpEmail(user.email, otp);

  return {
    message: "OTP resent",

    otpExpiry: updated.otpExpiry,
  };
};

export const verifyOtpService = async (email: string, inputOtp: string) => {
  email = normalizeEmails(email);
  const user = await getUserOtpState(email);

  if (!user) throw new Error("User not found");

  const { otp, otpExpiry, otpAttempts, id } = user;

  if (!otp || !otpExpiry) {
    throw new Error("OTP not found");
  }

  const expiry = new Date(otpExpiry);

  if (Date.now() > expiry.getTime()) {
    throw new Error("OTP expired");
  }

  if (otpAttempts >= MAX_ATTEMPTS) {
    throw new Error("Too many attempts");
  }

  const isMatch = await bcrypt.compare(inputOtp, otp);

  if (!isMatch) {
    await incrementOtpAttempts(id);
    throw new Error("Invalid OTP");
  }

  return { verified: true };
};

export const resetPasswordService = async (
  email: string,
  newPassword: string,
) => {
  email = normalizeEmails(email);
  const user = await getUserOtpState(email);
  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await updatePasswordById(user.id, hashedPassword);
  await clearOtp(user.id);

  return { message: "Password reset successful" };
};
