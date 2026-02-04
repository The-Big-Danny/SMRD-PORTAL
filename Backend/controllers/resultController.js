const Result = require("../models/result");
const User = require("../models/User"); 
const sendEmail = require("../utils/sendEmail"); 

// @desc    Add a new result (Admin Upload)
// @route   POST /api/results
exports.addResult = async (req, res) => {
  try {
    // Destructure matricNumber from body
    const { matricNumber, courseName, courseCode, score, semester, session, unit, year } = req.body;

    // 1. IMPORTANT: Find the ACTUAL student by Matric Number
    const student = await User.findOne({ matricNumber });
    
    if (!student) {
      console.log(`❌ Upload Failed: Student with Matric ${matricNumber} not found.`);
      return res.status(404).json({ message: "Student not found with this Matric Number" });
    }

    // 2. Automatic Grade, Point, and Remark Logic
    let grade, point, remark;
    if (score >= 70) { grade = "A"; point = 5; remark = "Excellent"; }
    else if (score >= 60) { grade = "B"; point = 4; remark = "Very Good"; }
    else if (score >= 50) { grade = "C"; point = 3; remark = "Good"; }
    else if (score >= 45) { grade = "D"; point = 2; remark = "Pass"; }
    else { grade = "F"; point = 0; remark = "Fail"; }

    // 3. Create the result linked to the found Student's _id
    const newResult = new Result({
      student: student._id, // Use the student found above, NOT req.user.id
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
    console.log(`📍 Result saved for ${student.name}. Triggering email...`);

    // --- EMAIL NOTIFICATION LOGIC ---
    try {
      if (!student.email) {
        console.log("⚠️ Student found, but has no email field for notification.");
      } else {
        console.log(`📧 Attempting to send email to: ${student.email}`);
        
        await sendEmail({
          email: student.email,
          subject: `New Result Published: ${courseCode}`,
          message: `Hello ${student.name},\n\nYour result for ${courseName} (${courseCode}) has been uploaded.\n\nGrade: ${grade}\nRemark: ${remark}\n\nLog in to your dashboard to view full details.`
        });
        
        console.log(`✅ SUCCESS: Email sent to ${student.email}`);
      }
    } catch (emailError) {
      console.error("❌ NODEMAILER ERROR:", emailError.message);
    }

    res.status(201).json({ success: true, data: savedResult });
  } catch (error) {
    console.error("ADD RESULT ERROR 👉", error.message);
    res.status(500).json({ message: "Error saving result", error: error.message });
  }
};

// @desc    Get logged in student's results
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error("GET RESULTS ERROR 👉", error.message);
    res.status(500).json({ message: "Error fetching results", error: error.message });
  }
};