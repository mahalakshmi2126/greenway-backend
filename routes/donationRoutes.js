import express from "express";
import {
  saveDonation,          // new controller for manual/UPI donation
  getDonationsByEmail,
  getAllDonations,
  getLatestDonations,
} from "../controllers/donationController.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// ✅ Manual/UPI donation
router.post("/donations/save", saveDonation);

// OTP routes
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);

// Donation history (by email)
router.get("/donations", getDonationsByEmail);

// Admin fetch all donations
router.get("/donations/all", protect, getAllDonations);

// Latest donations
router.get("/donations/latest", getLatestDonations);

export default router;
