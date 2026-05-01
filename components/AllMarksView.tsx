'use client';

import { useState, useEffect } from 'react';
import { Filter, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { normalizeStudent, normalizeMark } from '@/lib/normalize';

interface StudentMarksRecord {
  id: number;
  name: string;
  roll_no: string;
  class: string;
  subject: string;
  marks_obtained: number;
  grade: string;
  homework_status: 'Complete' | 'Incomplete';
  teacher_comments: string;
}

const GRADE_COLORS: { [key: string]: string } = {
  'A+': 'text-green-600 bg-green-50',
  'A': 'text-green-500 bg-green-50',
  'B': 'text-blue-500 bg-blue-50',
  'C': 'text-yellow-600 bg-yellow-50',
  'D': 'text-orange-600 bg-orange-50',
  'F': 'text-red-600 bg-red-50',
};

export function AllMarksView() {
  const [marksData, setMarksData] = useState<StudentMarksRecord[]>([]);
  const [filteredData, setFilteredData] = useState<StudentMarksRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    class: 'all',
    subject: 'all',
    grade: 'all',
  });

  const classes = ['10A', '10B', '11A', '11B', '12A', '12B'];
  const subjects = [
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
  const grades = ['A+', 'A', 'B', 'C', 'D', 'F'];

  useEffect(() => {
    fetchAllMarks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [marksData, filters]);

  const fetchAllMarks = async () => {
    try {
      setLoading(true);
      const [studentsRes, marksRes] = await Promise.all([
        fetch(api('/api/students')),
        fetch(api('/api/marks')),
      ]);

      const studentsRaw = await studentsRes.json();
      const marksRaw = await marksRes.json();

      const students = Array.isArray(studentsRaw) ? studentsRaw.map(normalizeStudent) : [];
      const marks = Array.isArray(marksRaw) ? marksRaw.map(normalizeMark) : [];

      // Combine student and marks data
      const combined: StudentMarksRecord[] = marks.map((mark: any) => {
        const student = students.find((s: any) => s.id === (mark.studentId || mark.student_id));
        return {
          id: mark.id,
          name: student?.name || 'Unknown',
          roll_no: student?.rollNo || '—',
          class: student?.className || '—',
          subject: mark.subject,
          marks_obtained: mark.marksObtained ?? mark.marks_obtained,
          grade: mark.grade,
          homework_status: mark.homeworkStatus || mark.homework_status,
          teacher_comments: mark.teacherComments || mark.teacher_comments || '',
        };
      });

      setMarksData(combined);
    } catch (error) {
      console.error('[v0] Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = marksData;

    if (filters.class !== 'all') {
      filtered = filtered.filter(m => m.class === filters.class);
    }

    if (filters.subject !== 'all') {
      filtered = filtered.filter(m => m.subject === filters.subject);
    }

    if (filters.grade !== 'all') {
      filtered = filtered.filter(m => m.grade === filters.grade);
    }

    setFilteredData(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDownloadCSV = () => {
    const headers = ['Student Name', 'Roll No', 'Class', 'Subject', 'Marks', 'Grade', 'Homework Status', 'Comments'];
    const rows = filteredData.map(record => [
      record.name,
      record.roll_no,
      record.class,
      record.subject,
      record.marks_obtained,
      record.grade,
      record.homework_status,
      record.teacher_comments || '—',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marks-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Loading marks data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent" />
            Filter & Search
          </h2>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Class</label>
            <select
              name="class"
              value={filters.class}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Grade</label>
            <select
              name="grade"
              value={filters.grade}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-input rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Entries</p>
          <p className="text-3xl font-bold text-accent">{filteredData.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Unique Students</p>
          <p className="text-3xl font-bold text-accent">{new Set(filteredData.map(m => m.roll_no)).size}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Average Marks</p>
          <p className="text-3xl font-bold text-accent">
            {filteredData.length > 0
              ? (filteredData.reduce((sum, m) => sum + m.marks_obtained, 0) / filteredData.length).toFixed(1)
              : '—'}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Homework Complete</p>
          <p className="text-3xl font-bold text-green-600">
            {filteredData.filter(m => m.homework_status === 'Complete').length}
          </p>
        </div>
      </div>

      {/* Table */}
      {filteredData.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Class</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Subject</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Marks</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Grade</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Homework</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Comments</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(record => (
                <tr key={record.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    <div>
                      <p className="font-semibold">{record.name}</p>
                      <p className="text-xs text-muted-foreground">Roll: {record.roll_no}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{record.class}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{record.subject}</td>
                  <td className="px-6 py-4 text-sm font-bold text-accent">{record.marks_obtained}/100</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full font-bold text-sm ${GRADE_COLORS[record.grade] || ''}`}>
                      {record.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.homework_status === 'Complete'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {record.homework_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                    {record.teacher_comments || <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-lg">No marks entries found</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or add new marks entries</p>
        </div>
      )}
    </div>
  );
}
