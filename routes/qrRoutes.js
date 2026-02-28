import express from "express";
import { generateQR, verifyWebhook } from "../controllers/qrController.js";

const router = express.Router();

// Ippo idhu Razorpay official Dynamic QR-ah generate pannum
// Amount-ah lock panna indha route dhaan use aagum
router.post("/generate-qr", generateQR);

// ✅ Webhook: Razorpay indha route-ku signal anuppum (Automatic DB storage)
router.post("/webhook", verifyWebhook);

export default router;