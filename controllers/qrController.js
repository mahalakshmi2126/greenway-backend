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

    // 🔹 Razorpay Dynamic QR Code Generation
    const options = {
      type: "upi_qr",
      name: "Greenway Trust",
      usage: "single_use", // Oru vaati pay panna QR expire aagidum (Safety)
      fixed_amount: true,  // Idhu dhaan Amount-ah lock pannum
      payment_amount: amount * 100, // Razorpay paise-la edukkum
      description: `Donation for ${cause}`,
      notes: { donorName, donorEmail }
    };

    const qrCode = await razorpay.qrCode.create(options);

    // ✅ Bank Details (Static-ah display panna response-la anupuroam)
    const bankDetails = {
      accountName: "Greenway Trust",
      accountNumber: "502000XXXXXXX", // Unga NGO original account number inga podunga
      ifsc: "HDFC000XXXX",
      bankName: "HDFC Bank",
      branch: "Your Branch Name"
    };

    return res.json({
      success: true,
      qrImage: qrCode.image_url, // Razorpay-la irundhu vara official QR image
      paymentLink: qrCode.payment_url,
      qrId: qrCode.id,
      bankDetails,
      amount
    });
  } catch (err) {
    console.error("❌ Razorpay QR Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to generate official QR" });
  }
};