import axios from "axios";
import { postAPI } from "../apis/api";

interface CloudinarySignatureResponse {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder?: string;
}

/**
 * Uploads a file directly to Cloudinary using a signed request from the backend.
 * @param file The file to upload.
 * @param folder The folder in Cloudinary to upload to.
 * @returns The secure URL of the uploaded file.
 */
export const uploadFileToCloudinary = async (file: File, folder: string = "scpms"): Promise<string> => {
  try {
    // 1. Get signature from backend
    const { timestamp, signature, cloudName, apiKey } = await postAPI<CloudinarySignatureResponse>("/cloudinary/signature", { folder });

    // 2. Prepare Form Data for Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    // 3. Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    
    // We use a fresh axios instance to avoid our backend interceptors (like auth headers) 
    // being sent to Cloudinary, which might cause issues or expose tokens.
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
