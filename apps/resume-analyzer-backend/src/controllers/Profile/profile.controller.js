const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { uploadBufferToCloudinary } = require("../../config/cloudinary.config");

// ====================
// Create Profile API
// ====================
exports.createProfile = async (req, res) => {
  try {
    const { name, email, password, role, bio, phone } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password, and role are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      bio,
      phone
    });

    await user.save();

    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ====================
// Update Profile API
// ====================
exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  console.log(`[Profile Update Request] for ID: ${id}`);
  console.log(`[Profile Update Body]:`, req.body);

  try {
    const { name, bio, phone, github, twitter, linkedin } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (github !== undefined) updateData.github = github;
    if (twitter !== undefined) updateData.twitter = twitter;
    if (linkedin !== undefined) updateData.linkedin = linkedin;

    // Handle profile picture upload
    if (req.file) {
      console.log(`[Profile Update] Processing image upload for ${req.file.originalname}`);
      try {
        const cloudResult = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);
        updateData.profilePic = cloudResult.secure_url;
        console.log(`[Profile Update] Image uploaded to Cloudinary: ${updateData.profilePic}`);
      } catch (cloudErr) {
        console.error(`[Profile Update] Cloudinary Error:`, cloudErr);
        return res.status(500).json({ error: "Failed to upload profile picture to cloud" });
      }
    }

    if (Object.keys(updateData).length === 0) {
      console.warn(`[Profile Update Warn] No fields provided to update for user ID: ${id}`);
      return res.status(400).json({ error: "At least one field to update is required" });
    }

    console.log(`[Profile Update Execution] Updating user ${id} with:`, updateData);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      console.warn(`[Profile Update Warn] User not found: ${id}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`[Profile Update Success] for ID: ${id}`);
    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(`[Profile Update Error] for ID: ${req.params.id}:`, err);
    res.status(500).json({ error: "Server error during profile update" });
  }
};