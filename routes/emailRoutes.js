const express = require("express");
const router = express.Router();
const {
  sendBulkEmail,
  getEmailHistory,
  getEmailById,
  deleteEmail,
} = require("../controllers/emailController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/emails       → Send bulk email
router.post("/", protect, sendBulkEmail);

// GET /api/emails        → Get email history
router.get("/", protect, getEmailHistory);

// GET /api/emails/:id    → Get single email
router.get("/:id", protect, getEmailById);

// DELETE /api/emails/:id → Delete email record
router.delete("/:id", protect, deleteEmail);

module.exports = router;
