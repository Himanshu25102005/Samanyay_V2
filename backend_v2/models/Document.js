const mongoose = require("mongoose");

const documentSchema = mongoose.Schema({
  documentId: {
    type: String,
    unique: true,
    required: false
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  uploadedByName: String,
  fileName: {
    type: String,
    required: true
  },
  originalFileName: String,
  fileType: String,
  category: {
    type: String,
    enum: ['Filed in Court', 'Available Internally', 'Draft', 'Evidence', 'Other'],
    default: 'Available Internally'
  },
  filePath: String,
  fileSize: Number,
  description: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Document", documentSchema);





