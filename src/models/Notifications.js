const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

const notificationSchema = new Schema(
  {
    user: { type: ObjectId, required: true },
    notificationType: { type: String, required: true, default: "common" },
    severity: {
      type: String,
      enum: ["success", "info", "warning", "error", "in_progress"],
      default: "info",
    },
    content: { type: String, required: true },
    payload: {
      type: Object,
      required: false,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notifications = model("Notification", notificationSchema);

module.exports = Notifications;
