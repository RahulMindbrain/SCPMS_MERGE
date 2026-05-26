const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, default: "student" },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    resendCount: { type: Number, default: 0 },
    blockedUntil: { type: Date, default: null },
}, {
    timestamps: true,
    collection: "pending_users"
});

// Auto-delete records after 40 minutes to cleanup expired registrations and enforce lockouts
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2400 });


module.exports = mongoose.model("PendingUser", pendingUserSchema);
