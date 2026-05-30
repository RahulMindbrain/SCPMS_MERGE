import { useState } from "react";
import { uploadFileToCloudinary } from "../services/cloudinary.service";
import { toast } from "sonner"; // Assuming sonner is used based on package.json

export const useCloudinaryUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, folder?: string): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    // Strict 10MB Max File Size Limit
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      const message = "PDF size must be less than 10MB";
      setError(message);
      toast.error(message);
      setIsUploading(false);
      return null;
    }

    // Strict PDF Only Validation
    if (file.type !== "application/pdf") {
      const message = "Only PDF files are allowed";
      setError(message);
      toast.error(message);
      setIsUploading(false);
      return null;
    }

    try {
      const url = await uploadFileToCloudinary(file, folder);
      return url;
    } catch (err: any) {
      const message = err?.message || "Failed to upload file to Cloudinary";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error };
};
