const Result = require("../models/result");
const User = require("../models/user"); 
const sendEmail = require("../utils/sendEmail"); 

// @desc    Add new result (Admin only)
// @route   POST /api/results
exports.addResult = async (req, res) => {
  try {
    const { matricNumber, courseName, courseCode, score, semester, session, unit, year } = req.body;

    // Search specifically in the 'users' collection
    const student = await User.findOne({ matricNumber });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found with this Matric Number" });
    }

    // Logic for grade calculation
    let grade, point, remark;
    if (score >= 70) { grade = "A"; point = 5; remark = "Excellent"; }
    else if (score >= 60) { grade = "B"; point = 4; remark = "Very Good"; }
    else if (score >= 50) { grade = "C"; point = 3; remark = "Good"; }
    else if (score >= 45) { grade = "D"; point = 2; remark = "Pass"; }
    else { grade = "F"; point = 0; remark = "Fail"; }

    const newResult = new Result({
      student: student._id, // References the User ObjectId
      courseName,
      courseCode,
      unit: unit || 3,
      score,
      grade,
      point,
      remark,
      semester,
      session,
      year: year || 1
    });

    const savedResult = await newResult.save();

    // Notify student via email
    try {
      if (student.email) {
        await sendEmail({
          email: student.email,
          subject: `New Result Published: ${courseCode}`,
          message: `Hello ${student.name}, your result for ${courseName} (${courseCode}) has been uploaded. \nGrade: ${grade} \nScore: ${score}`
        });
      }
    } catch (e) { 
      console.error("Email notification failed, but result was saved."); 
    }

    res.status(201).json({ success: true, data: savedResult });
  } catch (error) {
    res.status(500).json({ message: "Error saving result", error: error.message });
  }
};

// @desc    Get logged-in student results
// @route   GET /api/results/my-results
exports.getMyResults = async (req, res) => {
  try {
    // req.user is the string ID from authMiddleware
    // We query the 'student' field which matches your Atlas change
    const results = await Result.find({ student: req.user }).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: results.length, 
      data: results 
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching results", error: error.message });
  }
};
