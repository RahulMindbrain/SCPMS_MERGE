import { Router } from "express";
import { getCloudinarySignatureController } from "../cloudinaryUploads/cloudinary";

const cloudinaryRoute = Router();

cloudinaryRoute.post("/signature", getCloudinarySignatureController);

export default cloudinaryRoute;
