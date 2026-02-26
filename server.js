import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import eventRoutes from "./routes/eventRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
import donationRoutes from "./routes/donationRoutes.js"
import volunteerRoutes from "./routes/volunteerRoutes.js"
import searchRoutes from "./routes/searchRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import coreProgramRoutes from "./routes/coreProgramRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import financialRoutes from "./routes/financialRoutes.js";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: ["http://localhost:8080", "https://greenway-heart-connect.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" })); // increase payload limit
app.use(express.urlencoded({ limit: "50mb", extended: true }));



app.use(express.json());

// ✅ Connect MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};
connectDB();

// ✅ Routes
app.use("/api/admins", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/gallery", galleryRoutes);
// app.use("/api/payments", paymentRoutes);
app.use("/api", donationRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/core-programs", coreProgramRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/financials", financialRoutes);
app.use("/uploads", express.static("uploads"));

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;

// if running locally -> use app.listen
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// if running on Vercel -> just export
export default app;