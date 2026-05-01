'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { StudentForm } from '@/components/StudentForm';
import { ChevronLeft } from 'lucide-react';

export default function EditStudentPage() {
  const params = useParams();
  const studentId = params.id as string;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="px-8 py-8">
          {/* Breadcrumb */}
          <Link href={`/students/${studentId}`} className="flex items-center gap-2 text-accent hover:opacity-80 mb-8">
            <ChevronLeft className="w-4 h-4" />
            Back to Student Profile
          </Link>

          {/* Header */}
          <h1 className="text-4xl font-bold text-foreground mb-2">Edit Student</h1>
          <p className="text-muted-foreground mb-8">Update student information</p>

          {/* Form */}
          <div className="bg-card border border-border rounded-lg p-8 max-w-2xl">
            <StudentForm studentId={studentId} />
          </div>
        </div>
      </div>
    </div>
  );
}
