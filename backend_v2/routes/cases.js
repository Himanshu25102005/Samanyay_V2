const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Case = require("../models/Case");
const Task = require("../models/Task");
const Document = require("../models/Document");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  console.log("Connecting to MongoDB from cases router...");
  mongoose.connect(process.env.MONGO_URL || process.env.DB_SAMANYAY || "mongodb://127.0.0.1:27017/Samanyay_v2")
    .then(() => console.log("MongoDB connected from cases router"))
    .catch(err => console.error("MongoDB connection error:", err));
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept all file types
  }
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  // For development, allow all requests
  // Uncomment below lines for production
  // if (req.isAuthenticated()) {
  //   return next();
  // }
  // return res.status(401).json({ success: false, message: "Authentication required" });
  return next();
};

// ========== CASE ROUTES ==========

// Get all cases for the authenticated user
router.get("/api/cases", isAuthenticated, async (req, res) => {
  try {
    console.log("Fetching cases...");
    // For development: get all cases if no user
    const cases = await Case.find({})
      .sort({ updatedAt: -1 });
    
    console.log("Found cases:", cases.length);
    res.json({ success: true, cases: cases || [] });
  } catch (error) {
    console.error("Error fetching cases:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ success: false, message: "Failed to fetch cases", error: error.message });
  }
});

// Get a specific case by ID
router.get("/api/cases/:caseId", isAuthenticated, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.caseId)
      .populate({
        path: 'tasks',
        populate: { path: 'assignedTo', select: 'name email' }
      })
      .populate('documents')
      .populate('collaborators', 'name email');
    
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    
    // Check if user has access to this case
    if (caseData.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    
    res.json({ success: true, case: caseData });
  } catch (error) {
    console.error("Error fetching case:", error);
    res.status(500).json({ success: false, message: "Failed to fetch case", error: error.message });
  }
});

// Create a new case
router.post("/api/cases", isAuthenticated, async (req, res) => {
  try {
    console.log("Creating case with data:", req.body);
    
    // Use default userId if user is not authenticated (for development)
    let userId;
    if (req.user && req.user._id) {
      userId = req.user._id;
      console.log("Using authenticated userId:", userId);
    } else {
      // Create a default ObjectId for development
      userId = new mongoose.Types.ObjectId('000000000000000000000000');
      console.log("Using default userId for development");
    }
    
    const caseData = {
      userId: userId,
      caseID: `CASE-${Date.now()}`, // Generate a simple ID for now
      clientDetails: {
        name: req.body.clientName,
        phone: req.body.clientPhone,
        email: req.body.clientEmail
      },
      caseSummary: req.body.caseSummary,
      nextSteps: req.body.nextSteps,
      nextDate: req.body.nextDate ? new Date(req.body.nextDate) : null,
      status: req.body.status || 'Active',
      tags: req.body.tags || []
    };
    
    const newCase = new Case(caseData);
    await newCase.save();
    
    console.log("Case created successfully:", newCase);
    res.status(201).json({ success: true, case: newCase });
  } catch (error) {
    console.error("Error creating case:", error);
    console.error("Error details:", error.stack);
    res.status(500).json({ success: false, message: "Failed to create case", error: error.message });
  }
});

// Update a case
router.put("/api/cases/:caseId", isAuthenticated, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    
    // Check if user has access to this case
    if (caseData.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    
    // Update fields
    if (req.body.clientName) caseData.clientDetails.name = req.body.clientName;
    if (req.body.clientPhone) caseData.clientDetails.phone = req.body.clientPhone;
    if (req.body.clientEmail) caseData.clientDetails.email = req.body.clientEmail;
    if (req.body.caseSummary !== undefined) caseData.caseSummary = req.body.caseSummary;
    if (req.body.nextSteps !== undefined) caseData.nextSteps = req.body.nextSteps;
    if (req.body.nextDate !== undefined) caseData.nextDate = req.body.nextDate ? new Date(req.body.nextDate) : null;
    if (req.body.status) caseData.status = req.body.status;
    if (req.body.tags) caseData.tags = req.body.tags;
    
    await caseData.save();
    
    res.json({ success: true, case: caseData });
  } catch (error) {
    console.error("Error updating case:", error);
    res.status(500).json({ success: false, message: "Failed to update case", error: error.message });
  }
});

// Delete a case
router.delete("/api/cases/:caseId", isAuthenticated, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    
    // For development: skip user validation
    // if (caseData.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    
    // Delete associated tasks
    await Task.deleteMany({ caseId: caseData._id });
    
    // Delete associated documents
    const documents = await Document.find({ caseId: caseData._id });
    for (const doc of documents) {
      if (doc.filePath && fs.existsSync(path.join(__dirname, "..", doc.filePath))) {
        fs.unlinkSync(path.join(__dirname, "..", doc.filePath));
      }
    }
    await Document.deleteMany({ caseId: caseData._id });
    
    await Case.findByIdAndDelete(req.params.caseId);
    
    res.json({ success: true, message: "Case deleted successfully" });
  } catch (error) {
    console.error("Error deleting case:", error);
    res.status(500).json({ success: false, message: "Failed to delete case", error: error.message });
  }
});

// ========== TASK ROUTES ==========

// Get all tasks for a case
router.get("/api/cases/:caseId/tasks", isAuthenticated, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    
    // For development: skip user validation
    // if (caseData.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    
    const tasks = await Task.find({ caseId: req.params.caseId })
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });
    
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks", error: error.message });
  }
});

// Create a new task
router.post("/api/cases/:caseId/tasks", isAuthenticated, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    
    // For development: skip user validation
    // if (caseData.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    
    let userId;
    if (req.user && req.user._id) {
      userId = req.user._id;
    } else {
      userId = new mongoose.Types.ObjectId('000000000000000000000000');
    }
    
    // Generate unique taskId
    let taskId;
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 1000);
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      taskId = `TASK-${year}${dayOfYear.toString().padStart(3, '0')}-${randomNum.toString().padStart(3, '0')}`;
      
      const existing = await Task.findOne({ taskId: taskId });
      if (!existing) {
        isUnique = true;
      }
    }

    const taskData = {
      taskId: taskId,
      caseId: caseData._id,
      userId: userId,
      title: req.body.title,
      description: req.body.description,
      assignedTo: req.body.assignedTo,
      assignedToName: req.body.assignedToName,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      priority: req.body.priority || 'Medium',
      status: req.body.status || 'Pending'
    };
    
    console.log("Creating task with data:", taskData);
    
    const newTask = new Task(taskData);
    await newTask.save();
    
    // Add task to case
    caseData.tasks.push(newTask._id);
    await caseData.save();
    
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, message: "Failed to create task", error: error.message });
  }
});

// Update a task
router.put("/api/tasks/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('caseId');
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    
    // For development: skip user validation
    // if (task.caseId.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    
    // Update fields
    if (req.body.title) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.assignedTo) task.assignedTo = req.body.assignedTo;
    if (req.body.assignedToName) task.assignedToName = req.body.assignedToName;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.status) task.status = req.body.status;
    if (req.body.isCompleted !== undefined) {
      task.isCompleted = req.body.isCompleted;
      if (req.body.isCompleted) {
        task.completedAt = new Date();
        task.status = 'Done';
      } else {
        task.completedAt = null;
        if (task.status === 'Done') {
          task.status = 'Pending';
        }
      }
    }
    
    task.updatedAt = new Date();
    await task.save();
    
    res.json({ success: true, task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, message: "Failed to update task", error: error.message });
  }
});

// Mark task as completed
router.patch("/api/tasks/:taskId/complete", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    
    task.isCompleted = true;
    task.completedAt = new Date();
    task.status = 'Done';
    task.updatedAt = new Date();
    
    await task.save();
    
    res.json({ success: true, task });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ success: false, message: "Failed to complete task", error: error.message });
  }
});

// Mark task as incomplete
router.patch("/api/tasks/:taskId/incomplete", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    
    task.isCompleted = false;
    task.completedAt = null;
    task.status = 'Pending';
    task.updatedAt = new Date();
    
    await task.save();
    
    res.json({ success: true, task });
  } catch (error) {
    console.error("Error marking task as incomplete:", error);
    res.status(500).json({ success: false, message: "Failed to mark task as incomplete", error: error.message });
  }
});

// Delete a task
router.delete("/api/tasks/:taskId", isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('caseId');
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    
    // For development: skip user validation
    // if (task.caseId.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    
    // Remove task from case
    await Case.findByIdAndUpdate(task.caseId._id, {
      $pull: { tasks: task._id }
    });
    
    await Task.findByIdAndDelete(req.params.taskId);
    
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, message: "Failed to delete task", error: error.message });
  }
});

// Add comment to a task
router.post("/api/tasks/:taskId/comments", isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('caseId');
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    
    if (task.caseId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    
    const comment = {
      text: req.body.text,
      author: req.user._id,
      authorName: req.user.name || req.user.email,
      createdAt: new Date()
    };
    
    task.comments.push(comment);
    await task.save();
    
    res.json({ success: true, task });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Failed to add comment", error: error.message });
  }
});

// ========== DOCUMENT ROUTES ==========

// Get all documents for a case
router.get("/api/cases/:caseId/documents", isAuthenticated, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    
    // For development: skip user validation
    // if (caseData.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    
    const documents = await Document.find({ caseId: req.params.caseId }).sort({ uploadedAt: -1 });
    
    res.json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ success: false, message: "Failed to fetch documents", error: error.message });
  }
});

// Upload a document
router.post("/api/cases/:caseId/documents", isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.caseId);
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    
    // For development: skip user validation
    // if (caseData.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    
    let userId;
    if (req.user && req.user._id) {
      userId = req.user._id;
    } else {
      userId = new mongoose.Types.ObjectId('000000000000000000000000');
    }
    const uploadedByName = req.user?.name || req.user?.email || 'Anonymous';
    
    // Generate unique documentId
    let documentId;
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 1000);
      const timestamp = Date.now().toString().substr(-9);
      documentId = `DOC-${timestamp}-${randomNum.toString().padStart(3, '0')}`;
      
      const existing = await Document.findOne({ documentId: documentId });
      if (!existing) {
        isUnique = true;
      }
    }
    
    const documentData = {
      documentId: documentId,
      caseId: caseData._id,
      userId: userId,
      uploadedByName: uploadedByName,
      fileName: req.body.fileName || req.file.originalname,
      originalFileName: req.file.originalname,
      fileType: path.extname(req.file.filename),
      category: req.body.category || 'Available Internally',
      filePath: path.relative(__dirname, req.file.path),
      fileSize: req.file.size,
      description: req.body.description || ''
    };
    
    console.log("Creating document with data:", documentData);
    
    const newDoc = new Document(documentData);
    await newDoc.save();
    
    // Add document to case
    caseData.documents.push(newDoc._id);
    await caseData.save();
    
    res.status(201).json({ success: true, document: newDoc });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ success: false, message: "Failed to upload document", error: error.message });
  }
});

// Update a document
router.put("/api/documents/:docId", isAuthenticated, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId).populate('caseId');
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
    
    const caseData = await Case.findById(doc.caseId);
    if (!caseData || caseData.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    
    if (req.body.fileName) doc.fileName = req.body.fileName;
    if (req.body.category) doc.category = req.body.category;
    if (req.body.description !== undefined) doc.description = req.body.description;
    
    await doc.save();
    
    res.json({ success: true, document: doc });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ success: false, message: "Failed to update document", error: error.message });
  }
});

// Delete a document
router.delete("/api/documents/:docId", isAuthenticated, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId).populate('caseId');
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
    
    const caseData = await Case.findById(doc.caseId);
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    
    // For development: skip user validation
    // if (caseData.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    
    // Delete physical file
    if (doc.filePath && fs.existsSync(path.join(__dirname, "..", doc.filePath))) {
      fs.unlinkSync(path.join(__dirname, "..", doc.filePath));
    }
    
    // Remove from case
    await Case.findByIdAndUpdate(doc.caseId, {
      $pull: { documents: doc._id }
    });
    
    await Document.findByIdAndDelete(req.params.docId);
    
    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ success: false, message: "Failed to delete document", error: error.message });
  }
});

// Download a document
router.get("/api/documents/:docId/download", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId).populate('caseId');
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }
    
    const caseData = await Case.findById(doc.caseId);
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    
    // For development: skip user validation
    // if (caseData.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    
    // Try different path constructions
    let filePath = path.join(__dirname, "..", "uploads", path.basename(doc.filePath));
    console.log("Looking for file at:", filePath);
    console.log("Document filePath:", doc.filePath);
    
    if (!fs.existsSync(filePath)) {
      // Try the original filePath as stored
      filePath = path.join(__dirname, "..", doc.filePath);
      console.log("Trying original path:", filePath);
      
      if (!fs.existsSync(filePath)) {
        // Try just the filename in uploads
        filePath = path.join(__dirname, "..", "uploads", doc.fileName);
        console.log("Trying filename in uploads:", filePath);
        
        if (!fs.existsSync(filePath)) {
          console.error("File not found at any path. Tried:");
          console.error("1. uploads/basename:", path.join(__dirname, "..", "uploads", path.basename(doc.filePath)));
          console.error("2. original path:", path.join(__dirname, "..", doc.filePath));
          console.error("3. uploads/filename:", path.join(__dirname, "..", "uploads", doc.fileName));
          return res.status(404).json({ 
            success: false, 
            message: "File not found", 
            filePath: filePath,
            originalPath: doc.filePath,
            fileName: doc.fileName
          });
        }
      }
    }
    
    // Set proper headers for file download
    const fileExtension = path.extname(doc.fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ success: false, message: "Failed to download document", error: error.message });
  }
});

module.exports = router;



