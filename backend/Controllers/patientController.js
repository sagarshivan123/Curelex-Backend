const Patient = require("../Models/patientModel");


// Create Patient
exports.createPatient = async (req, res) => {
  try {
    const { name, phone, age, gender } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required"
      });
    }

    const existing = await Patient.findOne({ phone });

    if (existing) {
      return res.status(400).json({
        message: "Patient already exists"
      });
    }

    const patient = await Patient.create({
      name,
      phone,
      age,
      gender
    });

    res.status(201).json({
      success: true,
      patient
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};