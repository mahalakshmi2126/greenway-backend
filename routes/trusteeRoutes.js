import express from "express";
import { upload } from "../config/cloudinary.js";
import {
  getTrustees,
  createTrustee,
  updateTrustee,
  deleteTrustee,
} from "../controllers/trusteeController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", getTrustees);
router.post("/", protect, upload.single("image"), createTrustee);
router.put("/:id", protect, upload.single("image"), updateTrustee);
router.delete("/:id", protect, deleteTrustee);

export default router;
