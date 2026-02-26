import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    donorEmail: { type: String },
    donorPhone: { type: String },
    serviceDate: { type: Date },        // for one-time donations
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

    // ✅ Monthly subscription fields
    isMonthly: { type: Boolean, default: false },
    monthlyAmount: { type: Number },        // amount to pay each month
    nextReminderDate: { type: Date },       // next reminder date
    startDate: { type: Date },              // first subscription date
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);