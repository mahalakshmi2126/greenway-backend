// routes/coreProgramRoutes.js
import express from "express";
import {
  getCorePrograms,
  createCoreProgram,
  updateCoreProgram,
  deleteCoreProgram,
} from "../controllers/coreProgramController.js";
import { upload } from "../config/cloudinary.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", getCorePrograms); // Get all core programs
router.post("/", protect, upload.single("image"), createCoreProgram); // Create core program
router.put("/:id", protect, upload.single("image"), updateCoreProgram); // Update core program
router.delete("/:id", protect, deleteCoreProgram); // Delete core program

export default router;