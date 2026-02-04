const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --- REGISTER NEW STUDENT ---
exports.registerUser = async (req, res) => {
  try {
    const { name, matricNumber, department, level, year, email, phone, password } = req.body;

    // 1. Check if Matric Number already exists
    let userByMatric = await User.findOne({ matricNumber });
    if (userByMatric) {
      return res.status(400).json({ message: "Student with this Matric Number already exists" });
    }

    // 2. Check if Email already exists (Crucial for the notification system)
    let userByEmail = await User.findOne({ email: email.toLowerCase() });
    if (userByEmail) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      matricNumber,
      department,
      level,
      year,
      email: email.toLowerCase(), // Store in lowercase for consistency
      phone,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ success: true, message: "Student registered successfully!" });

  } catch (error) {
    console.error("REGISTER ERROR 👉", error.message);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// --- LOGIN STUDENT ---
exports.loginUser = async (req, res) => {
  try {
    const { matricNumber, password } = req.body;

    const user = await User.findOne({ matricNumber });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: user._id,
        name: user.name,
        matricNumber: user.matricNumber,
        department: user.department,
        email: user.email // Added email to the response
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR 👉", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- GET STUDENT PROFILE ---
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("GET PROFILE ERROR 👉", error.message);
    res.status(500).json({ message: "Server error fetching profile", error: error.message });
  }
};