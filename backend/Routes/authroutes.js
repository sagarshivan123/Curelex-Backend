const express = require("express");
const router = express.Router();

const {
  patientLogin,
  doctorLogin
} = require("../Controllers/authControllers");


// Patient login
router.post("/patient/login", patientLogin);

// Doctor login
router.post("/doctor/login", doctorLogin);

module.exports = router;