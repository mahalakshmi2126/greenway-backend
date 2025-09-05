import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    maxAttendees: { type: Number, default: 0 },
    attendees: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ["upcoming", "ongoing", "completed"], 
      default: "upcoming" 
    },
    category: { type: String, required: true }, // 👈 added category
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;