const express = require("express");
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

dotenv.config();
const app = express();

// 1. Connect to Database
connectDB();

// 2. Middleware
app.use(cors()); // In production, you can restrict this to your frontend URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Prevent Back-Button Cache (Crucial for Auth Defense)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// 4. Test User Logic (Keep this for the defense so you always have a login)
const createTestUser = async () => {
  try {
    const existingUser = await User.findOne({ matricNumber: "SMRD001" });
    if (existingUser) return;
    const hashedPassword = await bcrypt.hash("password123", 10);
    await User.create({
      name: "Test Student",
      matricNumber: "SMRD001",
      password: hashedPassword,
      role: "student",
    });
    console.log("✅ Default Test User: SMRD001 / password123");
  } catch (error) {
    console.error("❌ Test user error:", error.message);
  }
};
createTestUser();

// 5. Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));

// 6. Root Endpoint
app.get("/", (req, res) => {
  res.send("SMRD Portal API is Online");
});

// 7. Port Configuration for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);

});
