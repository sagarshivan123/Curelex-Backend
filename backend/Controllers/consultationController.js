const Consultation = require("../Models/consultationModel");
const Appointment = require("../Models/appointmentModel");
const { sendNotification } = require("../Utils/NotificationService");


exports.startConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    if (["cancelled", "rejected"].includes(appointment.status)) {
      return res.status(400).json({
        message: "Cannot start consultation for cancelled/rejected appointment"
      });
    }

    if (appointment.status === "pending") {
      appointment.status = "confirmed";
      await appointment.save();
    }

    let consultation = await Consultation.findOne({
      appointment: appointmentId
    });

    
    if (consultation) {
      if (consultation.doctor.toString() !== req.user.id) {
        return res.status(403).json({
          message: "Not authorized"
        });
      }
      
      if (consultation.status === "Ongoing") {
        return res.status(400).json({
          message: "Consultation already ongoing"
        });
      }

      if (["Completed", "Cancelled"].includes(consultation.status)) {
        return res.status(400).json({
          message: `Cannot start a ${consultation.status.toLowerCase()} consultation`
        });
      }
    }

    // Create consultation if not exists
    if (!consultation) {
      consultation = await Consultation.create({
        appointment: appointment._id,
        patient: appointment.patient,
        doctor: appointment.doctor,
        slot: appointment.slot,
        symptoms: "Not provided yet",
        status: "Ongoing"
      });
    } else {
      consultation.status = "Ongoing";
      await consultation.save();
    }

    res.json({
      success: true,
      message: "Consultation started",
      consultation
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.updateConsultation = async (req, res) => {
  try {
    const { symptoms, diagnosis, notes } = req.body;

    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (symptoms) consultation.symptoms = symptoms;
    if (diagnosis) consultation.diagnosis = diagnosis;
    if (notes) consultation.notes = notes;

    await consultation.save();

    res.json({
      success: true,
      consultation
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addPrescription = async (req, res) => {
  try {
    const { medicines } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        message: "Medicines are required"
      });
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    if (consultation.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }
    
    if (consultation.status === "Completed") {
      return res.status(400).json({
        message: "Cannot modify completed consultation"
      });
    }
    const existingNames = consultation.prescription.map(p => p.medicineName);

    const newMeds = medicines.filter(
      m => !existingNames.includes(m.medicineName)
    );
    
    consultation.prescription.push(...newMeds);

    await consultation.save();

    res.json({
      success: true,
      message: "Prescription added",
      consultation
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (consultation.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    if (consultation.status === "Cancelled") {
      return res.status(400).json({
        message: "Cancelled consultation cannot be completed"
      });
    }
    if (consultation.status === "Completed") {
      return res.status(400).json({
        message: "Consultation already completed"
      });
    }

    consultation.status = "Completed";
    await consultation.save();

    // ALSO update appointment
    await Appointment.findByIdAndUpdate(consultation.appointment, {
      status: "completed"
    });

    res.json({
      success: true,
      message: "Consultation completed",
      consultation
    });

    sendNotification({
      user: consultation.patient,
      userModel: "Patient",
      title: "Consultation Completed",
      message: "Your consultation is completed.Please check your prescription."
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (consultation.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.status === "Completed") {
      return res.status(400).json({
        message: "Completed consultation cannot be cancelled"
      });
    }
    if (consultation.status === "Cancelled") {
      return res.status(400).json({
        message: "Consultation already cancelled"
      });
    }

    consultation.status = "Cancelled";
    await consultation.save();

    await Appointment.findByIdAndUpdate(consultation.appointment, {
      status: "cancelled"
    });

    res.json({
      success: true,
      message: "Consultation cancelled"
    });

    sendNotification({
      user: consultation.patient,
      userModel: "Patient",
      title: "Consultation Cancelled",
      message: "Your consultation has been cancelled"
    }).catch(console.error);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    const hasAccess = await Appointment.exists({
      patient: patientId,
      doctor: doctorId
    });
    
if (!hasAccess) {
  return res.status(403).json({
    message: "You are not authorized to view this patient's history"
  });
}

    const consultations = await Consultation.find({
      patient: patientId
      ,doctor: doctorId
    })
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });

      if (consultations.length === 0) {
        return res.status(403).json({
          message: "No consultation history found or not authorized"
        });
      }

      const history = consultations.map(c => ({
        date: c.createdAt,
        doctor: c.doctor?.name,
        specialization: c.doctor?.specialization,
        symptoms: c.symptoms,
        diagnosis: c.diagnosis,
        notes: c.notes,
        medicines: c.prescription
      }));

    res.json({
      success: true,
      history
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

exports.getDoctorConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      doctor: req.user.id
    })
    .select("status symptoms createdAt prescriptions")
      .populate("patient", "name phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      consultations
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};