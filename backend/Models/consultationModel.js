const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true
  },
  dosage: String,
  duration: String,
  instructions: String
});

const consultationSchema = new mongoose.Schema({

  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },

  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  slot: {
    appointmentDate: String,
    startTime: String,
    endTime: String
  },

  symptoms: {
    type: String,
    required: true
  },

  diagnosis: String,

  notes: String,

  prescription: [prescriptionSchema],

  status: {
    type: String,
    enum: ["Scheduled", "Ongoing", "Completed", "Cancelled"],
    default: "Scheduled"
  }

}, { timestamps: true });

module.exports = mongoose.model("Consultation", consultationSchema);