import Donation from "../models/Donation.js";
import crypto from "crypto";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,  // ✅ match .env
});


// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    console.log("Incoming Body:", req.body); // 👈 see amount
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount received" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "donation_" + Date.now(),
    });

    console.log("Razorpay Order:", order);
    res.json(order);
  } catch (err) {
    console.error("Razorpay Error:", err); // 👈 see full error in backend
    res.status(500).json({ error: err.message });
  }
};


// Verify payment + save donation
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donor } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Signature mismatch" });
    }

    // Save donation
    const donation = await Donation.create({
      donorName: donor.name,
      donorEmail: donor.email,
      donorPhone: donor.phone,
      serviceDate: donor.serviceDate,
      instagram: donor.instagram,
      parcelName: donor.parcelName,
      count: donor.count,
      amountPerItem: donor.amount,
      totalAmount: donor.count * donor.amount,
      cause: donor.cause,
      status: "completed",
      method: "Razorpay",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Fetch donation history by email
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


// ✅ Get all donations (for admin)
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Latest donations (limit 10)
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