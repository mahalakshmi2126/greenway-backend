import mongoose from "mongoose";

const trusteeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    subRole: { type: String },
    bio: { type: String },
    imageUrl: { type: String },
    publicId: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Trustee = mongoose.model("Trustee", trusteeSchema);
export default Trustee;
