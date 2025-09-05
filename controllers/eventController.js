import Event from "../models/Event.js";

// @desc Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Create event

export const createEvent = async (req, res) => {
  try {
    console.log("Uploaded file:", req.file ? req.file.path : "No file");
    const event = new Event({
      ...req.body,
      maxAttendees: Number(req.body.maxAttendees) || 0,
      image: req.file ? req.file.path : "",
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Get event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Update event
export const updateEvent = async (req, res) => {
  try {
    console.log("Uploaded file:", req.file ? req.file.path : "No file");
    const updateData = { ...req.body, maxAttendees: Number(req.body.maxAttendees) || 0 };
    if (req.file) updateData.image = req.file.path;
    else if (req.body.image) updateData.image = req.body.image;
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};