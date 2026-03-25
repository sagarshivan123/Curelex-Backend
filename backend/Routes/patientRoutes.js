const express=require("express");
const router = express.Router();

const {createPatient}=require("../Controllers/patientController");
  router.post("/", createPatient);

  module.exports = router;