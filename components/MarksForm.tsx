'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { calculateGrade } from '@/lib/utils';

interface MarksFormProps {
  studentId: string;
  marksId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SUBJECTS = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Computer Science', 'Social Studies', 'Physical Education', 'Art', 'Music', 'Chemistry'];

export function MarksForm({ studentId, marksId, onSuccess, onCancel }: MarksFormProps) {
  const [formData, setFormData] = useState({
    subject: '',
    marksObtained: '',
    maxMarks: 100,
    grade: 'A',
    homeworkStatus: 'Complete',
    teacherComments: '',
  });
  const [loading, setLoading] = useState(!!marksId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (marksId) {
      fetchMarks();
    }
  }, [marksId]);

  const fetchMarks = async () => {
    try {
      const response = await fetch(`/api/marks?id=${marksId}`);
      if (!response.ok) throw new Error('Failed to fetch marks');
      const raw = await response.json();
      console.log('[MarksForm] Fetched marks:', raw);
      setFormData({
        subject: raw.subject,
        marksObtained: raw.marksObtained,
        maxMarks: raw.maxMarks || 100,
        grade: raw.grade,
        homeworkStatus: raw.homeworkStatus || 'Complete',
        teacherComments: raw.teacherComments || '',
      });
    } catch (error) {
      console.error('[MarksForm] Error fetching marks:', error);
      setError('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newData = { ...formData, [name]: value };

    // Auto-calculate grade if marks are entered
    if (name === 'marksObtained' && value) {
      const marks = Number(value);
      newData.grade = calculateGrade(marks, formData.maxMarks);
    }

    setFormData(newData as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        studentId: studentId,
        subject: formData.subject,
        marksObtained: Number(formData.marksObtained),
        maxMarks: Number(formData.maxMarks),
        grade: formData.grade,
        homeworkStatus: formData.homeworkStatus,
        teacherComments: formData.teacherComments,
      };

      const url = marksId ? `/api/marks?id=${marksId}` : '/api/marks';
      const method = marksId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save marks');
      }

      console.log('[MarksForm] Marks saved successfully');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('[MarksForm] Error saving marks:', error);
      setError(error instanceof Error ? error.message : 'Failed to save marks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading marks...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white border-2 border-purple-300 rounded-lg p-8">
      <h3 className="text-xl font-bold text-gray-900">
        {marksId ? 'Edit Marks Entry' : 'Add New Marks Entry'}
      </h3>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <CustomDropdown
            options={SUBJECTS.map(s => ({ label: s, value: s }))}
            value={formData.subject}
            onChange={(val) => handleChange({ target: { name: 'subject', value: val } } as any)}
            placeholder="Select subject"
            searchable={true}
            className="w-full"
          />
        </div>

        {/* Marks Obtained */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Marks Obtained <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              name="marksObtained"
              min="0"
              max={formData.maxMarks}
              value={formData.marksObtained}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900"
              placeholder="0"
            />
            <span className="text-sm font-semibold text-gray-600">/ {formData.maxMarks}</span>
          </div>
        </div>

        {/* Max Marks */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Max Marks
          </label>
          <input
            type="number"
            name="maxMarks"
            min="1"
            value={formData.maxMarks}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900"
          />
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
                name="homeworkStatus"
                value="Complete"
                checked={formData.homeworkStatus === 'Complete'}
                onChange={handleChange}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-sm font-medium text-gray-700">Complete</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="homeworkStatus"
                value="Incomplete"
                checked={formData.homeworkStatus === 'Incomplete'}
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
          name="teacherComments"
          value={formData.teacherComments}
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
