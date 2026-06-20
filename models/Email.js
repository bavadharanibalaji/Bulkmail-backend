const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    body: { type: String, required: true },
    recipients: [{ type: String, required: true }],
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["sent", "failed", "partial"],
      default: "sent",
    },
    successCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
    failedEmails: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Email", emailSchema);
