import Financial from "../models/Financial.js";
import { cloudinary } from "../middleware/uploadFinancial.js";

// 🔹 Cloudinary Cleanup Helper
// Inga dhaan namba extension handling-ah correct-a pannanum
const deleteFromCloudinary = async (pdfUrl) => {
  if (!pdfUrl) return;
  try {
    const parts = pdfUrl.split('/');
    const fileNameWithExt = parts[parts.length - 1]; // e.g., "Financial_Report.pdf"
    
    // Check if it's an old 'raw' file or new 'image' type
    if (pdfUrl.includes('/raw/')) {
      const publicId = `greenway_financials/${fileNameWithExt}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } else {
      // Manual name set pannalum, extension illama dhaan 'image' type-ku delete pannanum
      const publicId = `greenway_financials/${fileNameWithExt.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }
    console.log("Cloudinary cleanup successful");
  } catch (err) {
    console.error("Cloudinary Cleanup Warning:", err.message);
  }
};

// 🔹 Add Financial Report
export const addFinancial = async (req, res) => {
  try {
    const { year, description } = req.body;
    if (!year || !description || !req.file) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const newFinancial = new Financial({
      year,
      description,
      pdf: req.file.path, // Middleware-la namba vacha name inga path-a varum
    });

    await newFinancial.save();
    res.status(201).json({ success: true, message: "Added successfully", data: newFinancial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Update Financial Report
export const updateFinancial = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, description } = req.body;
    const financial = await Financial.findById(id);

    if (!financial) return res.status(404).json({ success: false, message: "Not found" });

    financial.year = year || financial.year;
    financial.description = description || financial.description;

    if (req.file) {
      // Padhaiya file-ah (old name) delete pannittu pudhu file-ah (new name) update pannum
      await deleteFromCloudinary(financial.pdf);
      financial.pdf = req.file.path;
    }

    await financial.save();
    res.status(200).json({ success: true, message: "Updated successfully", data: financial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Delete Financial Report
export const deleteFinancial = async (req, res) => {
  try {
    const financial = await Financial.findById(req.params.id);
    if (!financial) return res.status(404).json({ success: false, message: "Not found" });

    await deleteFromCloudinary(financial.pdf);
    await financial.deleteOne();

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get All Reports
export const getFinancials = async (req, res) => {
  try {
    const financials = await Financial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: financials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};