const express=require("express");
const router = express.Router();

const {registerPatient}=require("../Controllers/patientController");
router.post("/patient/register", registerPatient);

  module.exports = router;