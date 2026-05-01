'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { normalizeStudent, normalizeMark } from '@/lib/normalize';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';

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

  const fetchClasses = async () => {
    try {
      const response = await fetch(api('/api/classes'));
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
      console.error('[v0] Error fetching classes:', error);
      setClasses([]);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(api('/api/students'));
      if (!response.ok) throw new Error(`Failed to fetch students (${response.status})`);
      const data = await response.json();
      const list = Array.isArray(data) ? data.map(normalizeStudent) : [];
      setStudents(list as any);
    } catch (error) {
      console.error('[v0] Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async (studentId: string) => {
    try {
      const response = await fetch(api(`/api/marks/student/${studentId}`));
      if (!response.ok) throw new Error(`Failed to fetch marks (${response.status})`);
      const data = await response.json();
      const list = Array.isArray(data) ? data.map(normalizeMark) : [];
      setMarks(list as any);
    } catch (error) {
      console.error('[v0] Error fetching marks:', error);
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

      const endpoint = editingId ? api(`/api/marks/${editingId}`) : api('/api/marks');
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formData.student_id,
          subject: formData.subject,
          marksObtained: marksValue,
          maxMarks: maxMarksValue,
          examType: formData.exam_type,
          homeworkStatus: formData.homework_status,
          comments: formData.teacher_comments,
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
    setEditingId(mark.id);
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
      const response = await fetch(api(`/api/marks/${id}`), { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete marks (${response.status})`);

      fetchMarks(selectedStudentId);
    } catch (error) {
      console.error('[v0] Error deleting marks:', error);
      alert('Failed to delete marks');
    }
  };

  const selectedStudent = students.find(s => s.id.toString() === selectedStudentId);
  const studentMarks = marks.filter(m => String(m.studentId) === selectedStudentId);
  const avgMarks = studentMarks.length > 0
    ? (studentMarks.reduce((sum, m) => sum + (m.marksObtained ?? 0), 0) / studentMarks.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-700 font-medium">Marks saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Marks Form */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-accent" />
              Add Marks
            </h2>

            <form onSubmit={handleAddMarks} className="space-y-5">
              {/* Class and Student Selection - 1fr 1fr Grid */}
              <div className="grid grid-cols-1 gap-4">
                {/* Class Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Class <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={handleClassSelect}
                    required
                    className="w-full px-4 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Choose a class...</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.className}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Student <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={handleStudentSelect}
                    required
                    disabled={!selectedClass}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject <span className="text-destructive">*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select subject...</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type of Exam */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type of Exam <span className="text-destructive">*</span>
                </label>
                <select
                  name="exam_type"
                  value={formData.exam_type}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {EXAM_TYPES.map(examType => (
                    <option key={examType} value={examType}>
                      {examType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marks and Max Marks - 1fr 1fr Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Marks Obtained */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Marks <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    name="marks_obtained"
                    min="0"
                    step="0.5"
                    value={formData.marks_obtained}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0"
                  />
                </div>

                {/* Max Marks */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Out of <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    name="max_marks"
                    min="1"
                    step="1"
                    value={formData.max_marks}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Homework Status */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
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
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Complete</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="homework_status"
                      value="Incomplete"
                      checked={formData.homework_status === 'Incomplete'}
                      onChange={handleFormChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Incomplete</span>
                  </label>
                </div>
              </div>

              {/* Teacher Comments */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Teacher Comments
                </label>
                <textarea
                  name="teacher_comments"
                  value={formData.teacher_comments}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  placeholder="Add comments about student's performance..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedStudentId || !formData.subject || !formData.marks_obtained || !formData.max_marks}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {editingId ? 'Update Marks' : 'Add Marks'}
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
                  className="w-full bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 py-2 rounded-xl font-semibold hover:shadow-md hover:from-slate-300 hover:to-slate-400 transition-all duration-200 border border-slate-400 active:scale-95"
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
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="text-lg font-bold text-foreground">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll No</p>
                  <p className="text-lg font-bold text-foreground">{selectedStudent.rollNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="text-lg font-bold text-foreground">{selectedStudent.className}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">—</p>
                </div>
              </div>
            </div>
          )}

          {/* Marks Statistics */}
          {selectedStudentId && studentMarks.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Subjects</p>
                <p className="text-3xl font-bold text-accent">{studentMarks.length}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Average Marks</p>
                <p className="text-3xl font-bold text-accent">{avgMarks}</p>
              </div>
            </div>
          )}

          {/* Marks Table */}
          {selectedStudentId ? (
            studentMarks.length > 0 ? (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Subject</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Exam Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Marks</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Grade</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Homework</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentMarks.map(mark => (
                      <tr key={mark.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{mark.subject}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{mark.examType || 'Unit Test'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-accent">
                          {mark.marksObtained}/{mark.maxMarks || 100}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${GRADE_COLORS[mark.grade] || 'text-foreground'}`}>
                            {mark.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-1">
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
                              className="p-2.5 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-md"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteMarks(mark.id)}
                              className="p-2.5 hover:bg-red-100 rounded-lg transition-all duration-200 hover:shadow-md"
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
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No marks entries for this student yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add a marks entry using the form on the left</p>
              </div>
            )
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-muted-foreground text-lg">Select a class and student to view and manage marks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
