import Blog from "../models/Blog.js";
import Event from "../models/Event.js";
import Gallery from "../models/Gallery.js";

// @desc Global search (blogs, events, gallery)
export const globalSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json([]);
    }

    const regex = new RegExp(query, "i"); // case-insensitive

    // 🔍 Parallel search
    const [blogs, events, gallery] = await Promise.all([
      Blog.find({ title: regex, status: "published" }).select("title _id").limit(5),
      Event.find({ title: regex }).select("title _id").limit(5),
      Gallery.find({ title: regex }).select("title _id").limit(5),
    ]);

    // Format unified results
    const results = [
      ...blogs.map((b) => ({ type: "Blog", title: b.title, path: `/blog/${b._id}` })),
      ...events.map((e) => ({ type: "Event", title: e.title, path: `/events/${e._id}` })),
      ...gallery.map((g) => ({ type: "Gallery", title: g.title, path: `/gallery` })),
    ];

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};