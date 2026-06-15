import express from "express";
import { upload } from "../config/cloudinary.js";
import {
  getCoordinators,
  createCoordinator,
  updateCoordinator,
  deleteCoordinator,
} from "../controllers/coordinatorController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", getCoordinators);
router.post("/", protect, upload.single("image"), createCoordinator);
router.put("/:id", protect, upload.single("image"), updateCoordinator);
router.delete("/:id", protect, deleteCoordinator);

export default router;
