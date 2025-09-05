import CoreProgram from "../models/CoreProgram.js";

// Get All Core Programs
export const getCorePrograms = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const corePrograms = await CoreProgram.find(query);
    res.json(corePrograms);
  } catch (error) {
    console.error("Error fetching core programs:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create Core Program
export const createCoreProgram = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const image = req.file ? req.file.path : "";

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const coreProgram = new CoreProgram({
      title,
      description,
      category,
      image,
    });

    await coreProgram.save();
    res.status(201).json(coreProgram);
  } catch (error) {
    console.error("Error creating core program:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update Core Program
export const updateCoreProgram = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const updateData = { title, description, category };
    if (req.file) {
      updateData.image = req.file.path;
    }

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const coreProgram = await CoreProgram.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!coreProgram) return res.status(404).json({ message: "Core Program not found" });
    res.json(coreProgram);
  } catch (error) {
    console.error("Error updating core program:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete Core Program
export const deleteCoreProgram = async (req, res) => {
  try {
    const coreProgram = await CoreProgram.findByIdAndDelete(req.params.id);
    if (!coreProgram) return res.status(404).json({ message: "Core Program not found" });
    res.json({ message: "Core Program deleted" });
  } catch (error) {
    console.error("Error deleting core program:", error);
    res.status(500).json({ message: "Server Error" });
  }
};