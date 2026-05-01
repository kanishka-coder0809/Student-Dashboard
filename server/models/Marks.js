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
    enum: ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi', 'Computer Science', 'Physics', 'Chemistry', 'Biology']
  },
  marksObtained: {
    type: Number,
    required: [true, 'Please provide marks obtained'],
    min: [0, 'Marks cannot be negative']
  },
  maxMarks: {
    type: Number,
    required: [true, 'Please provide max marks'],
    default: 100,
    min: [1, 'Max marks must be at least 1']
  },
  examType: {
    type: String,
    default: 'Regular Test'
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
    default: 'F'
  },
  homeworkStatus: {
    type: String,
    enum: ['Complete', 'Incomplete'],
    default: 'Incomplete'
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [500, 'Comments cannot exceed 500 characters']
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

// Auto-calculate grade based on marks and maxMarks
marksSchema.pre('save', function () {
  const percentage = (this.marksObtained / this.maxMarks) * 100;
  
  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C+';
  else if (percentage >= 40) this.grade = 'C';
  else if (percentage >= 30) this.grade = 'D';
  else this.grade = 'F';
  
  this.updatedAt = Date.now();
});

// Create compound index for studentId and subject to prevent duplicate entries
marksSchema.index({ studentId: 1, subject: 1 }, { unique: true });

export default mongoose.model('Marks', marksSchema);
