import Otp from "../models/otp.js";
import Donation from "../models/Donation.js";
import nodemailer from "nodemailer";

// Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email,
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Donation Tracking OTP",
      text: `Your OTP is ${otpCode}. It will expire in 10 minutes.`,
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const record = await Otp.findOne({ email, code }).sort({ createdAt: -1 });

    if (!record || record.expiresAt < new Date()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    const donations = await Donation.find({ donorEmail: email }).sort({
      createdAt: -1,
    });

    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
