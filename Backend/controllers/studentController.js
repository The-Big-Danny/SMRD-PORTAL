const Student = require("../models/Student");
const Result = require("../models/result");
const bcrypt = require("bcryptjs"); // Don't forget to import this!


exports.registerStudent = async (req, res) => {
  try {
    const {
      fullName,
      matricNumber,
      department,
      level,
      yearOfAdmission,
      email,
      phoneNumber,
      password
    } = req.body;

    // 1. Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ matricNumber }, { email }]
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student already registered with this Matric Number or Email"
      });
    }

    // 2. HASH THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the student instance with the HASHED password
    const student = new Student({
      fullName,
      matricNumber,
      department,
      level,
      yearOfAdmission,
      email,
      phoneNumber,
      password: hashedPassword // Save the hash, not the plain text!
    });

    await student.save();

    // 4. Remove password from the response object for security
    const studentData = student.toObject();
    delete studentData.password;

    res.status(201).json({
      message: "Student registered successfully",
      student: studentData 
    });

  } catch (error) {
    console.error("REGISTER ERROR 👉", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


exports.getStudentDashboard = async (req, res) => {
  try {
    // 1. Get student info (excluding password for security)
    const student = await Student.findById(req.user).select("-password");
    
    // 2. Get all results belonging to this student
    const results = await Result.find({ student: req.user });

    // 3. Send everything at once for the dashboard
    res.status(200).json({
      success: true,
      profile: student,
      results: results
    });

  } catch (error) {
    res.status(500).json({ message: "Error loading dashboard", error: error.message });
  }
};