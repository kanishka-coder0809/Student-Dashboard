'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { normalizeStudent } from '@/lib/normalize';
import { Save, X } from 'lucide-react';
import { CustomDropdown } from '@/components/ui/CustomDropdown';

interface StudentFormProps {
  studentId?: string;
  onSuccess?: () => void;
}

interface StudentData {
  name: string;
  rollNo: string;
  class: string;
  attendance: number | '';
}

interface Class {
  _id: string;
  class_name: string;
  section?: string;
}

export function StudentForm({ studentId, onSuccess }: StudentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<StudentData>({
    name: '',
    rollNo: '',
    class: '',
    attendance: '',
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(!!studentId);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) {
        throw new Error(`Failed to fetch classes (${response.status})`);
      }
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[StudentForm] Error fetching classes:', error);
    }
  };

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students?id=${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student');
      const students = await response.json();
      const student = Array.isArray(students) ? students[0] : students;
      if (!student) throw new Error('Student not found');
      
      const data = normalizeStudent(student);
      setFormData({
        name: data.name,
        rollNo: data.rollNo,
        class: data.className,
        attendance: data.attendance,
      });
    } catch (error) {
      console.error('[StudentForm] Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendance' ? (value ? Number(value) : '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = studentId ? 'PUT' : 'POST';
      const url = studentId ? `/api/students?id=${studentId}` : '/api/students';

      const payload = {
        name: formData.name,
        rollNo: formData.rollNo,
        class: formData.class,
        attendance: typeof formData.attendance === 'number' ? formData.attendance : Number(formData.attendance) || 0,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (onSuccess) onSuccess();
        else router.push('/students');
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('[StudentForm] Student save failed:', err);
        alert(err?.message || err?.error || 'Failed to save student');
      }
    } catch (error) {
      console.error('[StudentForm] Error saving student:', error);
      alert('Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border-2 border-purple-200 rounded-lg p-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder-gray-400 transition-all"
              placeholder="Enter student name"
            />
          </div>

          {/* Roll No */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Roll No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder-gray-400 transition-all"
              placeholder="Enter roll number"
            />
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Class <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              options={[
                { label: 'Select class', value: '' },
                ...classes.map(cls => ({
                  label: `${cls.class_name}${cls.section ? ` - ${cls.section}` : ''}`,
                  value: cls.class_name
                }))
              ]}
              value={formData.class}
              onChange={(val) => handleChange({ target: { name: 'class', value: val } } as any)}
              placeholder="Select class"
              className="w-full"
            />
          </div>

          {/* Attendance */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Attendance (%) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="attendance"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder-gray-400 transition-all"
                placeholder="0-100"
              />
              <span className="text-sm font-medium text-gray-600">%</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-8 mt-8 border-t-2 border-purple-200">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : studentId ? 'Update Student' : 'Add Student'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
