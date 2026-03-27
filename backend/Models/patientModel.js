const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  age: Number,

  gender: {
    type: String,
    enum: ["male", "female", "other"]
  },

  role: {
    type: String,
    default: "patient"
  }

}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);