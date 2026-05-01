'use client';

import Sidebar from '@/components/Sidebar';
import { TopSearchBar } from '@/components/TopSearchBar';
import { ClassesManagementDashboard } from '@/components/ClassesManagementDashboard';
import { useState } from 'react';

interface SearchFilters {
  name: string;
  class: string;
  rollNo: string;
}

export default function ClassesPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    class: '',
    rollNo: '',
  });

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
          <div className="px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gradient mb-2">Classes Management</h1>
              <p className="text-muted-foreground">Create and manage your school classes</p>
            </div>

            {/* Dashboard */}
            <ClassesManagementDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
