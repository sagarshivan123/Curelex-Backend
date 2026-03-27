const express = require("express");
const router = express.Router();

const {
  startConsultation,
  updateConsultation,
  addPrescription,
  completeConsultation,
  cancelConsultation,
  getPatientHistory,
  getDoctorConsultations
} = require("../Controllers/consultationController");
const { protect ,isDoctor,isPatient} = require("../middleware/authMiddleware");

router.put("/start/:appointmentId", protect, isDoctor, startConsultation);

router.put("/update/:id", protect, isDoctor, updateConsultation);

router.post("/prescription/:id", protect, isDoctor, addPrescription);

router.put("/complete/:id", protect, isDoctor, completeConsultation);

router.put("/cancel/:id", protect, cancelConsultation);

router.get("/history/:patientId", protect, isDoctor, getPatientHistory);

router.get("/doctor", protect,  isDoctor,getDoctorConsultations);
module.exports = router;