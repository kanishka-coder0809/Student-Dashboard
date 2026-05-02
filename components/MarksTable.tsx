'use client';

import { useEffect, useState } from 'react';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { normalizeMark } from '@/lib/normalize';

interface Mark {
  _id: string;
  subject: string;
  marksObtained: number;
  maxMarks?: number;
  grade: string;
  homeworkStatus: 'Complete' | 'Incomplete';
  teacherComments?: string;
  createdAt?: string;
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
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchMarks();
    }
  }, [studentId]);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const url = studentId ? `/api/marks?studentId=${studentId}` : '/api/marks';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch marks');
      const data = await response.json();
      console.log('[MarksTable] Fetched marks:', data);
      const normalized = Array.isArray(data) ? data.map(normalizeMark) : [];
      setMarks(normalized as any);
    } catch (error) {
      console.error('[MarksTable] Error fetching marks:', error);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteMarks = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this marks entry?')) {
      try {
        const response = await fetch(`/api/marks?id=${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete marks');
        console.log('[MarksTable] Marks deleted successfully');
        fetchMarks();
        if (onDelete) onDelete();
      } catch (error) {
        console.error('[MarksTable] Error deleting marks:', error);
        alert('Failed to delete marks entry');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Loading marks...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Marks</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Grade</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Homework</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Comments</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {marks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No marks entries found. Add marks to get started!
                </td>
              </tr>
            ) : (
              marks.map((mark) => (
                <tr key={mark.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{mark.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="font-semibold">{mark.marksObtained}</span>
                    <span className="text-gray-500 text-xs"> / {mark.maxMarks || 100}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-bold text-lg ${GRADE_COLORS[mark.grade] || 'text-gray-900'}`}>
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
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-medium">Incomplete</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                    {mark.teacherComments || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit && onEdit(mark.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => deleteMarks(mark.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
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
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm text-gray-600">
          <span>Total Subjects: {marks.length}</span>
          <span>
            Average Marks:{' '}
            {(marks.reduce((sum, m) => sum + m.marksObtained, 0) / marks.length).toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}
