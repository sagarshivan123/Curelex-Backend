const Notification = require("../Models/notificationModel");

exports.sendNotification = async ({
  user,
  userModel,
  title,
  message,
  type = "APPOINTMENT"
}) => {
  await Notification.create({
    user,
    userModel,
    title,
    message,
    type
  });
};

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    user: req.params.userId
  }).sort({ createdAt: -1 });

  res.json(notifications);
};

exports.markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true
  });

  res.json({ message: "Marked as read" });
};