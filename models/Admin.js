import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordPlain: { type: String, required: true, select: false }, // ❗ Demo only
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, default: "Admin" },
    role: { type: String, enum: ["admin"], default: "admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordPlain;
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model("Admin", adminSchema);
