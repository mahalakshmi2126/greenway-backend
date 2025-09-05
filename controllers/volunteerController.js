import Volunteer from "../models/Volunteer.js";

// ✅ Register new volunteer
export const registerVolunteer = async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all volunteers
export const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update volunteer status (accept / reject)
export const updateVolunteerStatus = async (req, res) => {
  try {
    const { status } = req.body; // "accepted" / "rejected"
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete volunteer
export const deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    res.json({ message: "Volunteer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};