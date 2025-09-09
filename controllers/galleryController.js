// controllers/galleryController.js (Updated with update)
import Gallery from "../models/Gallery.js";
import { cloudinary } from "../config/cloudinary.js";

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
      imageUrl: req.file.path, 
      publicId: req.file.filename, 
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
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    if (req.file) {
      // delete old image from Cloudinary
      await cloudinary.uploader.destroy(image.publicId);

      image.imageUrl = req.file.path;
      image.publicId = req.file.filename;
    }

    if (title) image.title = title;
    if (description) image.description = description;
    if (category) image.category = category;

    await image.save();
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

export const deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // remove from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // remove from DB
    await image.deleteOne();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
