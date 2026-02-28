import Razorpay from "razorpay";
import Donation from "../models/Donation.js";

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

    // 1. First, create a pending record in DB to get its _id
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
      serviceDate: req.body.serviceDate || new Date(),
      instagram: req.body.instagram || "",
      isMonthly: req.body.isMonthly || false,
      monthlyAmount: req.body.isMonthly ? amount : null,
      startDate: req.body.isMonthly ? new Date() : null
    });

    // 2. Now create QR Code and put THIS donationRecord._id in notes
    const options = {
      type: "upi_qr",
      name: "Greenway Trust",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amount * 100,
      description: `Donation for ${cause || "General"}`,
      notes: {
        db_donation_id: donationRecord._id.toString(), // ✅ THIS IS KEY
        donorName: donorName || "Anonymous",
        donorPhone: donorPhone || ""
      }
    };

    const qrCode = await razorpay.qrCode.create(options);

    // 3. Update the record with the QR ID
    donationRecord.orderId = qrCode.id;
    await donationRecord.save();

    console.log(`✅ QR Created for Donation: ${donationRecord._id}`);

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
  // Acknowledge immediately
  res.status(200).json({ status: "ok" });

  try {
    const { event, payload } = req.body;
    console.log(`🔔 Webhook signal: ${event}`);

    let donationId = null;

    // ✅ THE MOST RELIABLE WAY: Pull Donation ID from our custom notes
    const payment = payload.payment?.entity;
    donationId = payment?.notes?.db_donation_id;

    // Fallback: If not in notes, search via QR ID/Order ID
    const qrId = payload.qr_code?.entity?.id || payment?.qr_code_id || payment?.order_id;

    if (donationId) {
      console.log(`💎 Found DB Donation ID: ${donationId}. Updating status...`);
      const updated = await Donation.findByIdAndUpdate(
        donationId,
        {
          status: "completed",
          paymentId: payment?.id,
          method: "UPI (Paid via QR)"
        },
        { new: true }
      );
      if (updated) {
        console.log(`🚀 SUCCESS! Donation ${updated._id} is now COMPLETED.`);
        return;
      }
    }

    if (qrId) {
      console.log(`🔍 Searching by QR ID: ${qrId}`);
      const updatedByQR = await Donation.findOneAndUpdate(
        { orderId: qrId },
        {
          status: "completed",
          paymentId: payment?.id
        },
        { new: true }
      );
      if (updatedByQR) {
        console.log(`🚀 SUCCESS (via QR ID)! Donation ${updatedByQR._id} COMPLETED.`);
      } else {
        console.warn(`⚠️ No record found for QR ID: ${qrId}`);
      }
    }

  } catch (error) {
    console.error("❌ Webhook Fatal Error:", error.message);
  }
};