import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  regenAccessToken,
  resendOtpController,
  resetPasswordController,
  verifyOtpController,
} from "../auth/auth.controller";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../validators/auth.validator";
import authenticateUser from "../middlewares/authenticateUser";

const AuthRoutes = Router();

AuthRoutes.post("/login", validate(loginSchema), loginController);

AuthRoutes.post("/refresh", regenAccessToken);

AuthRoutes.post("/logout", authenticateUser, logoutController);

AuthRoutes.post("/forgot-password", forgotPasswordController);

AuthRoutes.post("/resend-otp", resendOtpController);

AuthRoutes.post("/verify-otp", verifyOtpController);

AuthRoutes.post("/reset-password", resetPasswordController);

export default AuthRoutes;
