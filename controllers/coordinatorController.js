import Coordinator from "../models/Coordinator.js";
import { cloudinary } from "../config/cloudinary.js";

const defaultCoordinators = [
  { name: "A Karthick", role: "Program Coordinator- Environment", order: 0 },
  { name: "Geetha R", role: "Vocational Training Co-ordinator", order: 1 },
  { name: "Muhamed Bilal A", role: "Media & Communications Officer", order: 2 },
  { name: "Ramya M", role: "Volunteer Coordinator", order: 3 },
  { name: "S Anandheswari", role: "Coordinator - Women Empowerment Programs", order: 4 },
  { name: "G Kannan", role: "Community Outreach & Organizational Liaison Officer", order: 5 },
  { name: "M Venkatachalam", role: "Para Sports Overall Coordinator", order: 6 },
  { name: "M Velusamy", role: "Co-ordinator, Wheelchair Basketball (Men)", order: 7 },
  { name: "Sudhalakshmi T", role: "Co-ordinator, Wheelchair Basketball (Women)", order: 8 },
  { name: "Imran R", role: "Co-ordinator, Para Athletics", order: 9 },
  { name: "C Lokesh", role: "Co-ordinator, Para Table Tennis", order: 10 },
  { name: "Mohan T", role: "Para Sitting Volleyball", order: 11 },
  { name: "J Shobana", role: "Para Badminton", order: 12 },
  { name: "Amarnath G", role: "Wheelchair Cricket", order: 13 },
  { name: "Nishanth", role: "Programme Support Volunteer", order: 14 },
  { name: "Surya", role: "Photography & Visual Documentation Coordinator", order: 15 },
];

// ✅ Get All Coordinators (with Auto-Seeding)
export const getCoordinators = async (req, res) => {
  try {
    let count = await Coordinator.countDocuments();
    if (count === 0) {
      console.log("Seeding default coordinators into database...");
      await Coordinator.insertMany(defaultCoordinators);
    }
    const coordinators = await Coordinator.find({}).sort({ order: 1, createdAt: 1 });
    res.json(coordinators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create Coordinator
export const createCoordinator = async (req, res) => {
  try {
    const { name, role, order } = req.body;
    const parsedOrder = order ? parseInt(order, 10) : 0;

    const coordinatorData = {
      name,
      role,
      order: parsedOrder,
    };

    if (req.file) {
      coordinatorData.imageUrl = req.file.path;
      coordinatorData.publicId = req.file.filename;
    }

    const coordinator = new Coordinator(coordinatorData);
    await coordinator.save();
    res.status(201).json(coordinator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Coordinator
export const updateCoordinator = async (req, res) => {
  try {
    const { name, role, order } = req.body;
    const coordinator = await Coordinator.findById(req.params.id);
    if (!coordinator) {
      return res.status(404).json({ message: "Coordinator not found" });
    }

    if (req.file) {
      if (coordinator.publicId) {
        try {
          await cloudinary.uploader.destroy(coordinator.publicId);
        } catch (err) {
          console.error("Failed to delete old image from Cloudinary:", err.message);
        }
      }
      coordinator.imageUrl = req.file.path;
      coordinator.publicId = req.file.filename;
    }

    if (name) coordinator.name = name;
    if (role) coordinator.role = role;
    if (order !== undefined) coordinator.order = parseInt(order, 10);

    await coordinator.save();
    res.json(coordinator);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Coordinator
export const deleteCoordinator = async (req, res) => {
  try {
    const coordinator = await Coordinator.findById(req.params.id);
    if (!coordinator) {
      return res.status(404).json({ message: "Coordinator not found" });
    }

    if (coordinator.publicId) {
      try {
        await cloudinary.uploader.destroy(coordinator.publicId);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err.message);
      }
    }

    await coordinator.deleteOne();
    res.json({ message: "Coordinator deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
