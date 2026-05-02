'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFilters {
  name: string;
  class: string;
  rollNo: string;
}

interface Class {
  id: string;
  _id?: string;
  class_name: string;
  section?: string;
}

interface TopSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export function TopSearchBar({ onSearch }: TopSearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    class: '',
    rollNo: '',
  });
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[TopSearchBar] Error fetching classes:', error);
    }
  };

  const handleChange = (field: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <div className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="px-8 py-6 flex items-center gap-4">
        {/* Search Icon */}
        <div className="flex items-center bg-card border border-input rounded-lg px-4 py-2 flex-1">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="bg-transparent border-0 outline-none ml-2 flex-1 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Class Filter */}
        <div className="flex items-center bg-card border border-input rounded-lg px-4 py-2 gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={filters.class}
            onChange={(e) => handleChange('class', e.target.value)}
            className="bg-transparent border-0 outline-none text-foreground cursor-pointer text-sm"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id || cls._id} value={cls.class_name}>
                {cls.class_name} {cls.section ? `- ${cls.section}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Roll No Filter */}
        <div className="flex items-center bg-card border border-input rounded-lg px-4 py-2">
          <input
            type="text"
            placeholder="Roll No..."
            value={filters.rollNo}
            onChange={(e) => handleChange('rollNo', e.target.value)}
            className="bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm w-24"
          />
        </div>
      </div>
    </div>
  );
}
