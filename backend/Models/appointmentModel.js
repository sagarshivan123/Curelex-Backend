const mongoose=require('mongoose');
const slotSchema=require("./slotModel");

const appointmentSchema=new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  doctor: {
    // type:String
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
},
   slot: slotSchema,
  consultationType: {
    type: String,
    enum: ["online", "offline"],
    default: "online"
},
status: {
  type: String,
  enum: [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "rejected"
  ],
  default: "pending"
},
reason: {
  type: String
},

cancelledBy: {
  type: String,
  enum: ["patient", "doctor"]
},

},
{
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);