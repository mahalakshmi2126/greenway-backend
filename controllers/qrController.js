import QRCode from "qrcode";

export const generateQR = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const upiId = "greenwaytrust50.rzp@icici";
    const name = "Greenway Trust";

    const upiUrl = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

    const qrImage = await QRCode.toDataURL(upiUrl);

    res.json({ success: true, upiUrl, qrImage });
  } catch (err) {
    console.error("❌ QR generation failed:", err.message);
    res.status(500).json({ success: false, message: "QR generation failed" });
  }
};