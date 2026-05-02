'use client';

import { useState, useEffect } from 'react';
import { normalizeStudent, normalizeMark } from '@/lib/normalize';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, BookOpen, TrendingUp } from 'lucide-react';

type Student = ReturnType<typeof normalizeStudent>;
type Marks = ReturnType<typeof normalizeMark>;

interface MarksFormData {
  student_id: string;
  subject: string;
  marks_obtained: string;
  max_marks: string;
  exam_type: string;
  homework_status: 'Complete' | 'Incomplete';
  teacher_comments: string;
}

interface ClassData {
  id: string;
  className: string;
}

const SUBJECTS = [
  'English',
  'Mathematics',
  'Science',
  'Social Studies',
  'Hindi',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
];

const EXAM_TYPES = [
  'Unit Test',
  'Mid Term',
  'Final Exam',
  'Assignment',
  'Quiz',
  'Project',
  'Practical',
  'Class Test',
  'Surprise Test',
  'Periodic Test'
];

const GRADE_COLORS: { [key: string]: string } = {
  'A+': 'text-green-600',
  'A': 'text-green-500',
  'B': 'text-blue-500',
  'C': 'text-yellow-600',
  'D': 'text-orange-600',
  'F': 'text-red-600',
};

export function MarksManagementDashboard() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Marks[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const [formData, setFormData] = useState<MarksFormData>({
    student_id: '',
    subject: '',
    marks_obtained: '',
    max_marks: '100',
    exam_type: 'Unit Test',
    homework_status: 'Complete',
    teacher_comments: '',
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch classes and students on mount
  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  // Fetch marks when student is selected
  useEffect(() => {
    if (selectedStudentId) {
      fetchMarks(selectedStudentId);
    }
  }, [selectedStudentId]);

  const calculateGrade = (marks: number, maxMarks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error(`Failed to fetch classes (${response.status})`);
      const data = await response.json();
      const classList = Array.isArray(data) 
        ? data
            .map((cls: any) => ({
              id: cls._id || cls.id,
              className: cls.class_name || cls.className
            }))
            .sort((a, b) => a.className.localeCompare(b.className))
        : [];
      setClasses(classList);
    } catch (error) {
      console.error('[MarksManagement] Error fetching classes:', error);
      setClasses([]);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error(`Failed to fetch students (${response.status})`);
      const data = await response.json();
      const list = Array.isArray(data) ? data.map(normalizeStudent) : [];
      setStudents(list as any);
    } catch (error) {
      console.error('[MarksManagement] Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async (studentId: string) => {
    try {
      const response = await fetch(`/api/marks?studentId=${studentId}`);
      if (!response.ok) throw new Error(`Failed to fetch marks (${response.status})`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setMarks(list as any);
    } catch (error) {
      console.error('[MarksManagement] Error fetching marks:', error);
      setMarks([]);
    }
  };

  // Get students filtered by selected class and sorted by name
  const filteredStudents = selectedClass
    ? students
        .filter(s => s.className === selectedClass)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const handleClassSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classValue = e.target.value;
    setSelectedClass(classValue);
    setSelectedStudentId('');
    setFormData({
      student_id: '',
      subject: '',
      marks_obtained: '',
      max_marks: '100',
      exam_type: 'Unit Test',
      homework_status: 'Complete',
      teacher_comments: '',
    });
    setEditingId(null);
  };

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentValue = e.target.value;
    setSelectedStudentId(studentValue);
    setFormData({
      student_id: studentValue,
      subject: '',
      marks_obtained: '',
      max_marks: '100',
      exam_type: 'Unit Test',
      homework_status: 'Complete',
      teacher_comments: '',
    });
    setEditingId(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMarks = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id || !formData.subject || !formData.marks_obtained || !formData.max_marks) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const marksValue = parseFloat(formData.marks_obtained);
      const maxMarksValue = parseFloat(formData.max_marks);

      if (marksValue < 0) {
        alert('Marks cannot be negative');
        return;
      }
      if (maxMarksValue < 1) {
        alert('Max marks must be at least 1');
        return;
      }
      if (marksValue > maxMarksValue) {
        alert('Marks obtained cannot exceed max marks');
        return;
      }

      const endpoint = editingId ? `/api/marks?id=${editingId}` : '/api/marks';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formData.student_id,
          subject: formData.subject,
          marksObtained: marksValue,
          maxMarks: maxMarksValue,
          grade: calculateGrade(marksValue, maxMarksValue),
          homeworkStatus: formData.homework_status,
          teacherComments: formData.teacher_comments,
        }),
      });

      if (!response.ok) throw new Error(`Failed to save marks (${response.status})`);

      // Refresh marks
      fetchMarks(formData.student_id);

      // Reset form
      setFormData({
        student_id: formData.student_id,
        subject: '',
        marks_obtained: '',
        max_marks: '100',
        exam_type: 'Unit Test',
        homework_status: 'Complete',
        teacher_comments: '',
      });
      setEditingId(null);

      // Show success
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('[v0] Error saving marks:', error);
      alert('Failed to save marks');
    }
  };

  const handleEditMarks = (mark: Marks) => {
    setEditingId(mark._id);
    setFormData({
      student_id: String(mark.studentId || ''),
      subject: mark.subject,
      marks_obtained: String(mark.marksObtained ?? ''),
      max_marks: String(mark.maxMarks ?? '100'),
      exam_type: mark.examType || 'Unit Test',
      homework_status: mark.homeworkStatus,
      teacher_comments: mark.teacherComments || '',
    });
    setSelectedStudentId(String(mark.studentId || ''));
  };

  const handleDeleteMarks = async (id: string) => {
    if (!confirm('Are you sure you want to delete this marks entry?')) return;

    try {
      const response = await fetch(`/api/marks?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete marks (${response.status})`);

      fetchMarks(selectedStudentId);
    } catch (error) {
      console.error('[MarksManagement] Error deleting marks:', error);
      alert('Failed to delete marks');
    }
  };

  const selectedStudent = students.find(s => s.id.toString() === selectedStudentId);
  const studentMarks = marks.filter(m => String(m.studentId) === selectedStudentId);
  const avgMarks = studentMarks.length > 0
    ? (studentMarks.reduce((sum, m) => sum + (m.marksObtained ?? 0), 0) / studentMarks.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 py-8">
      <style>{`
        select option {
          background: white;
          color: #111827;
          padding: 8px 12px;
          border: none;
          font-weight: 500;
        }
        select option:hover {
          background: #f3e8ff;
          color: #6d28d9;
        }
        select option:checked {
          background: linear-gradient(#a78bfa, #a78bfa);
          background-color: #7c3aed;
          color: white;
          font-weight: 600;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700 font-medium">Marks saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Marks Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 sticky top-8 shadow-lg hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                Add Marks
              </h2>

              <form onSubmit={handleAddMarks} className="space-y-6">
                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={handleClassSelect}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none cursor-pointer hover:border-purple-400"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '36px'
                    }}
                  >
                    <option value="">Choose a class...</option>
                    {classes.length > 0 ? (
                      classes.map(cls => (
                        <option key={cls.id} value={cls.className}>
                          {cls.className}
                        </option>
                      ))
                    ) : (
                      <option disabled>No classes available</option>
                    )}
                  </select>
                </div>

                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={handleStudentSelect}
                    required
                    disabled={!selectedClass}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-400"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '36px'
                    }}
                  >
                    <option value="">
                      {selectedClass ? 'Choose a student...' : 'Select a class first...'}
                    </option>
                    {filteredStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.rollNo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none cursor-pointer hover:border-purple-400"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '36px'
                    }}
                  >
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Marks and Max Marks */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="marks_obtained"
                      min="0"
                      step="0.5"
                      value={formData.marks_obtained}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Out of <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="max_marks"
                      min="1"
                      step="1"
                      value={formData.max_marks}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="100"
                    />
                  </div>
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
                        onChange={handleFormChange}
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
                        onChange={handleFormChange}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Incomplete</span>
                    </label>
                  </div>
                </div>

                {/* Teacher Comments */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Teacher Comments
                  </label>
                  <textarea
                    name="teacher_comments"
                    value={formData.teacher_comments}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none font-medium"
                    placeholder="Add comments about student's performance..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedStudentId || !formData.subject || !formData.marks_obtained || !formData.max_marks}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {editingId ? 'Update Marks' : 'Save Marks'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        student_id: selectedStudentId,
                        subject: '',
                        marks_obtained: '',
                        max_marks: '100',
                        exam_type: 'Unit Test',
                        homework_status: 'Complete',
                        teacher_comments: '',
                      });
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-xl font-semibold transition-all duration-200"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Right: Marks Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info Card */}
            {selectedStudent && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Student Name</p>
                    <p className="text-lg font-bold text-gray-900">{selectedStudent.name}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Roll No</p>
                    <p className="text-lg font-bold text-gray-900">{selectedStudent.rollNo}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Class</p>
                    <p className="text-lg font-bold text-gray-900">{selectedStudent.className}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Total Marks</p>
                    <p className="text-lg font-bold text-gray-900">{avgMarks}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Marks Statistics */}
            {selectedStudentId && studentMarks.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-90 mb-1">Total Subjects</p>
                      <p className="text-4xl font-bold">{studentMarks.length}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold opacity-90 mb-1">Average Marks</p>
                      <p className="text-4xl font-bold">{avgMarks}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Marks Table */}
            {selectedStudentId ? (
              studentMarks.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Subject</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Marks</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Grade</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Homework</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {studentMarks.map(mark => (
                        <tr key={mark._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{mark.subject}</td>
                          <td className="px-6 py-4 text-sm font-bold text-purple-600">
                            {mark.marksObtained}/{mark.maxMarks || 100}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                              mark.grade === 'A+' || mark.grade === 'A' ? 'bg-green-100 text-green-700' :
                              mark.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                              mark.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {mark.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              {mark.homeworkStatus === 'Complete' ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-green-600 font-medium">Complete</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-red-600 font-medium">Incomplete</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditMarks(mark)}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-md"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteMarks(mark._id)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-all duration-200 hover:shadow-md"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium">No marks entries for this student yet</p>
                  <p className="text-sm text-gray-500 mt-2">Add a marks entry using the form on the left</p>
                </div>
              )
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white rounded-full shadow-md">
                    <BookOpen className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                <p className="text-gray-700 font-semibold text-lg">Select a class and student to view and manage marks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
