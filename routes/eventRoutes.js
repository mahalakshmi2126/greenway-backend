import express from "express";
import {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { upload } from "../config/cloudinary.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/get", getEvents);        // GET all events
router.post("/create", protect, upload.single("image"), createEvent); // CREATE event
router.get("/:id", getEventById);  // GET event by ID
router.put("/:id", protect, upload.single("image"), updateEvent);   // UPDATE event
router.delete("/:id", protect, deleteEvent);// DELETE event

export default router;