'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { MarksForm } from '@/components/MarksForm';
import { MarksTable } from '@/components/MarksTable';
import { ChevronLeft, User, BookOpen, Download } from 'lucide-react';
import { generateStudentPDF } from '@/lib/pdf-export';
import { api } from '@/lib/api';
import { normalizeStudent } from '@/lib/normalize';

interface StudentDetail {
  id: string;
  name: string;
  roll_no?: string;
  class?: string;
  attendance_percentage?: number;
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await fetch(api(`/api/students/${studentId}`));
      const raw = await response.json();
      // raw may already be normalized by server
      const normalized = normalizeStudent(raw);
      setStudent(normalized);
    } catch (error) {
      console.error('[v0] Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!student) return;
    setExporting(true);
    try {
      const marksResponse = await fetch(api(`/api/marks/student/${studentId}`));
      const marksRaw = await marksResponse.json();
      const marks = Array.isArray(marksRaw)
        ? marksRaw.map((m: any) => ({
            subject: m.subject,
            marks_obtained: m.marksObtained ?? m.marks_obtained ?? 0,
            grade: m.grade,
            homework_status: m.homeworkStatus || m.homework_status || 'Incomplete',
            teacher_comments: m.teacherComments || m.teacher_comments || '',
          }))
        : [];

      const pdf = await generateStudentPDF({
        id: student.id,
        name: student.name,
        roll_no: student.roll_no || student.rollNo || '',
        class: student.class || student.className || '',
        attendance_percentage: student.attendance ?? student.attendance_percentage ?? 0,
        marks,
      });
      pdf.save(`${student.name}_report.pdf`);
    } catch (error) {
      console.error('[v0] Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Student not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto bg-white">
        <div className="px-8 py-8">
          {/* Breadcrumb */}
          <Link href="/students" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 transition-colors font-medium">
            <ChevronLeft className="w-4 h-4" />
            Back to Students
          </Link>

          {/* Header with Student Info */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{student.name}</h1>
              <div className="flex gap-6 text-sm">
                <p className="text-gray-600"><span className="font-semibold">Roll No:</span> {student.roll_no}</p>
                <p className="text-gray-600"><span className="font-semibold">Class:</span> {student.class}</p>
                <p className="text-gray-600"><span className="font-semibold">Attendance:</span> <span className="text-purple-600 font-semibold">{student.attendance_percentage}%</span></p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-all shadow-md"
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
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Roll Number</p>
              <p className="text-2xl font-bold text-gray-900">{student.roll_no}</p>
            </div>

            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Class</p>
              <p className="text-2xl font-bold text-gray-900">{student.class}</p>
            </div>

            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Monthly Attendance</p>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-3xl font-bold text-purple-600">{student.attendance_percentage}</p>
                <p className="text-gray-600">%</p>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${student.attendance_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Marks Section */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient">Academic Records</h2>
                {!showMarkForm && !editingMarkId && (
                  <button
                    onClick={() => setShowMarkForm(true)}
                    className="btn-primary-gradient"
                  >
                    Add Marks
                  </button>
                )}
              </div>

              {/* Add Marks Form */}
              {(showMarkForm || editingMarkId) && (
                <div className="mb-8">
                  <MarksForm
                    studentId={studentId}
                    marksId={editingMarkId || undefined}
                    onSuccess={() => {
                      setShowMarkForm(false);
                      setEditingMarkId(null);
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
