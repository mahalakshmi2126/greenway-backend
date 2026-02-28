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
        qr_id: null, // Placeholder
        donorName,
        donorEmail,
        donorPhone,
        cause
      }
    };

    const qrCode = await razorpay.qrCode.create(options);

    // Save donation with QR ID in orderId field
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

    return res.json({
      success: true,
      qrImage: qrCode.image_url,
      qrId: qrCode.id,
      bankDetails: {
        accountName: "Greenway Trust",
        accountNumber: "51680200001365",
        ifsc: "BARB0AAMBUR",
        bankName: "Bank of Baroda",
        upiId: "greenwaytrust50.rzp@icici"
      },
      amount,
      donationId: donationRecord._id
    });
  } catch (err) {
    console.error("❌ Razorpay QR Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to generate official QR" });
  }
};

export const verifyWebhook = async (req, res) => {
  // 1. Send immediate 200 response to Razorpay (To stop retries)
  res.status(200).json({ status: "ok" });

  try {
    const event = req.body.event;
    console.log(`🔔 Webhook signal received: ${event}`);

    // If you want to see the full body once in logs for debugging:
    // console.log("BODY:", JSON.stringify(req.body, null, 2));

    let qrId = null;

    // 2. EXTREMELY BROAD EXTRACTION
    // We check every possible field where Razorpay puts the QR ID
    if (req.body.payload) {
      const p = req.body.payload;
      qrId = p.qr_code?.entity?.id ||
        p.payment?.entity?.notes?.qr_id ||
        p.payment?.entity?.notes?.qr_code_id ||
        p.payment?.entity?.qr_code_id ||
        p.payment?.entity?.order_id;
    }

    // 3. Status Update if QR ID found
    if (qrId && (event === "payment.captured" || event === "qr_code.payment_captured")) {
      console.log(`💎 Found QR ID: ${qrId}. Attempting DB Status Update...`);

      const updated = await Donation.findOneAndUpdate(
        { orderId: qrId },
        {
          status: "completed",
          paymentId: req.body.payload.payment?.entity?.id || "WEBHOOK_CAPTURED"
        },
        { new: true }
      );

      if (updated) {
        console.log(`🚀 MISSION SUCCESS! Donation ${updated._id} is now COMPLETED.`);
      } else {
        console.warn(`⚠️ QR ID ${qrId} received, but no matching pending record in DB.`);
      }
    } else {
      console.warn("⚠️ Signal received but couldn't find a valid QR ID to update.");
    }
  } catch (error) {
    console.error("❌ Webhook Processing Error:", error.message);
  }
};