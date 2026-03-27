const Patient = require("../Models/patientModel");
const bcrypt = require("bcryptjs");

// Register Patient
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, phone, password, age, gender } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Name, email, phone and password are required"
      });
    }

    const existing = await Patient.findOne({
      $or: [{ email }, { phone }]
    });

    if (existing) {
      return res.status(400).json({
        message: "Patient already exists with this email or phone"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      name,
      email,
      phone,
      password: hashedPassword,
      age,
      gender
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};