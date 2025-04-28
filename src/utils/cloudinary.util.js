import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import logger from "../../logger.js";

dotenv.config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File has been uploaded successfully
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Remove file from locally saved temporary file as the upload on server failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    // Delete the file from cloudinary
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    // File has been deleted successfully
    return response;
  } catch (error) {
    logger.error("Error deleting file from Cloudinary:", error);
  }
};
