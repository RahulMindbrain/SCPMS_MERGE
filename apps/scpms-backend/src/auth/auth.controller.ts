import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import {
  forgotPasswordService,
  generateAccessService,
  loginService,
  logoutService,
  resendOtpService,
  resetPasswordService,
  verifyOtpService,
} from "./auth.service";
import { parseTTLToMs } from "../utils/parseTTL";
import { sendError, sendSuccess } from "../utils/response";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 400, "Email and Password are required");
      return;
    }

    const { accessToken, refreshToken, user } = await loginService(
      email,
      password,
    );

    const accessMaxAge = parseTTLToMs(process.env.JWT_ACCESS_TTL!);
    const refreshMaxAge = parseTTLToMs(process.env.JWT_REFRESH_TTL!);
    // console.log(accessMaxAge, refreshMaxAge);

    res.cookie("userAccessToken", accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "none",
      maxAge: accessMaxAge,
      path: "/",
    });

    res.cookie("userRefreshToken", refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "none",
      maxAge: refreshMaxAge,
      path: "/",
    });
    // console.log("HEADERS:", res.getHeaders());

    sendSuccess(res, 200, "Login successful", user);
  } catch (error: any) {
    sendError(res, 401, error.message || "Login failed");
  }
};

export const regenAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.userRefreshToken;

    if (!refreshToken) {
      sendError(res, 401, "Refresh token missing");
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessService(refreshToken);

    const accessMaxAge = parseTTLToMs(process.env.JWT_ACCESS_TTL!);
    const refreshMaxAge = parseTTLToMs(process.env.JWT_REFRESH_TTL!);

    res.cookie("userAccessToken", accessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "none",
      maxAge: accessMaxAge,
      path: "/",
    });

    res.cookie("userRefreshToken", newRefreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "none",
      maxAge: refreshMaxAge,
      path: "/",
    });

    sendSuccess(res, 200, "Token refreshed successfully");
  } catch (error: any) {
    // console.log(error);
    sendError(res, 403, error.message);
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.userAccessToken;
    // console.log(token);

    if (!token) {
      sendError(res, 401, "Access token missing");
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
    };

    await logoutService(decoded.id);

    const cookieOptions = {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "none" as const,
      path: "/",
    };

    res.clearCookie("userAccessToken", cookieOptions);
    res.clearCookie("userRefreshToken", cookieOptions);

    sendSuccess(res, 200, "Logout successful");
  } catch {
    sendError(res, 401, "Invalid token");
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      sendError(res, 400, "Email is required");
      return;
    }

    const data = await forgotPasswordService(email);

    sendSuccess(res, 200, "OTP sent successfully", data);
  } catch (error: any) {
    sendError(res, 400, error.message || "Failed to send OTP");
  }
};

export const resendOtpController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      sendError(res, 400, "Email is required");
      return;
    }

    const data = await resendOtpService(email);

    sendSuccess(res, 200, "OTP resent successfully", data);
  } catch (error: any) {
    sendError(res, 400, error.message || "Failed to resend OTP");
  }
};

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      sendError(res, 400, "Email and OTP are required");
      return;
    }

    const data = await verifyOtpService(email, otp);

    sendSuccess(res, 200, "OTP verified successfully", data);
  } catch (error: any) {
    sendError(res, 400, error.message || "OTP verification failed");
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, newpassword } = req.body;

    if (!email || !newpassword) {
      sendError(res, 400, "Email and new password are required");
      return;
    }

    const data = await resetPasswordService(email, newpassword);

    sendSuccess(res, 200, "Password reset successful", data);
  } catch (error: any) {
    sendError(res, 400, error.message || "Password reset failed");
  }
};
