// controllers/blogController.js
import Blog from "../models/Blog.js";

export const createBlog = async (req, res) => {
  try {
    const blog = new Blog({
      ...req.body,
      image: req.file ? req.file.path : "", // 👈 Cloudinary URL
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllBlogs = async (req, res) => { // For admin
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    console.time("UpdateBlog");
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      console.time("ImageUpload");
      updateData.image = req.file.path;
      console.timeEnd("ImageUpload");
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    console.time("DBUpdate");
    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    console.timeEnd("DBUpdate");

    if (!blog) {
      console.timeEnd("UpdateBlog");
      return res.status(404).json({ error: "Blog not found" });
    }

    console.timeEnd("UpdateBlog");
    res.json(blog);
  } catch (error) {
    console.timeEnd("UpdateBlog");
    console.error("Update blog error:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};