import mongoose from "mongoose";

const financialSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pdf: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Financial = mongoose.model("Financial", financialSchema);

export default Financial;