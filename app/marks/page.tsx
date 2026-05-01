'use client';

import Sidebar from '@/components/Sidebar';
import { TopSearchBar } from '@/components/TopSearchBar';
import { MarksManagementDashboard } from '@/components/MarksManagementDashboard';
import { useState } from 'react';

interface SearchFilters {
  name: string;
  class: string;
  rollNo: string;
}

export default function MarksPage() {
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
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Marks Management Dashboard</h1>
              <p className="text-muted-foreground">Add, edit, and manage student marks for all subjects in real-time</p>
            </div>

            {/* Dashboard */}
            <MarksManagementDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
