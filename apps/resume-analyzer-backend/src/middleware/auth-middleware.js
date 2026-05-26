// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   try {
//     const token = req.cookies.token;

//     if (!token) {
//       return res.status(401).json({ error: "No token, authorization denied" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.userId = decoded.id;   
//     req.user = decoded;

//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Token is not valid" });
//   }
// };

// module.exports = { authMiddleware };  

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.warn("[Auth Message] No token found in request to:", req.originalUrl);
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    try {
      // DEBUG: Temporarily ignore expiration to rule out clock drift
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

      req.userId = decoded.id || decoded._id;
      req.user = decoded;

      console.log(`[Auth SUCCESS] User: ${req.userId} at ${req.originalUrl}`);
      next();
    } catch (err) {
      console.error("[Auth FAIL] JWT Verification failed:", err.message);
      return res.status(401).json({
        error: "Token is not valid",
        details: err.message,
        hint: "Clear cookies and log in again."
      });
    }
  } catch (err) {
    console.error("[Auth ERROR] Middleware error:", err.message);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};

const protect = authMiddleware;

const admin = async (req, res, next) => {
  try {
    // 1. Check if role exists in token (req.user is the decoded token)
    let role = req.user?.role;

    // 2. Fallback: If role is missing from token, fetch from DB
    if (!role && req.userId) {
      console.log(`[Admin Debug] Role missing from token for user ${req.userId}, fetching from DB...`);
      const User = require("../models/User"); // Mongoose model
      try {
        const user = await User.findById(req.userId).select("role");
        role = user?.role;
      } catch (err) {
        console.error("[Admin Debug] DB fetch failed:", err.message);
      }
    }

    if (role && (role.toLowerCase() === "admin")) {
      next();
    } else {
      console.warn(`[Admin FAIL] User ${req.userId} denied. Role found: ${role}`);
      res.status(403).json({
        error: "Not authorized as an admin",
        details: "This high-privilege area requires an administrator account."
      });
    }
  } catch (error) {
    console.error("[Admin Critical] Middleware Error:", error);
    res.status(500).json({ error: "Internal server error during authorization check" });
  }
};

module.exports = { authMiddleware, protect, admin };
