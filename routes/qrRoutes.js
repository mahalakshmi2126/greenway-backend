import express from "express";
import { generateQR } from "../controllers/qrController.js";

const router = express.Router();

// POST /api/qr/generate-qr
router.post("/generate-qr", generateQR);

export default router;  // ✅ important
