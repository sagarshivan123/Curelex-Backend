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

router.put("/start/:appointmentId", startConsultation);
router.put("/update/:id", updateConsultation);
router.post("/prescription/:id", addPrescription);
router.put("/complete/:id", completeConsultation);
router.put("/cancel/:id", cancelConsultation);
router.get("/patient/:patientId", getPatientHistory);
router.get("/doctor/:doctorId", getDoctorConsultations);

module.exports = router;