const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "userModel"
  },
  userModel: {
    type: String,
    required: true,
    enum: ["Patient", "Doctor"]
  },
  title: String,
  message: String,
  type: {
    type: String,
    enum: ["APPOINTMENT", "CONSULTATION", "SYSTEM"],
    default: "APPOINTMENT"
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);