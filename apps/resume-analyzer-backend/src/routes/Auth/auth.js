const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../middleware/auth-middleware");

const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  verifyOTP,
  resendOTP,
  completeOnboarding,
} = require("../../controllers/Auth/auth.controller");

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.put("/onboarding", authMiddleware, completeOnboarding);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;