'use client';

import Sidebar from '@/components/Sidebar';
import { useEffect, useMemo, useState } from 'react';
import { Download, BarChart3, PieChart as PieChartIcon, TrendingUp, Users } from 'lucide-react';
import { generateAllStudentsPDF } from '@/lib/pdf-export';
import { normalizeStudent } from '@/lib/normalize';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type StudentRecord = ReturnType<typeof normalizeStudent>;

const PIE_COLORS = ['#2563eb', '#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e'];

export default function Dashboard() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students?limit=1000');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students (${response.status})`);
      }

      const studentsRaw = await response.json();
      console.log('[Dashboard] Raw students data:', studentsRaw);
      
      const list = Array.isArray(studentsRaw) ? studentsRaw : [];
      const normalized = list.map(normalizeStudent);
      console.log('[Dashboard] Normalized students:', normalized);
      
      setStudents(normalized);
    } catch (error) {
      console.error('[Dashboard] Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const studentsForPdf = students.map((s) => ({
        id: Number.parseInt(s.id, 10) || 0,
        name: s.name,
        roll_no: s.rollNo,
        class: s.className,
        attendance_percentage: s.attendance,
      }));

      const pdf = await generateAllStudentsPDF(studentsForPdf);
      pdf.save('student_management_report.pdf');
    } catch (error) {
      console.error('[v0] Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const analytics = useMemo(() => {
    console.log('[Dashboard] Calculating analytics with', students.length, 'students');
    
    const classCounts = students.reduce<Record<string, number>>((accumulator, student) => {
      const className = student.className?.trim() || 'Unassigned';
      accumulator[className] = (accumulator[className] || 0) + 1;
      return accumulator;
    }, {});

    const classWiseAttendance = students.reduce<Record<string, { total: number; count: number }>>(
      (accumulator, student) => {
        const className = student.className?.trim() || 'Unassigned';
        if (!accumulator[className]) {
          accumulator[className] = { total: 0, count: 0 };
        }
        accumulator[className].total += student.attendance ?? 0;
        accumulator[className].count += 1;
        return accumulator;
      },
      {}
    );

    const pieData = Object.entries(classCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value);

    const barData = Object.entries(classWiseAttendance)
      .map(([name, value]) => ({
        name,
        averageAttendance: value.count ? Number((value.total / value.count).toFixed(1)) : 0,
        students: classCounts[name] || 0,
      }))
      .sort((left, right) => right.students - left.students);

    const attendanceBuckets = [
      { label: '90-100%', min: 90, max: 100 },
      { label: '75-89%', min: 75, max: 89 },
      { label: '60-74%', min: 60, max: 74 },
      { label: 'Below 60%', min: 0, max: 59 },
    ].map((bucket) => ({
      ...bucket,
      count: students.filter((student) => {
        const attendance = student.attendance ?? 0;
        return attendance >= bucket.min && attendance <= bucket.max;
      }).length,
    }));

    const averageAttendance = students.length
      ? Number((students.reduce((sum, student) => sum + (student.attendance ?? 0), 0) / students.length).toFixed(1))
      : 0;

    const topClass = pieData[0]?.name || 'None';
    
    const result = {
      pieData,
      barData,
      attendanceBuckets,
      averageAttendance,
      totalStudents: students.length,
      classCount: pieData.length,
      topClass,
    };
    
    console.log('[Dashboard] Analytics calculated:', result);
    return result;
  }, [students]);

  return (
    <div className="page-shell">
      <Sidebar />

      <main className="page-main">
        <div className="page-main-inner">
          <section className="hero-panel space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <span className="chip-soft">Student dashboard</span>
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
                    Student Management
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                    Track class strength, attendance health, and overall student distribution with a
                    cleaner analytics view.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="btn-accent-gradient flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  {exporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="surface-chip">
                <Users className="h-5 w-5 text-sky-600" />
                <div className="text-2xl font-bold text-foreground">{analytics.totalStudents}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total students</div>
              </div>
              <div className="surface-chip">
                <PieChartIcon className="h-5 w-5 text-cyan-600" />
                <div className="text-2xl font-bold text-foreground">{analytics.classCount}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active classes</div>
              </div>
              <div className="surface-chip">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <div className="text-2xl font-bold text-foreground">
                  {analytics.averageAttendance ? `${analytics.averageAttendance}%` : '—'}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Avg attendance</div>
              </div>
              <div className="surface-chip">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <div className="text-lg font-bold text-foreground">{analytics.topClass}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Largest class</div>
              </div>
            </div>
          </section>

          {loading ? (
            <div className="card-elevated flex h-80 items-center justify-center text-muted-foreground">
              Loading dashboard analytics...
            </div>
          ) : (
            <>
              <section className="grid gap-6 xl:grid-cols-5">
                <div className="card-elevated xl:col-span-2">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Class Distribution</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        How many students are in each class.
                      </p>
                    </div>
                  </div>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
                        <Legend />
                        <Pie
                          data={analytics.pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={3}
                        >
                          {analytics.pieData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-elevated xl:col-span-3">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Attendance Tracking</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Average attendance by class for quick health checks.
                      </p>
                    </div>
                  </div>
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="averageAttendance"
                          name="Avg Attendance %"
                          radius={[12, 12, 0, 0]}
                          fill="url(#attendanceGradient)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <svg width="0" height="0" aria-hidden="true" focusable="false">
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-3">
                <div className="card-elevated lg:col-span-2">
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-foreground">Attendance Bands</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Distribution of students across attendance ranges.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {analytics.attendanceBuckets.map((bucket) => (
                      <div key={bucket.label} className="rounded-2xl border border-border bg-secondary/40 p-4">
                        <div className="text-sm font-medium text-muted-foreground">{bucket.label}</div>
                        <div className="mt-2 text-3xl font-bold text-foreground">{bucket.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-elevated">
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-foreground">Quick Notes</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Dashboard summary for the current dataset.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-muted-foreground">Largest class</div>
                      <div className="mt-1 text-lg font-bold text-foreground">{analytics.topClass}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-muted-foreground">Average attendance</div>
                      <div className="mt-1 text-lg font-bold text-foreground">
                        {analytics.averageAttendance ? `${analytics.averageAttendance}%` : '—'}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-muted-foreground">Export report</div>
                      <div className="mt-1 text-sm text-foreground">
                        Generate a PDF snapshot of all students.
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
          </div>
      </main>
    </div>
  );
}
