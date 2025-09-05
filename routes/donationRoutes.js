import express from "express";
import {
  createOrder,
  verifyPayment,
  getDonationsByEmail,
  getAllDonations,
  getLatestDonations,
} from "../controllers/donationController.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Donation + Razorpay
router.post("/payments/create-order", createOrder);
router.post("/payments/verify", verifyPayment);

// OTP
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);

// Donation history (direct without OTP, admin only maybe)
router.get("/donations", getDonationsByEmail);

// ✅ Admin fetch all
router.get("/donations/all", protect, getAllDonations);

router.get("/donations/latest", getLatestDonations); 

export default router;