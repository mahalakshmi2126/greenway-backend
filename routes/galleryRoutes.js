// routes/galleryRoutes.js (Updated with put)
import express from "express";
import { upload } from "../config/cloudinary.js";
import { uploadImage, updateImage, getImages, deleteImage } from "../controllers/galleryController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/upload", protect, upload.single("image"), uploadImage); // Admin Upload
router.put("/:id", protect, upload.single("image"), updateImage); // Admin Update
router.get("/", getImages); // Get All Images
router.delete("/:id", protect, deleteImage); // Delete Image

export default router;