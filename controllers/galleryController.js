// controllers/galleryController.js (Updated with update)
import Gallery from "../models/Gallery.js";

// ✅ Upload Image
export const uploadImage = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const newImage = new Gallery({
      title,
      description,
      category,
      imageUrl: req.file.path, // cloudinary URL
    });

    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Image
export const updateImage = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const updateData = { title, description, category };

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const image = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!image) return res.status(404).json({ message: "Image not found" });
    res.json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Images
export const getImages = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== "All") {
      filter.category = category;
    }
    const images = await Gallery.find(filter).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Image
export const deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};