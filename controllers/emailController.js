const nodemailer = require("nodemailer");
const Email = require("../models/Email");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
};

const sendBulkEmail = async (req, res) => {
  try {
    const { subject, body, recipients } = req.body;

    if (!subject || !body || !recipients || recipients.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transporter = createTransporter();
    const successList = [];
    const failList = [];

    // Send to each recipient
    for (const email of recipients) {
      try {
        await transporter.sendMail({
          from: `"Bulk Mailer" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #4f46e5; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">📧 Bulk Mailer</h1>
              </div>
              <div style="padding: 30px; background: #f9fafb;">
                ${body.replace(/\n/g, "<br/>")}
              </div>
              <div style="padding: 15px; background: #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
                Sent via Bulk Mailer App
              </div>
            </div>
          `,
        });
        successList.push(email);
      } catch (err) {
        failList.push(email);
      }
    }

    // Determine status
    let status = "sent";
    if (failList.length === recipients.length) status = "failed";
    else if (failList.length > 0) status = "partial";

    // Save to database
    const emailRecord = await Email.create({
      subject,
      body,
      recipients,
      sentBy: req.user._id,
      status,
      successCount: successList.length,
      failCount: failList.length,
      failedEmails: failList,
    });

    res.status(201).json({
      message: `Emails sent! ${successList.length} succeeded, ${failList.length} failed.`,
      status,
      successCount: successList.length,
      failCount: failList.length,
      failedEmails: failList,
      emailRecord,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmailHistory = async (req, res) => {
  try {
    const emails = await Email.find({ sentBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sentBy", "name email");
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id).populate("sentBy", "name email");
    if (!email) return res.status(404).json({ message: "Email not found" });
    res.json(email);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEmail = async (req, res) => {
  try {
    await Email.findByIdAndDelete(req.params.id);
    res.json({ message: "Email record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendBulkEmail, getEmailHistory, getEmailById, deleteEmail };
