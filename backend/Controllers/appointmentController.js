const Appointment=require("../Models/appointmentModel.js");
const Doctor = require("../Models/doctorModel");
const Patient = require("../Models/patientModel");
const { sendNotification } = require("../Utils/NotificationService");


//Book Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const patient = req.user.id;
    const { doctor, reason, consultationType } = req.body;

    if (!doctor || !consultationType) {
      return res.status(400).json({
        message: "Doctor and consultation type are required"
      });
    }

    const existing = await Appointment.findOne({
      patient,
      doctor,
      status: { $in: ["pending", "confirmed"] }
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have a pending/confirmed appointment with this doctor"
      });
    }

    const doctorData = await Doctor.findById(doctor);
    if (!doctorData) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    if (!doctorData.isAvailable) {
      return res.status(400).json({
        message: "Doctor is currently unavailable"
      });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      consultationType,
      reason
    });

    res.status(201).json({
      success: true,
      message: "Appointment request sent successfully",
      appointment
    });


    sendNotification({
      user: doctor,
      userModel: "Doctor",
      title: "New Appointment Request",
      message: "A patient has requested an appointment"
    }).catch(console.error);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

//Get Patient Appointments
exports.getPatientAppointments=async(req,res)=>{
  try{
    const patientId = req.user.id;

    const appointments = await Appointment.find({
      patient: patientId
    }).select("consultationType reason status createdAt")
    .populate("doctor", "name specialization email")
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      appointments
    });

  }
  catch(error){
    res.status(500).json({
      message: error.message
    });
  }
}

//Get Doctor Appointments
exports.getDoctorAppointments=async(req,res)=>{
  try{
    const doctorId=req.user.id;
    const appointments=await Appointment.find({
      doctor:doctorId
    }).select("consultationType reason status createdAt")
    .populate("patient", "name email")
    .sort({ createdAt: -1 });

    res.json({
      success:true,
      appointments
    })
  }catch(error){
    res.status(500).json({
      message: error.message
    });
  }
}

// Only Pending Appointments
exports.getPendingAppointments = async (req,res)=>{
  try{
    const doctorId = req.user.id; // 🔥 from token

    const appointments = await Appointment.find({
      doctor: doctorId,
      status: "pending"
    }) .select("consultationType reason status createdAt")
    .populate("patient", "name email") .sort({ createdAt: 1 });


    res.json({
      success:true,
      appointments
    });

  }catch(error){
    res.status(500).json({
      message:error.message
    });
  }
}

//Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    const cancelledBy = req.user.role;

    if (
      cancelledBy === "patient" &&
      appointment.patient.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only cancel your own appointment"
      });
    }

    if (
      cancelledBy === "doctor" &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only manage your own appointments"
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "Completed appointments cannot be cancelled"
      });
    }

    if (["cancelled", "rejected"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Appointment already cancelled/rejected"
      });
    }

    const isDoctor = cancelledBy === "doctor";

    appointment.status = isDoctor ? "rejected" : "cancelled";
    appointment.cancelledBy = cancelledBy;
    appointment.slot = undefined;

    await appointment.save();

    res.json({
      success: true,
      message: isDoctor
        ? "Appointment rejected by doctor"
        : "Appointment cancelled by patient",
      appointment
    });

    sendNotification({
      user: isDoctor ? appointment.patient : appointment.doctor,
      userModel: isDoctor ? "Patient" : "Doctor",
      title: isDoctor ? "Appointment Rejected" : "Appointment Cancelled",
      message: isDoctor
        ? "Doctor rejected your appointment"
        : "Patient cancelled the appointment"
    }).catch(console.error);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
