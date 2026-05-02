import express from 'express';
import ClassModel from '../models/Class.js';

const router = express.Router();

// Get all classes
router.get('/', async (req, res) => {
  try {
    console.log('[Server] GET /api/classes - Fetching all classes');
    const classes = await ClassModel.find().sort({ createdAt: -1 });
    console.log('[Server] Found classes:', classes.length);
    res.status(200).json(classes);
  } catch (error) {
    console.error('[Server] Error fetching classes:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching classes', error: error.message });
  }
});

// Create class
router.post('/', async (req, res) => {
  try {
    const { class_name, section, description } = req.body;
    console.log('[Server] POST /api/classes - Creating class:', req.body);
    
    if (!class_name) {
      console.log('[Server] class_name is required - returning 400');
      return res.status(400).json({ success: false, message: 'class_name is required' });
    }

    const cls = new ClassModel({ class_name, section: section || '', description: description || '' });
    const savedClass = await cls.save();
    console.log('[Server] Class created successfully:', savedClass);
    
    res.status(201).json(savedClass);
  } catch (error) {
    console.error('[Server] Error creating class:', error.message);
    res.status(500).json({ success: false, message: 'Error creating class', error: error.message });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const cls = await ClassModel.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });

    const { class_name, section, description } = req.body;
    if (class_name) cls.class_name = class_name;
    if (section !== undefined) cls.section = section;
    if (description !== undefined) cls.description = description;

    await cls.save();
    res.status(200).json(cls);
  } catch (error) {
    console.error('[v0] Error updating class:', error.message);
    res.status(500).json({ success: false, message: 'Error updating class', error: error.message });
  }
});

// Delete class
router.delete('/:id', async (req, res) => {
  try {
    const cls = await ClassModel.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.status(200).json(cls);
  } catch (error) {
    console.error('[v0] Error deleting class:', error.message);
    res.status(500).json({ success: false, message: 'Error deleting class', error: error.message });
  }
});

export default router;
