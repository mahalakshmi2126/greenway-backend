import express from "express";
import { createBlog, getBlogs, getAllBlogs, getBlogById, updateBlog, deleteBlog } from "../controllers/blogController.js";
import { upload } from "../config/cloudinary.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", protect, upload.single("image"), createBlog); // Admin create
router.get("/get", getBlogs);           // Public blogs
router.get("/all", getAllBlogs);     // Admin all blogs
router.get("/:id", getBlogById);
router.put(
  "/:id",
  protect,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err.message);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  updateBlog
);      // Admin update
router.delete("/:id", protect, deleteBlog);   // Admin delete

export default router;