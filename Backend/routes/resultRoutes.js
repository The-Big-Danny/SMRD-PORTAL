const express = require("express");
const router = express.Router();
// Destructure the functions from your controller
const { addResult, getMyResults } = require("../controllers/resultController");
const auth = require("../middleware/authMiddleware");

// @route   POST /api/results
// @access  Private
router.post("/", auth, addResult); // Line 7 - Ensure addResult is not undefined!

// @route   GET /api/results/my-results
// @access  Private
router.get("/my-results", auth, getMyResults);

module.exports = router;

