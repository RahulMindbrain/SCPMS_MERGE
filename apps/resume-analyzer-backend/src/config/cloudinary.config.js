const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload a buffer directly to Cloudinary (returns secure_url)
const uploadBufferToCloudinary = (buffer, originalname, retries = 2) => {
  return new Promise((resolve, reject) => {
    const attemptUpload = (retriesLeft) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "resumes",
          resource_type: "raw", // Required for PDFs and DOCX
          access_mode: "public", // Ensure URL is publicly accessible
          public_id: `resume_${Date.now()}_${originalname.replace(/[^a-zA-Z0-9]/g, "_")}`,
          timeout: 60000, // 60s timeout
        },
        (error, result) => {
          if (error) {
            if (retriesLeft > 0) {
              console.warn(`[Cloudinary] Upload failed, retrying... (${retriesLeft} left):`, error.message);
              setTimeout(() => attemptUpload(retriesLeft - 1), 1000);
            } else {
              return reject(error);
            }
          } else {
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    };

    attemptUpload(retries);
  });
};

module.exports = { cloudinary, uploadBufferToCloudinary };
