'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { MarksForm } from '@/components/MarksForm';
import { MarksTable } from '@/components/MarksTable';
import { ChevronLeft, User, BookOpen, Download } from 'lucide-react';
import { generateStudentPDF } from '@/lib/pdf-export';
import { normalizeStudent } from '@/lib/normalize';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Mark {
  _id: string;
  subject: string;
  marksObtained: number;
  maxMarks?: number;
  grade: string;
  homeworkStatus: string;
  teacherComments?: string;
}

const MARK_COLORS = ['#2563eb', '#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e'];

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<any>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [marksLoading, setMarksLoading] = useState(false);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
      fetchMarks();
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students?id=${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student');
      const data = await response.json();
      console.log('[Student Profile] Fetched student:', data);
      setStudent(data);
    } catch (error) {
      console.error('[Student Profile] Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async () => {
    try {
      setMarksLoading(true);
      const response = await fetch(`/api/marks?studentId=${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch marks');
      const data = await response.json();
      console.log('[Student Profile] Fetched marks:', data);
      setMarks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[Student Profile] Error fetching marks:', error);
      setMarks([]);
    } finally {
      setMarksLoading(false);
    }
  };

  const pieData = useMemo(() => {
    if (marks.length === 0) return [];
    return marks.map((mark) => ({
      name: mark.subject,
      value: mark.marksObtained,
      grade: mark.grade
    }));
  }, [marks]);

  const averageMarks = useMemo(() => {
    if (marks.length === 0) return 0;
    const sum = marks.reduce((acc, m) => acc + m.marksObtained, 0);
    return Number((sum / marks.length).toFixed(1));
  }, [marks]);

  const handleExportPDF = async () => {
    if (!student) return;
    setExporting(true);
    try {
      const pdf = await generateStudentPDF({
        id: student._id || student.id || studentId,
        name: student.name,
        roll_no: student.rollNo,
        class: student.class,
        attendance_percentage: student.attendance,
        email: student.email,
        marks: marks.map((m) => ({
          subject: m.subject,
          marks_obtained: m.marksObtained,
          max_marks: m.maxMarks || 100,
          grade: m.grade,
          homework_status: m.homeworkStatus,
          teacher_comments: m.teacherComments || '',
        })),
      });
      pdf.save(`${student.name}_profile.pdf`);
    } catch (error) {
      console.error('[Student Profile] Error exporting PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground text-lg">Student not found</p>
          <Link href="/students">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg">
              Back to Students
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <div className="px-8 py-8">
          {/* Breadcrumb */}
          <Link
            href="/students"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Students
          </Link>

          {/* Header with Student Info */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{student.name}</h1>
              <div className="flex gap-6 text-sm flex-wrap">
                <p className="text-gray-600">
                  <span className="font-semibold">Roll No:</span> {student.rollNo}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Class:</span> {student.class}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Email:</span> {student.email}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-all shadow-md disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <Link href={`/students/${studentId}/edit`}>
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all shadow-md">
                  Edit Profile
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Roll Number</p>
              <p className="text-2xl font-bold text-gray-900">{student.rollNo}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Class</p>
              <p className="text-2xl font-bold text-gray-900">{student.class}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Attendance</p>
              <p className="text-2xl font-bold text-green-600">{student.attendance}%</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Average Marks</p>
              <p className="text-2xl font-bold text-orange-600">{averageMarks}</p>
            </div>
          </div>

          {/* Marks Analytics Section */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Pie Chart */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Marks Distribution by Subject</h2>
                <p className="text-sm text-gray-600 mt-1">Subject-wise performance analysis</p>
              </div>

              {marks.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={2}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={MARK_COLORS[index % MARK_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => `${value} marks`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No marks data available
                </div>
              )}
            </div>

            {/* Marks Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Summary</h2>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Total Subjects</p>
                  <p className="text-3xl font-bold text-blue-600">{marks.length}</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">Average Marks</p>
                  <p className="text-3xl font-bold text-purple-600">{averageMarks}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Highest Grade</p>
                  <p className="text-3xl font-bold text-green-600">
                    {marks.length > 0
                      ? marks.reduce((prev, current) =>
                          (prev.marksObtained > current.marksObtained ? prev : current)
                        ).grade
                      : '—'}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600">Homework Status</p>
                  <p className="text-lg font-bold text-orange-600">
                    {marks.filter((m) => m.homeworkStatus === 'Complete').length}/{marks.length} Complete
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Marks Management Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Academic Records</h2>
                <p className="text-sm text-gray-600 mt-1">Manage student marks and grades</p>
              </div>
              {!showMarkForm && !editingMarkId && (
                <button
                  onClick={() => setShowMarkForm(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
                >
                  Add Marks
                </button>
              )}
            </div>

            {/* Add Marks Form */}
            {(showMarkForm || editingMarkId) && (
              <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
                <MarksForm
                  studentId={studentId}
                  marksId={editingMarkId || undefined}
                  onSuccess={() => {
                    setShowMarkForm(false);
                    setEditingMarkId(null);
                    fetchMarks();
                  }}
                  onCancel={() => {
                    setShowMarkForm(false);
                    setEditingMarkId(null);
                  }}
                />
              </div>
            )}

            {/* Marks Table */}
            <MarksTable
              studentId={studentId}
              onEdit={(marksId) => setEditingMarkId(marksId)}
              onDelete={() => fetchMarks()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
