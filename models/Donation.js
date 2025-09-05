import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    donorPhone: { type: String, required: true },
    serviceDate: { type: Date },
    instagram: { type: String },
    parcelName: { type: String, required: true },
    count: { type: Number, default: 1 },
    amountPerItem: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    cause: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    method: { type: String },
    impact: { type: String },
    orderId: { type: String },
    paymentId: { type: String },
    signature: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);