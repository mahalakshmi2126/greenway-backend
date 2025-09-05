import express from "express";
import {
  registerVolunteer,
  getVolunteers,
  updateVolunteerStatus,
  deleteVolunteer,
} from "../controllers/volunteerController.js";

const router = express.Router();

// Registration
router.post("/register", registerVolunteer);

// Get all volunteers
router.get("/", getVolunteers);

// Update volunteer status
router.put("/:id/status", updateVolunteerStatus);

// Delete volunteer
router.delete("/:id", deleteVolunteer);

export default router;