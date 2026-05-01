import express from 'express';
import Student from '../models/Student.js';
import Marks from '../models/Marks.js';

const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    // Return raw array for client compatibility
    res.status(200).json(students);
  } catch (error) {
    console.error('[v0] Error fetching students:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// Get single student with marks
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const marks = await Marks.find({ studentId: req.params.id });

    // Return student object with marks field
    res.status(200).json({
      ...student.toObject(),
      marks
    });
  } catch (error) {
    console.error('[v0] Error fetching student:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const { name, rollNo, class: studentClass, email, attendance } = req.body;

    // Validation
    if (!name || !rollNo || !studentClass || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const duplicate = await Student.findOne({
      $or: [{ rollNo }, { email }],
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: duplicate.rollNo === rollNo ? 'rollNo already exists' : 'email already exists'
      });
    }

    const createdAt = new Date();
    const studentDoc = {
      name,
      rollNo,
      class: studentClass,
      email,
      attendance: attendance || 0,
      createdAt,
      updatedAt: createdAt,
    };

    const result = await Student.collection.insertOne(studentDoc);
    const student = await Student.findById(result.insertedId);

    res.status(201).json(student || { ...studentDoc, _id: result.insertedId });
  } catch (error) {
    console.error('[v0] Error creating student:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message
    });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { name, rollNo, class: studentClass, email, attendance } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (rollNo) updates.rollNo = rollNo;
    if (studentClass) updates.class = studentClass;
    if (email) updates.email = email;
    if (attendance !== undefined) updates.attendance = attendance;
    updates.updatedAt = new Date();

    const updated = await Student.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });

    res.status(200).json(updated);
  } catch (error) {
    console.error('[v0] Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: error.message
    });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete all marks associated with this student
    await Marks.deleteMany({ studentId: req.params.id });

    res.status(200).json(student);
  } catch (error) {
    console.error('[v0] Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
});

// Search students by name, rollNo, or class
router.get('/search/query', async (req, res) => {
  try {
    const { name, rollNo, class: studentClass } = req.query;
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (rollNo) {
      filter.rollNo = { $regex: rollNo, $options: 'i' };
    }
    if (studentClass) {
      filter.class = studentClass;
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.error('[v0] Error searching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching students',
      error: error.message
    });
  }
});

export default router;
