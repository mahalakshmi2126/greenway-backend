import Donation from "../models/Donation.js";
import crypto from "crypto";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount received" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // convert INR to paise
      currency: "INR",
      receipt: "donation_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Verify payment + save donation
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donor,
    } = req.body;

    console.log("Verify Payment Input:", req.body);

    // Validate required fields
    const requiredFields = ["name", "email", "phone", "parcelName", "amount", "cause"];
    const missingFields = requiredFields.filter((field) => !donor[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Signature validation
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log("Signature Check:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      expectedSignature,
      razorpay_signature,
    });

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Signature mismatch" });
    }

    // Save donation
    const donation = await Donation.create({
      donorName: donor.name,
      donorEmail: donor.email,
      donorPhone: donor.phone,
      serviceDate: donor.serviceDate || null,
      instagram: donor.instagram || "",
      parcelName: donor.parcelName,
      count: donor.count || 1,
      amountPerItem: donor.amount,
      totalAmount: donor.count * donor.amount,
      cause: donor.cause,
      status: "completed",
      method: "Razorpay",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    console.log("Donation Saved:", donation);
    res.status(200).json({ success: true, donation });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get donations by email
export const getDonationsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const donations = await Donation.find({ donorEmail: email }).sort({
      createdAt: -1,
    });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all donations
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Latest donations
export const getLatestDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "completed" })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};