import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "greenway_financials",
    resource_type: "image",
    format: "pdf",
    // Intha function original filename-ah public_id-ah mathum
    public_id: (req, file) => {
      // "my-report.pdf" -> "my-report" (extension remove panrom)
      const fileName = file.originalname.split('.')[0];
      // File name-la spaces irundha replace panna idhu safe
      return fileName.replace(/\s+/g, '_'); 
    },
  },
});

export const uploadFinancial = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export { cloudinary };