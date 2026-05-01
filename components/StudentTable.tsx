'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { normalizeStudent } from '@/lib/normalize';
import Link from 'next/link';
import { Eye, Trash2, Edit2 } from 'lucide-react';

import type { NormalizedStudent } from '@/lib/normalize';

type Student = NormalizedStudent & { marksAverage?: number };

interface StudentTableProps {
  filters: {
    name: string;
    class: string;
    rollNo: string;
  };
}

export function StudentTable({ filters }: StudentTableProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(api('/api/students'));
      if (!response.ok) {
        throw new Error(`Failed to fetch students (${response.status})`);
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map(normalizeStudent);
      setStudents(normalized);
      setFilteredStudents(normalized);
      if (!Array.isArray(data)) {
        console.error('[v0] Unexpected API response:', data);
      }
    } catch (error) {
      console.error('[v0] Error fetching students:', error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = students;

    if (filters.name) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.class) {
      filtered = filtered.filter(s => s.className === filters.class);
    }

    if (filters.rollNo) {
      filtered = filtered.filter(s => s.rollNo.toString().includes(filters.rollNo));
    }

    setFilteredStudents(filtered);
  }, [filters, students]);

  const deleteStudent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await fetch(api(`/api/students/${id}`), { method: 'DELETE' });
        if (!response.ok) {
          throw new Error(`Failed to delete student (${response.status})`);
        }
        fetchStudents();
      } catch (error) {
        console.error('[v0] Error deleting student:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Roll No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Class</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Attendance</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Avg Marks</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{student.rollNo}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{student.className}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{ width: `${student.attendance}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{student.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {student.marksAverage ? (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-accent">{student.marksAverage.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Link href={`/students/${student.id}`}>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4 text-accent" />
                        </button>
                      </Link>
                      <Link href={`/students/${student.id}/edit`}>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4 text-accent" />
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteStudent(student.id.toString())}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="bg-secondary/50 border-t border-border px-6 py-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Total Students: {filteredStudents.length}</span>
        <span>Avg Attendance: {filteredStudents.length > 0 ? (filteredStudents.reduce((sum, s) => sum + (s.attendance ?? 0), 0) / filteredStudents.length).toFixed(1) : '—'}%</span>
      </div>
    </div>
  );
}
