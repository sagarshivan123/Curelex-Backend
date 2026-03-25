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
meetingLink: {
  type: String
},

prescription: {
  type: String
},

cancelledBy: {
  type: String,
  enum: ["patient", "doctor"]
},

// cancellationReason: {
//   type: String
// }
},
{
    timestamps: true
});
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      appointmentDate: { $type: true },
      startTime: { $type: true }
    }
  }
);
module.exports = mongoose.model('Appointment', appointmentSchema);