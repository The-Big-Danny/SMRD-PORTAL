const express = require("express");
const router = express.Router();
const { loginUser, registerUser, getProfile } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware"); 

// Public routes
router.post("/login", loginUser);
router.post("/register", registerUser);

// Private route (Protected by auth middleware)
router.get("/profile", auth, getProfile);

module.exports = router;