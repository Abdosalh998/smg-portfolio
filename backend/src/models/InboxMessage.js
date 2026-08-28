const mongoose = require('mongoose');

const inboxMessageSchema = new mongoose.Schema(
  {
    fullName:    { type: String, required: true, trim: true },
    companyName: { type: String, default: '', trim: true },
    phone:       { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true },
    subject:     { type: String, required: true, trim: true },
    message:     { type: String, required: true, trim: true },
    ipAddress:   { type: String, default: '' },
    userAgent:   { type: String, default: '' },
    isRead:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InboxMessage', inboxMessageSchema);
