import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, address, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "mahalakshmicw21@gmail.com",   // 🔹 always send here for testing
      subject: "New Contact Form Submission",
      text: `
📩 New message received:

Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Address: ${address || "N/A"}
Message: ${message}
      `,
    });

    res.json({ success: true, message: "Contact message sent successfully" });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};
