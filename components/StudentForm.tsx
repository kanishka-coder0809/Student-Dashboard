'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { normalizeStudent } from '@/lib/normalize';
import { Save, X } from 'lucide-react';

interface StudentFormProps {
  studentId?: string;
  onSuccess?: () => void;
}

interface StudentData {
  name: string;
  roll_no: string;
  class: string;
  month: string;
  attendance_percentage: number | '';
  email?: string;
}

interface Class {
  id: number;
  class_name: string;
  section?: string;
}

export function StudentForm({ studentId, onSuccess }: StudentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<StudentData>({
    name: '',
    roll_no: '',
    class: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    attendance_percentage: '',
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
      const response = await fetch(api('/api/classes'));
      if (!response.ok) {
        throw new Error(`Failed to fetch classes (${response.status})`);
      }
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[v0] Error fetching classes:', error);
    }
  };

  const fetchStudent = async () => {
    try {
      const response = await fetch(api(`/api/students/${studentId}`));
      const raw = await response.json();
      const data = normalizeStudent(raw);
      setFormData({
        name: data.name,
        roll_no: data.rollNo,
        class: data.className,
        month: new Date().toLocaleString('default', { month: 'long' }),
        attendance_percentage: data.attendance,
        email: data.email,
      });
    } catch (error) {
      console.error('[v0] Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendance_percentage' ? (value ? Number(value) : '') : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = studentId ? api(`/api/students/${studentId}`) : api('/api/students');
      const method = studentId ? 'PUT' : 'POST';

      // Map client form fields to Express/Mongo expected fields
      const payload: any = {
        name: formData.name,
        rollNo: formData.roll_no,
        class: formData.class,
        email: formData.email,
        attendance: typeof formData.attendance_percentage === 'number' ? formData.attendance_percentage : Number(formData.attendance_percentage) || 0,
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
        console.error('[v0] Student save failed:', err);
        alert(err?.message || err?.error || 'Failed to save student');
      }
    } catch (error) {
      console.error('[v0] Error saving student:', error);
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
              name="roll_no"
              value={formData.roll_no}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder-gray-400 transition-all"
              placeholder="Enter roll number"
            />
          </div>

          {/* Class */}
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder-gray-400 transition-all"
                        placeholder="Enter email"
                      />
                    </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 bg-white cursor-pointer transition-all appearance-none"
            >
              <option value="">Select class</option>
              {classes.map((cls) => (
                <option key={(cls as any)._id || cls.id || cls.class_name} value={cls.class_name}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          {/* Month for Attendance */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Month <span className="text-red-500">*</span>
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 bg-white cursor-pointer transition-all appearance-none"
            >
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>

          {/* Attendance */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Monthly Attendance (%) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="attendance_percentage"
                min="0"
                max="100"
                value={formData.attendance_percentage}
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
