// import express from "express";
// import Razorpay from "razorpay";
// import crypto from "crypto";

// const router = express.Router();

// // ✅ Create Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // ✅ Create Order API
// router.post("/create-order", async (req, res) => {
//   try {
//     const { amount, currency = "INR", receipt = "receipt#1" } = req.body;

//     const options = {
//       amount: amount * 100, // Amount in paise
//       currency,
//       receipt,
//     };

//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (err) {
//     console.error("Error creating order:", err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

// // ✅ Verify Payment API
// router.post("/verify", async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature === razorpay_signature) {
//       return res.json({ success: true, message: "Payment verified successfully" });
//     } else {
//       return res.status(400).json({ success: false, message: "Invalid signature" });
//     }
//   } catch (err) {
//     console.error("Error verifying payment:", err);
//     res.status(500).json({ error: "Verification failed" });
//   }
// });

// export default router;