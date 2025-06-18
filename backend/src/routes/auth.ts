import express, { Request, Response } from "express";
import { User } from "../models/User";

const router = express.Router();

// POST /api/auth/register - User registration
router.post("/register", async (req, res) => {
  try {
    console.log("Register request received:", req.body);
    const { email, password, name } = req.body;

    // Check if user already exists
    console.log("Checking for existing user with email:", email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ error: "User already exists" });
    }

    console.log("Creating new user...");
    const user = new User({ email, password, name });
    await user.save();
    console.log("User created successfully:", user._id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("MongoDB Register Error:", error);
    console.error("Error details:", error.message);
    console.error("Error code:", error.code);
    res
      .status(500)
      .json({ error: "Failed to register user", details: error.message });
  }
});

// POST /api/auth/login - User login
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    console.log("Looking for user with email:", email);
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      console.log("Invalid credentials for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("Login successful for user:", user._id);
    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("MongoDB Login Error:", error);
    console.error("Error details:", error.message);
    console.error("Error code:", error.code);
    res.status(500).json({ error: "Failed to login", details: error.message });
  }
});

export default router;
