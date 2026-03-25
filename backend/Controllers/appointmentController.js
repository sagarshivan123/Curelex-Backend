const Appointment=require("../Models/appointmentModel.js");
const Doctor = require("../Models/doctorModel");
const Patient = require("../Models/patientModel");
const { sendNotification } = require("../Utils/NotificationService");


//Book Appointment
exports.bookAppointment=async(req,res)=>{
  try{
     const {patient,doctor,reason,consultationType}=req.body;

    if (!patient || !doctor|| !consultationType) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    const existing = await Appointment.findOne({
      patient,
      doctor,
      status: "pending"
    });
    
    if(existing){
      return res.status(400).json({
        message:"You already have a pending appointment request with this doctor"
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
    const patientData = await Patient.findById(patient);

if (!patientData) {
  return res.status(404).json({
    message: "Patient not found"
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


  }catch(error){
    res.status(500).json({
      message: error.message
    });
  }
}

//Get Patient Appointments
exports.getPatientAppointments=async(req,res)=>{
  try{
    const patientId = req.params.id;

    const appointments = await Appointment.find({
      patient: patientId
    }).populate("doctor");

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
    const doctorId=req.params.id;
    const appointments=await Appointment.find({
      doctor:doctorId
    }).populate("patient").sort({ appointmentDate: 1 });

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
    const appointments = await Appointment.find({
      doctor:req.params.id,
      status:"pending"
    }).sort({createdAt:1});

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
exports.cancelAppointment=async(req,res)=>{
  try {
    const { cancelledBy } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }
    if(appointment.status === "completed"){
      return res.status(400).json({
        message:"Completed appointments cannot be cancelled"
      });
    }
    if (appointment.status === "cancelled" || appointment.status === "rejected") {
      return res.status(400).json({
        message: "Appointment already cancelled/rejected"
      });
    }
    
    appointment.status = cancelledBy === "doctor" ? "rejected" : "cancelled";
    appointment.cancelledBy = cancelledBy;
    
    //clear slot if appointment is cancelled or rejected
    appointment.slot = undefined;
    
    await appointment.save();

    res.json({
      success: true,
      message: cancelledBy === "doctor"
        ? "Appointment rejected by doctor"
        : "Appointment cancelled by patient",
      appointment
    });

    const targetUser =
  cancelledBy === "doctor"
    ? appointment.patient
    : appointment.doctor;

const targetModel =
  cancelledBy === "doctor" ? "Patient" : "Doctor";

sendNotification({
  user: targetUser,
  userModel: targetModel,
  title: "Appointment Cancelled",
  message:
    cancelledBy === "doctor"
      ? "Doctor rejected your appointment"
      : "Patient cancelled the appointment"
}).catch(console.error);

  } catch(error){
    res.status(500).json({
      message: error.message
    });
  }
}
