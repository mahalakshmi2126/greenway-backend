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

    // 🔹 Razorpay Dynamic QR Code Generation
    const options = {
      type: "upi_qr",
      name: "Greenway Trust",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amount * 100, // paise
      description: `Donation for ${cause || "General"}`,
      notes: {
        donorName,
        donorEmail,
        donorPhone,
        cause
      }
    };

    const qrCode = await razorpay.qrCode.create(options);

    // ✅ Save to DB as 'pending' donation automatically
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
      orderId: qrCode.id, // Store QR ID here to match in Webhook
      serviceDate: req.body.serviceDate || new Date(),
      instagram: req.body.instagram || "",
      isMonthly: req.body.isMonthly || false,
      monthlyAmount: req.body.isMonthly ? amount : null,
      startDate: req.body.isMonthly ? new Date() : null
    });

    // ✅ Bank Details
    const bankDetails = {
      accountName: "Greenway Trust",
      accountNumber: "51680200001365",
      ifsc: "BARB0AAMBUR",
      bankName: "Bank of Baroda",
      branch: "AAMBUR",
      upiId: "greenwaytrust50.rzp@icici"
    };

    console.log("✅ QR Generated and Pending Donation Saved for:", donorName);

    return res.json({
      success: true,
      qrImage: qrCode.image_url,
      paymentLink: qrCode.payment_url,
      qrId: qrCode.id,
      bankDetails: bankDetails,
      amount: amount,
      donationId: donationRecord._id
    });
  } catch (err) {
    console.error("❌ Razorpay QR Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to generate official QR" });
  }
};

// 🔹 Webhook Listener: Store Payment details directly from Razorpay
export const verifyWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "greenway_secret_123";

  // Signature verification (Safety)
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("✅ Webhook Signal Received from Razorpay");

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured" || event === "qr_code.payment_captured") {
      // Extraction logic based on Razorpay Event Structure
      const paymentData = payload.payment.entity;
      const qrId = paymentData.qr_code_id || payload.qr_code?.entity?.id;

      console.log("💰 Payment Captured! QR ID:", qrId, "Payment ID:", paymentData.id);

      try {
        // Find donation by orderId (which stores the QR ID)
        const donation = await Donation.findOneAndUpdate(
          { orderId: qrId },
          {
            status: "completed",
            paymentId: paymentData.id
          },
          { new: true }
        );

        if (donation) {
          console.log(`✅ Success! Database updated for Donation: ${donation._id}`);
        } else {
          console.warn("⚠️ Webhook received but no matching pending donation found for QR ID:", qrId);
        }
      } catch (error) {
        console.error("❌ Webhook Database Update Exception:", error);
      }
    }

    return res.status(200).json({ status: "ok" });
  } else {
    console.error("❌ Invalid Webhook Signature! Verification failed.");
    return res.status(400).send("Invalid Signature");
  }
};