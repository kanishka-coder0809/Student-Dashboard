import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  class_name: { type: String, required: true, unique: false },
  section: { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

const ClassModel = mongoose.model('Class', ClassSchema);

export default ClassModel;
