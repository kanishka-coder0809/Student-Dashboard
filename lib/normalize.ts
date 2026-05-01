export interface NormalizedStudent {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  email?: string;
  attendance: number;
}

export interface NormalizedMark {
  id: string;
  studentId: string;
  subject: string;
  examType: string;
  marksObtained: number;
  maxMarks?: number;
  grade: string;
  homeworkStatus: 'Complete' | 'Incomplete';
  teacherComments?: string;
  createdAt?: string;
}

export function normalizeStudent(raw: any): NormalizedStudent {
  return {
    id: raw._id?.toString() || raw.id?.toString() || String(raw.id || ''),
    name: raw.name || raw.full_name || '',
    rollNo: raw.rollNo || raw.roll_no || raw.roll || '',
    className: raw.class || raw.class_name || raw.className || '',
    email: raw.email,
    attendance: raw.attendance ?? raw.attendance_percentage ?? 0,
  };
}

export function normalizeMark(raw: any): NormalizedMark {
  return {
    id: raw._id?.toString() || raw.id?.toString() || String(raw.id || ''),
    studentId: raw.studentId || raw.student_id || raw.student || '',
    subject: raw.subject || '',
    examType: raw.exam_type || raw.examType || raw.exam || '',
    marksObtained: raw.marksObtained ?? raw.marks_obtained ?? 0,
    maxMarks: raw.maxMarks ?? raw.max_marks ?? 100,
    grade: raw.grade || '',
    homeworkStatus: raw.homeworkStatus || raw.homework_status || 'Incomplete',
    teacherComments: raw.comments || raw.teacher_comments || raw.teacherComments || '',
    createdAt: raw.createdAt || raw.created_at || '',
  };
}
