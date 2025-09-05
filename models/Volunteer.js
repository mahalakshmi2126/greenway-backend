import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  password: { type: String, required: true },
  volunteerType: { type: String, required: true },
  status: { type: String, default: "pending" }, // pending | accepted | rejected
  appliedDate: { type: Date, default: Date.now },
  experience: { type: String },
});

export default mongoose.model("Volunteer", volunteerSchema);