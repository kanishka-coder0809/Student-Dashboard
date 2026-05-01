import express from 'express';
import Marks from '../models/Marks.js';
import Student from '../models/Student.js';

const router = express.Router();

// Get all marks
router.get('/', async (req, res) => {
  try {
    const marks = await Marks.find().sort({ createdAt: -1 });
    res.status(200).json(marks);
  } catch (error) {
    console.error('[v0] Error fetching all marks:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching marks',
      error: error.message,
    });
  }
});

// Get all marks for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });

    // Return raw array for client compatibility
    res.status(200).json(marks);
  } catch (error) {
    console.error('[v0] Error fetching marks:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching marks',
      error: error.message
    });
  }
});

// Get single mark entry
router.get('/:id', async (req, res) => {
  try {
    const mark = await Marks.findById(req.params.id).populate('studentId');

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark entry not found'
      });
    }

    res.status(200).json(mark);
  } catch (error) {
    console.error('[v0] Error fetching mark:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching mark',
      error: error.message
    });
  }
});

// Create new marks entry
router.post('/', async (req, res) => {
  try {
    const { studentId, subject, marksObtained, maxMarks, examType, homeworkStatus, comments } = req.body;

    // Validation
    if (!studentId || !subject || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, subject, and marksObtained'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if marks already exist for this subject
    const existingMarks = await Marks.findOne({ studentId, subject });
    if (existingMarks) {
      return res.status(400).json({
        success: false,
        message: 'Marks for this subject already exist for this student'
      });
    }

    const marks = new Marks({
      studentId,
      subject,
      marksObtained,
      maxMarks: maxMarks || 100,
      examType: examType || 'Regular Test',
      homeworkStatus: homeworkStatus || 'Incomplete',
      comments: comments || ''
    });

    await marks.save();

    res.status(201).json(marks);
  } catch (error) {
    console.error('[v0] Error creating marks:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating marks',
      error: error.message
    });
  }
});

// Update marks entry
router.put('/:id', async (req, res) => {
  try {
    const { marksObtained, maxMarks, examType, homeworkStatus, comments } = req.body;

    const marks = await Marks.findById(req.params.id);

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: 'Mark entry not found'
      });
    }

    if (marksObtained !== undefined) marks.marksObtained = marksObtained;
    if (maxMarks !== undefined) marks.maxMarks = maxMarks;
    if (examType) marks.examType = examType;
    if (homeworkStatus) marks.homeworkStatus = homeworkStatus;
    if (comments !== undefined) marks.comments = comments;

    await marks.save();

    res.status(200).json(marks);
  } catch (error) {
    console.error('[v0] Error updating marks:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating marks',
      error: error.message
    });
  }
});

// Delete marks entry
router.delete('/:id', async (req, res) => {
  try {
    const marks = await Marks.findByIdAndDelete(req.params.id);

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: 'Mark entry not found'
      });
    }

    res.status(200).json(marks);
  } catch (error) {
    console.error('[v0] Error deleting marks:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting marks',
      error: error.message
    });
  }
});

export default router;
