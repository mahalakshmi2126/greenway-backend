import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";

const signToken = (admin) => {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "1d" }
  );
};

// 🔹 Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: "Admin already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      name: name || "Admin",
      passwordPlain: password, // ❗ Demo only
      passwordHash,
    });

    const token = signToken(admin);
    res.status(201).json({ message: "Admin created", admin, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+passwordHash +passwordPlain");
    if (!admin) return res.status(401).json({ message: "Invalid email or password" });
    if (!admin.isActive) return res.status(403).json({ message: "Account disabled" });

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(admin);
    res.json({ message: "Login successful", token, profile: admin.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};