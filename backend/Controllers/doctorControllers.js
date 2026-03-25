const Doctor = require("../Models/doctorModel");
const Appointment = require("../Models/appointmentModel");
const Consultation = require("../Models/consultationModel");
const { sendNotification } = require("../Utils/NotificationService");

exports.createDoctor = async (req,res)=>{
  try{

    const { name, specialization } = req.body;

    const doctor = await Doctor.create({
      name,
      specialization
    });

    res.status(201).json({
      success:true,
      doctor
    });

  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};

exports.assignSlot = async(req,res)=>{
  try{

    const { start, end } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if(!appointment){
      return res.status(404).json({
        message:"Appointment not found"
      });
    }
    if (["confirmed", "cancelled", "rejected"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Invalid appointment status"
      });
    }

    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }


        // Check slot conflict
    const conflict = await Appointment.findOne({
      doctor: appointment.doctor,
      status: "confirmed",
      $or: [
        {
          "slot.start": { $lt: new Date(end) },
          "slot.end": { $gt: new Date(start) }
        }
      ]
    });
    if(conflict){
      return res.status(400).json({
        message:"This time slot is already booked"
      });
    }

   // Assign slot
   appointment.slot = {
    start: new Date(start),
    end: new Date(end)
  };

  appointment.status = "confirmed";
    await appointment.save();


    res.json({
      success:true,
      message:"Slot assigned",
      appointment,
    });

    sendNotification({
      user: appointment.patient,
      userModel: "Patient",
      title: "Appointment Confirmed",
      message: `Your appointment is scheduled from ${start} to ${end}`
    }).catch(console.error);

  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};

exports.updateAssignSlot = async (req, res) => {
  try {
    const { start, end } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    if (["cancelled", "rejected"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Cannot update slot"
      });
    }

    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({
        message: "Invalid time range"
      });
    }

    // Conflict check 
    const conflict = await Appointment.findOne({
      doctor: appointment.doctor,
      status: "confirmed",
      _id: { $ne: appointment._id },
      $or: [
        {
          "slot.start": { $lt: new Date(end) },
          "slot.end": { $gt: new Date(start) }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({
        message: "This slot is already booked"
      });
    }

    appointment.slot = {
      start: new Date(start),
      end: new Date(end)
    };

    await appointment.save();

    await Consultation.findOneAndUpdate(
      { appointment: appointment._id },
      {
        slot: {
          start: new Date(start),
          end: new Date(end)
        }
      }
    );

    res.json({
      success: true,
      message: "Slot updated",
      appointment
    });

    sendNotification({
      user: appointment.patient,
      userModel: "Patient",
      title: "Appointment Rescheduled",
      message: `New time: ${start} - ${end}`
    }).catch(console.error);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.toggleAvailability = async (req,res)=>{
  try{

    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);

    if(!doctor){
      return res.status(404).json({
        message:"Doctor not found"
      });
    }

    doctor.isAvailable = !doctor.isAvailable;

    await doctor.save();

    res.json({
      success:true,
      message:"Availability updated",
      doctor
    });

  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
};