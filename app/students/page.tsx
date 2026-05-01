'use client';

import Sidebar from '@/components/Sidebar';
import { TopSearchBar } from '@/components/TopSearchBar';
import { StudentTable } from '@/components/StudentTable';
import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface SearchFilters {
  name: string;
  class: string;
  rollNo: string;
}

export default function StudentsPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    class: '',
    rollNo: '',
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Search Bar */}
        <TopSearchBar onSearch={setFilters} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Students</h1>
                <p className="text-muted-foreground mt-2">View and manage all student records</p>
              </div>
              <Link href="/students/new">
                <button className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-all font-medium">
                  <Plus className="w-5 h-5" />
                  Add Student
                </button>
              </Link>
            </div>

            {/* Student Table */}
            <StudentTable filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}
