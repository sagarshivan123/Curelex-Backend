const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Patient = require("../Models/patientModel");
const Doctor = require("../Models/doctorModel");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};


exports.patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const patient = await Patient.findOne({ email });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    const isMatch = await bcrypt.compare(password, patient.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    res.json({
      success: true,
      token: generateToken(patient._id, "patient"),
      patient
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    res.json({
      success: true,
      token: generateToken(doctor._id, "doctor"),
      doctor
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};