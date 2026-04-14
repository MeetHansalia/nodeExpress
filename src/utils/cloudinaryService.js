import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (localFilePath) => {
    console.log("sdfgjdfjk======", process.env.CLOUDINARY_CLOUD_KEY)
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        // file has been uploaded successfully
        console.log("File uploaded successfully to Cloudinary", response.url);
        return response;
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // delete the file from the local filesystem
        }
        console.error("Error uploading image to Cloudinary", error);
        return null;
    } finally {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    }
};