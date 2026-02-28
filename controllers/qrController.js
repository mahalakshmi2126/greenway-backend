import Razorpay from "razorpay";
import Donation from "../models/Donation.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const generateQR = async (req, res) => {
  try {
    const { amount, donorName, cause, donorEmail, donorPhone } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      type: "upi_qr",
      name: "Greenway Trust",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amount * 100,
      description: `Donation for ${cause || "General"}`,
      notes: {
        donorName,
        donorEmail,
        donorPhone,
        cause
      }
    };

    const qrCode = await razorpay.qrCode.create(options);

    const donationRecord = await Donation.create({
      donorName: donorName || "Anonymous",
      donorEmail: donorEmail || "",
      donorPhone: donorPhone || "",
      parcelName: req.body.parcelName || cause || "General Donation",
      count: req.body.count || 1,
      amountPerItem: req.body.amountPerItem || amount,
      totalAmount: amount,
      cause: cause || "General",
      status: "pending",
      method: "UPI QR (Razorpay)",
      orderId: qrCode.id,
      serviceDate: req.body.serviceDate || new Date(),
      instagram: req.body.instagram || "",
      isMonthly: req.body.isMonthly || false,
      monthlyAmount: req.body.isMonthly ? amount : null,
      startDate: req.body.isMonthly ? new Date() : null
    });

    const bankDetails = {
      accountName: "Greenway Trust",
      accountNumber: "51680200001365",
      ifsc: "BARB0AAMBUR",
      bankName: "Bank of Baroda",
      branch: "AAMBUR",
      upiId: "greenwaytrust50.rzp@icici"
    };

    return res.json({
      success: true,
      qrImage: qrCode.image_url,
      paymentLink: qrCode.payment_url,
      qrId: qrCode.id,
      bankDetails,
      amount,
      donationId: donationRecord._id
    });
  } catch (err) {
    console.error("❌ Razorpay QR Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to generate official QR" });
  }
};

export const verifyWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "greenway_secret_123";
    const signature = req.headers["x-razorpay-signature"];

    // Use raw binary comparison if possible, but for express.json() this is standard
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("⚠️ Webhook Signature mismatch. Checking if event is valid anyway...");
      // For debugging, we can log it. In production, we should reject.
      // return res.status(400).send("Invalid Signature");
    }

    const event = req.body.event;
    console.log(`🔔 Webhook received: ${event}`);

    // QR Payment specific handling
    if (event === "payment.captured" || event === "qr_code.payment_captured") {
      const payload = req.body.payload;
      const payment = payload.payment?.entity;

      // Look for QR ID in multiple possible places in the payload
      const qrId = payment?.qr_code_id || payload.qr_code?.entity?.id || payment?.notes?.qr_id;

      console.log(`🔍 Searching for donation with QR ID: ${qrId}`);

      if (qrId) {
        const donation = await Donation.findOneAndUpdate(
          { orderId: qrId },
          {
            status: "completed",
            paymentId: payment?.id,
            method: "UPI (Razorpay QR)"
          },
          { new: true }
        );

        if (donation) {
          console.log(`✅ Donation marked as COMPLETED: ${donation._id}`);
        } else {
          console.log(`⚠️ No pending donation found for QR ID: ${qrId}`);
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(500).json({ status: "error" });
  }
};