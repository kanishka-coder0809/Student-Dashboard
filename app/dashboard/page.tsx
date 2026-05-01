'use client';

import Sidebar from '@/components/Sidebar';
import { TopSearchBar } from '@/components/TopSearchBar';
import { StudentTable } from '@/components/StudentTable';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';
import { generateAllStudentsPDF } from '@/lib/pdf-export';
import { api } from '@/lib/api';

interface SearchFilters {
  name: string;
  class: string;
  rollNo: string;
}

export default function Dashboard() {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    class: '',
    rollNo: '',
  });
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await fetch(api('/api/students?limit=1000'));
      const studentsRaw = await response.json();
      const students = (Array.isArray(studentsRaw) ? studentsRaw : []).map((s: any) => ({
        id: s._id || s.id,
        name: s.name,
        roll_no: s.rollNo || s.roll_no || '',
        class: s.class || s.class_name || '',
        attendance_percentage: s.attendance ?? s.attendance_percentage ?? 0,
        marks: s.marks || undefined,
      }));

      const pdf = await generateAllStudentsPDF(students);
      pdf.save('student_management_report.pdf');
    } catch (error) {
      console.error('[v0] Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Search Bar */}
        <TopSearchBar onSearch={setFilters} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="ml-64 px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">Student Management</h1>
                <p className="text-muted-foreground">Manage and track student information, marks, and attendance</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="btn-accent-gradient flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {exporting ? 'Exporting...' : 'Export PDF'}
                </button>
                <Link href="/students/new">
                  <button className="btn-primary-gradient flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Student
                  </button>
                </Link>
              </div>
            </div>

            {/* Student Table */}
            <div className="card-elevated">
              <h2 className="text-xl font-bold text-foreground mb-6">All Students</h2>
              <StudentTable filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
