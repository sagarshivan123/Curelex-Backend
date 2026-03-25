const express = require("express");
const router = express.Router();

const {toggleAvailability,createDoctor,assignSlot, updateAssignSlot} = require("../Controllers/doctorControllers");

router.patch("/toggle-availability/:id",toggleAvailability);
router.post("/create", createDoctor);
router.patch("/assign-Slot/:id",assignSlot);
router.put("/updateSlot/:id",updateAssignSlot);


module.exports = router;