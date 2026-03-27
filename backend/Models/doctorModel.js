const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  specialization: String,

  isAvailable: {
    type: Boolean,
    default: true
  },

  role: {
    type: String,
    default: "doctor"
  }

}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);