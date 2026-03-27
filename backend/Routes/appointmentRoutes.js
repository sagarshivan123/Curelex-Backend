const express=require("express");

const {bookAppointment,  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  getPendingAppointments
}=require("../Controllers/appointmentController.js");

const router = express.Router();
const { protect, isDoctor, isPatient } = require("../middleware/authMiddleware");

router.post("/book",  protect, isPatient, bookAppointment);

router.get("/patient", protect, isPatient, getPatientAppointments);

router.get("/getAll-appointments", protect,isDoctor,  getDoctorAppointments);

router.get("/pending-appointments", protect,isDoctor,  getPendingAppointments);

router.patch("/cancel/:id", protect, cancelAppointment);

module.exports = router;