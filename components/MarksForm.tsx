'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Save, X } from 'lucide-react';

interface MarksData {
  subject: string;
  exam_type: string;
  marks_obtained: number | '';
  grade: string;
  homework_status: 'Complete' | 'Incomplete';
  teacher_comments: string;
}

interface MarksFormProps {
  studentId: string;
  marksId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Computer Science', 'Social Studies', 'Physical Education', 'Art', 'Music', 'Chemistry'];
const EXAM_TYPES = ['Midterm', 'Final', 'Unit Test', 'Quiz', 'Assignment'];

export function MarksForm({ studentId, marksId, onSuccess, onCancel }: MarksFormProps) {
  const [formData, setFormData] = useState<MarksData>({
    subject: '',
    exam_type: 'Midterm',
    marks_obtained: '',
    grade: 'A',
    homework_status: 'Complete',
    teacher_comments: '',
  });
  const [loading, setLoading] = useState(!!marksId);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (marksId) {
      fetchMarks();
    }
  }, [marksId]);

  const fetchMarks = async () => {
    try {
      const response = await fetch(api(`/api/marks/${marksId}`));
      const raw = await response.json();
      // normalize fields from either backend
      setFormData({
        subject: raw.subject,
        exam_type: raw.exam_type || raw.examType || 'Midterm',
        marks_obtained: raw.marks_obtained ?? raw.marksObtained ?? 0,
        grade: raw.grade,
        homework_status: raw.homework_status || raw.homeworkStatus,
        teacher_comments: raw.teacher_comments || raw.comments || raw.teacherComments,
      });
    } catch (error) {
      console.error('[v0] Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (marks: number): string => {
    // Convert out of 50 to percentage
    const percentage = (marks / 50) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newData = { ...formData, [name]: value };

    // Auto-calculate grade if marks are entered
    if (name === 'marks_obtained' && value) {
      const marks = Number(value);
      newData.grade = calculateGrade(marks);
    }

    setFormData(newData as MarksData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        subject: formData.subject,
        exam_type: formData.exam_type,
        marks_obtained: Number(formData.marks_obtained),
        grade: formData.grade,
        homework_status: formData.homework_status,
        teacher_comments: formData.teacher_comments,
        // server expects studentId (ObjectId) for Mongo backend
        studentId: studentId,
      };

      const url = marksId ? api(`/api/marks/${marksId}`) : api('/api/marks');
      const method = marksId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('[v0] Error saving marks:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white border-2 border-purple-300 rounded-lg p-8">
      <h3 className="text-xl font-bold text-gray-900">
        {marksId ? 'Edit Marks Entry' : 'Add New Marks Entry'}
      </h3>

      <div className="grid grid-cols-3 gap-6">
        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 bg-white cursor-pointer transition-all appearance-none"
          >
            <option value="">Select subject</option>
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Exam Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Exam Type <span className="text-red-500">*</span>
          </label>
          <select
            name="exam_type"
            value={formData.exam_type}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 bg-white cursor-pointer transition-all appearance-none"
          >
            {EXAM_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Marks Obtained */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Marks Obtained <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              name="marks_obtained"
              min="0"
              max="50"
              value={formData.marks_obtained}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder-gray-400 transition-all"
              placeholder="0-50"
            />
            <span className="text-sm font-semibold text-gray-600">/ 50</span>
          </div>
        </div>

        {/* Grade */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Grade
          </label>
          <input
            type="text"
            name="grade"
            value={formData.grade}
            readOnly
            className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg bg-purple-50 text-gray-900 focus:outline-none text-center font-bold text-lg"
          />
          <p className="text-xs text-gray-500 mt-2">Auto-calculated</p>
        </div>

        {/* Homework Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Homework Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="homework_status"
                value="Complete"
                checked={formData.homework_status === 'Complete'}
                onChange={handleChange}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-sm font-medium text-gray-700">Complete</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="homework_status"
                value="Incomplete"
                checked={formData.homework_status === 'Incomplete'}
                onChange={handleChange}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-sm font-medium text-gray-700">Incomplete</span>
            </label>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Teacher Comments
        </label>
        <textarea
          name="teacher_comments"
          value={formData.teacher_comments}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder-gray-400 transition-all resize-none"
          placeholder="Add comments about student's performance..."
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-6 border-t-2 border-purple-300">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
        >
          <Save className="w-4 h-4" />
          {submitting ? 'Saving...' : 'Save Marks'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
