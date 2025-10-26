const mongoose = require("mongoose");

const caseSchema = mongoose.Schema({
  caseID: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  clientDetails: {
    name: {
      type: String,
      required: true
    },
    phone: String,
    email: String
  },
  caseSummary: String,
  nextSteps: String,
  nextDate: Date,
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Pending'],
    default: 'Active'
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'document'
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'task'
  }],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique caseID before saving
caseSchema.pre('save', async function(next) {
  if (!this.caseID) {
    let isUnique = false;
    let newCaseID;
    
    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 10000);
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      newCaseID = `CASE-${year}${month}-${randomNum.toString().padStart(4, '0')}`;
      
      const existing = await mongoose.models.Case?.findOne({ caseID: newCaseID });
      if (!existing) {
        isUnique = true;
      }
    }
    
    this.caseID = newCaseID;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Case", caseSchema);






