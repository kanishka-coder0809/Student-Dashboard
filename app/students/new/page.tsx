'use client';

import Sidebar from '@/components/Sidebar';
import { StudentForm } from '@/components/StudentForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewStudentPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="px-8 py-8">
          {/* Breadcrumb */}
          <Link href="/students" className="flex items-center gap-2 text-accent hover:opacity-80 mb-8">
            <ChevronLeft className="w-4 h-4" />
            Back to Students
          </Link>

          {/* Header */}
          <h1 className="text-4xl font-bold text-foreground mb-2">Add New Student</h1>
          <p className="text-muted-foreground mb-8">Fill in the student information to add them to the system</p>

          {/* Form */}
          <div className="bg-card border border-border rounded-lg p-8 max-w-2xl">
            <StudentForm />
          </div>
        </div>
      </div>
    </div>
  );
}
