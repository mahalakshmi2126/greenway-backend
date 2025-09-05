// models/CoreProgram.js
import mongoose from "mongoose";

const coreProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: {
  type: String,
  required: true,
  enum: [
    "Inclusive Sports Academy",
    "Livelihood & Skills Training",
    "Assistive Devices & Rehabilitation",
    "Environmental Safeguard Projects",
    "Community Advocacy",
  ],
},
});

const CoreProgram = mongoose.model("CoreProgram", coreProgramSchema);
export default CoreProgram;