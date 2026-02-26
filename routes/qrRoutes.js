import express from "express";
import { generateQR } from "../controllers/qrController.js";

const router = express.Router();

// Ippo idhu Razorpay official Dynamic QR-ah generate pannum
// Amount-ah lock panna indha route dhaan use aagum
router.post("/generate-qr", generateQR);

export default router;