const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Points to the User model/collection
    required: true
  },
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  unit: { type: Number, required: true, default: 3 },
  score: { type: Number, required: true, min: 0, max: 100 },
  grade: { type: String, required: true },
  point: { type: Number, required: true },
  remark: { type: String, required: true },
  semester: { type: String, enum: ["First", "Second"], required: true },
  session: { type: String, required: true },
  year: { type: Number, required: true, min: 1, max: 4, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);
