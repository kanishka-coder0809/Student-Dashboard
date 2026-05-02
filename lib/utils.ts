/**
 * Calculates grade based on obtained marks and max marks
 * Rules:
 * Below 40% -> F
 * 40% - 49% -> E
 * 50% - 59% -> D
 * 60% - 69% -> C
 * 70% - 79% -> B
 * 80% and above -> A
 */
export const calculateGrade = (obtainedMarks: number | string | null, maxMarks: number | string | null = 100): string => {
  const obtained = typeof obtainedMarks === 'string' ? parseFloat(obtainedMarks) : (obtainedMarks ?? 0);
  const max = typeof maxMarks === 'string' ? parseFloat(maxMarks) : (maxMarks ?? 100);

  if (!max || max <= 0) return 'F';
  
  const percentage = (obtained / max) * 100;

  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
};
