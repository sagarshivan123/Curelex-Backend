const express = require("express");
const router = express.Router();

const {doctorAvailability,registerDoctor,assignSlot, updateAssignSlot} = require("../Controllers/doctorControllers");

const { protect, isDoctor, isPatient } = require("../middleware/authMiddleware");

router.patch("/toggle-availability/:id", protect,isDoctor,  doctorAvailability);

router.post("/create",  registerDoctor);

router.patch("/assign-Slot/:id", protect, isDoctor, assignSlot);

router.put("/updateSlot/:id", protect,isDoctor, updateAssignSlot);


module.exports = router;