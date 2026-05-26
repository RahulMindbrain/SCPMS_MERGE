const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const PendingUser = require("../../models/PendingUser");
const { generateAccessToken, generateRefreshToken } = require("../../utils/generateToken");
const { emitEvent } = require("../../utils/socket");
const { sendOTP } = require("../../utils/mail");
const crypto = require("crypto");


// Helper to send access and refresh tokens in HTTP-only cookies
const sendTokens = async (res, user, message = "Login successful", status = 200) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    .status(status)
    .json({
      msg: message,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        profilePic: user.profilePic || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        userType: user.userType || null,
        targetRole: user.targetRole || null,
        yearsOfExperience: user.yearsOfExperience || null,
      },
    });
};

// Registration
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, verifyEmail = true } = req.body;
    const allowedRoles = ["admin", "student"];
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password and role are required" });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role. Use 'admin' or 'student'" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (phone) {
      console.log(`[Auth] Checking phone uniqueness for: "${phone}"`);
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        console.log(`[Auth] Phone collision detected for: ${phone}`);
        return res.status(400).json({ error: "Mobile number already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // If verification is disabled, create user immediately
    if (verifyEmail === false) {
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
        phone: phone || "",
        isVerified: false
      });

      await newUser.save();

      // Notify listeners about new registration
      if (newUser.role === 'student') {
        emitEvent('student_registered', { id: newUser._id, name: newUser.name });
      }

      return sendTokens(res, newUser, "Account created successfully", 201);
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Check if there is an existing pending registration that is currently blocked
    const existingPending = await PendingUser.findOne({ email });
    if (existingPending && existingPending.blockedUntil && existingPending.blockedUntil > new Date()) {
      const waitTime = Math.ceil((existingPending.blockedUntil - new Date()) / (60 * 1000));
      return res.status(429).json({ error: `try after sometime` });
    }

    // Delete existing pending registration for this email if it exists
    await PendingUser.deleteOne({ email });


    // Store in PendingUser instead of User collection
    const newPendingUser = new PendingUser({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || "",
      otp,
      otpExpires,
    });

    await newPendingUser.save();



    try {
      await sendOTP(email, otp);
    } catch (mailErr) {
      console.error("Failed to send OTP:", mailErr);
      // We still saved the user, but maybe we should tell them or let them resend
    }

    res.status(201).json({
      msg: "OTP sent to your email. Please verify to complete registration.",
      email: email,
    });


  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        error: `The ${field} "${err.keyValue[field]}" is already in use.`,
      });
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(", ") });
    }

    res.status(500).json({ error: err.message });
  }
};

// Login (Admin & User)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    await sendTokens(res, user);



  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Refresh Token (Admin & User)
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) return res.status(401).json({ error: "No refresh token provided" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.refreshToken || user.refreshToken !== token) {
      return res.status(401).json({ error: "Refresh token mismatch" });
    }

    await sendTokens(res, user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout (works for any role)
const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    const refreshTokenCookie = req.cookies.refresh_token;
    let user = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
        if (user) {
          user.refreshToken = "";
          await user.save();
        }
      } catch (err) {
        // invalid token is treated as already logged out
      }
    }

    res
      .cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      })
      .cookie("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      })
      .status(200)
      .json({
        msg: "Logged out successfully",
        user: user
          ? {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || "",
            profilePic: user.profilePic || "",
            github: user.github || "",
            linkedin: user.linkedin || "",
          }
          : null,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.user.id).select("name email role phone profilePic github linkedin userType targetRole yearsOfExperience");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      msg: "Authenticated user",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        profilePic: user.profilePic || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        userType: user.userType || null,
        targetRole: user.targetRole || null,
        yearsOfExperience: user.yearsOfExperience || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old password and new password are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ msg: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // 1. Check PendingUser first (New Signup Flow)
    const pendingUser = await PendingUser.findOne({ email });
    if (pendingUser) {
      if (pendingUser.otp !== otp || pendingUser.otpExpires < new Date()) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // Create actual user after successful verification
      const newUser = new User({
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password,
        role: pendingUser.role,
        phone: pendingUser.phone,
        isVerified: true
      });

      await newUser.save();
      await PendingUser.deleteOne({ _id: pendingUser._id });

      // Notify listeners about new registration
      if (newUser.role === 'student') {
        emitEvent('student_registered', { id: newUser._id, name: newUser.name });
      }

      return sendTokens(res, newUser, "Email verified and account created successfully", 201);
    }

    // 2. Fallback: Check User collection (for legacy users or direct updates)
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    await sendTokens(res, user, "Email verified and logged in successfully", 200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({ error: "No pending registration found. Please sign up again." });
    }

    // Check for rate limit block
    if (pendingUser.blockedUntil && pendingUser.blockedUntil > new Date()) {
      return res.status(429).json({ error: "try after sometime" });
    }

    // Check if resend count exceeded (3 resends allowed)
    if (pendingUser.resendCount >= 3) {
      pendingUser.blockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes block
      await pendingUser.save();
      return res.status(429).json({ error: "try after sometime" });
    }

    // Increment resend count
    pendingUser.resendCount += 1;
    const newOtp = crypto.randomInt(100000, 999999).toString();
    const newOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    pendingUser.otp = newOtp;
    pendingUser.otpExpires = newOtpExpires;
    await pendingUser.save();

    await sendOTP(email, newOtp);

    res.status(200).json({ msg: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const completeOnboarding = async (req, res) => {
  try {
    const { userType, targetRole, yearsOfExperience } = req.body;
    if (!userType) {
      return res.status(400).json({ error: "User type is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.userType = userType;
    user.targetRole = targetRole || null;
    user.yearsOfExperience = yearsOfExperience || null;
    await user.save();

    res.status(200).json({
      msg: "Onboarding completed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType,
        targetRole: user.targetRole,
        yearsOfExperience: user.yearsOfExperience,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, refreshToken, logout, getMe, changePassword, verifyOTP, resendOTP, completeOnboarding };



