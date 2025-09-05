import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
  date: { type: Date, default: Date.now },
  image: { type: String },
  views: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);