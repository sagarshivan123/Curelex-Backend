const express=require("express");

const {bookAppointment,  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  getPendingAppointments
}=require("../Controllers/appointmentController.js");

const router = express.Router();

router.post("/book", bookAppointment);

router.get("/patient/:id", getPatientAppointments);

router.get("/getAll-appointments/:id", getDoctorAppointments);

router.get("/pending-appointments/:id",getPendingAppointments)

router.patch("/cancel/:id", cancelAppointment);

module.exports = router;