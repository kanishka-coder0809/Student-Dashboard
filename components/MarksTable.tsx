'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { normalizeMark } from '@/lib/normalize';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Marks {
  id: number;
  student_id: number;
  subject: string;
  exam_type: string;
  marks_obtained: number;
  grade: string;
  homework_status: 'Complete' | 'Incomplete';
  teacher_comments: string;
  created_at: string;
}

interface MarksTableProps {
  studentId?: string;
  onEdit?: (marksId: string) => void;
  onDelete?: () => void;
}

const GRADE_COLORS: { [key: string]: string } = {
  'A+': 'text-green-600',
  'A': 'text-green-500',
  'B': 'text-blue-500',
  'C': 'text-yellow-500',
  'D': 'text-orange-500',
  'F': 'text-red-500',
};

export function MarksTable({ studentId, onEdit, onDelete }: MarksTableProps) {
  const [marks, setMarks] = useState<Marks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, [studentId]);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const url = studentId
        ? `/api/marks/student/${studentId}`
        : '/api/marks';
      const response = await fetch(api(url));
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map(normalizeMark);
      setMarks(normalized as any);
    } catch (error) {
      console.error('[v0] Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMarks = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this marks entry?')) {
      try {
        await fetch(api(`/api/marks/${id}`), { method: 'DELETE' });
        fetchMarks();
        if (onDelete) onDelete();
      } catch (error) {
        console.error('[v0] Error deleting marks:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Loading marks...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Subject</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Exam Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Marks</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Grade</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Homework</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Comments</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {marks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No marks entries found
                </td>
              </tr>
            ) : (
              marks.map((mark) => (
                <tr key={mark.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{mark.subject}</td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{mark.exam_type || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <span className="font-semibold">{mark.marks_obtained}</span>
                    <span className="text-muted-foreground text-xs"> / 50</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-bold text-lg ${GRADE_COLORS[mark.grade] || 'text-foreground'}`}>
                      {mark.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {mark.homework_status === 'Complete' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-medium">Complete</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-medium">Incomplete</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                    {mark.teacher_comments || <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit && onEdit(mark.id.toString())}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-accent" />
                      </button>
                      <button
                        onClick={() => deleteMarks(mark.id.toString())}
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
      {marks.length > 0 && (
        <div className="bg-secondary/50 border-t border-border px-6 py-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Total Entries: {marks.length}</span>
          <span>
            Average Marks:{' '}
            {(marks.reduce((sum, m) => sum + m.marks_obtained, 0) / marks.length).toFixed(1)}/100
          </span>
        </div>
      )}
    </div>
  );
}
