import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";


const router = express.Router();

// Create admin
router.post("/register", registerAdmin);

// Login admin
router.post("/login", loginAdmin);

export default router;