import mongoose from "mongoose";

const coordinatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    imageUrl: { type: String },
    publicId: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Coordinator = mongoose.model("Coordinator", coordinatorSchema);
export default Coordinator;
