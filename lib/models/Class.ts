import { Schema, models, model } from 'mongoose';

const ClassSchema = new Schema(
  {
    class_name: { type: String, required: true, trim: true },
    section: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const ClassModel = models.Class || model('Class', ClassSchema);

export default ClassModel;
