import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a student name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  rollNo: {
    type: String,
    required: [true, 'Please provide a roll number'],
    unique: true,
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Please provide a class'],
    trim: true
  },
  email: {
    type: String,
    sparse: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  attendance: {
    type: Number,
    default: 0,
    min: [0, 'Attendance cannot be less than 0'],
    max: [100, 'Attendance cannot be more than 100']
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

export const StudentModel = mongoose.models.Student || mongoose.model('Student', studentSchema);
