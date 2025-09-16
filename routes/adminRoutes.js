import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerAdmin, loginAdmin, getAdminProfile } from "../controllers/adminController.js";

const router = express.Router();

// Create admin
router.post("/register", registerAdmin);

// Login admin
router.post("/login", loginAdmin);

router.get("/me", protect, getAdminProfile);

export default router;