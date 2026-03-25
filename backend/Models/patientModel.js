const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  age: Number,
  gender: {
    type: String,
    enum: ["male", "female", "other"]
  },
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);