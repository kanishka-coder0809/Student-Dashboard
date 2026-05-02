import mongoose from 'mongoose';

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please provide a student ID']
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true
  },
  marksObtained: {
    type: Number,
    required: [true, 'Please provide marks obtained'],
    min: [0, 'Marks cannot be less than 0'],
    max: [100, 'Marks cannot be more than 100']
  },
  maxMarks: {
    type: Number,
    default: 100,
    min: [0, 'Max marks cannot be less than 0'],
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F'],
    required: [true, 'Please provide a grade']
  },
  homeworkStatus: {
    type: String,
    enum: ['Complete', 'Incomplete'],
    default: 'Incomplete'
  },
  teacherComments: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
marksSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

// Compound index to prevent duplicate marks for same student+subject
marksSchema.index({ studentId: 1, subject: 1 }, { unique: true });

export const MarksModel = mongoose.models.Marks || mongoose.model('Marks', marksSchema);
