import React from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Users,
  Briefcase,
  FileCheck,
  Award,
  ArrowRight,
  Clock,
  Building2,
  FileSpreadsheet,
  Plus,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export function CoordinatorDashboardView({ data, isLoading, user }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-96 rounded-2xl" />
          <Skeleton className="lg:col-span-4 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const deptName = user?.departmentName || 'Computer Engineering';

  // Fallback / Mock analytical data scoped to Coordinator
  const stats = data?.stats || {
    deptStudents: 120,
    activeDrives: 18,
    pendingShortlists: 42,
    placedStudents: 48,
    placementRate: 40.0,
    placementRateDelta: '+5.5% vs 2024',
  };

  const divisionData = data?.divisionPlacement || [
    { division: 'Div A', rate: 76, placed: 28 },
    { division: 'Div B', rate: 68, placed: 24 },
    { division: 'Div C', rate: 62, placed: 20 },
  ];

  const upcomingDrives = data?.upcomingDrives || [
    { id: 1, company: 'TCS Ninja', ctc: '7.0 LPA', deadline: '2026-09-25', status: 'Open', eligibleCount: 38 },
    { id: 2, company: 'Infosys Specialist', ctc: '9.5 LPA', deadline: '2026-09-28', status: 'Open', eligibleCount: 22 },
    { id: 3, company: 'Capgemini Analyst', ctc: '5.5 LPA', deadline: '2026-10-02', status: 'Shortlisting', eligibleCount: 45 },
    { id: 4, company: 'KPIT Technologies', ctc: '6.0 LPA', deadline: '2026-10-08', status: 'Open', eligibleCount: 29 },
  ];

  const activities = data?.recentActivities || [
    { id: 1, text: 'Auto-shortlisted 38 Computer Engg students for TCS Ninja', time: '20 mins ago', icon: Briefcase },
    { id: 2, text: 'Uploaded semester 6 SGPA update sheet for Division B', time: '2 hours ago', icon: Users },
    { id: 3, text: 'Verified 12 student resume submissions', time: 'Yesterday', icon: FileCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Department Hero Header */}
      <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F5F0E6] border border-zinc-700 text-zinc-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5 text-zinc-800" />
              <span>Department Scoped Workflow</span>
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-zinc-900">
              {deptName} Department Dashboard
            </h1>
            <p className="text-zinc-600 text-xs mt-1 max-w-xl font-medium">
              Coordinator Portal — Student directory, division performance, & company drive shortlisting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/students/import"
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-heading font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-2 transition-all border border-zinc-800"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Upload Dept Data</span>
            </Link>
            <Link
              to="/students"
              className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F5F0E6] border border-zinc-700 text-zinc-900 font-heading font-bold text-xs rounded-xl inline-flex items-center space-x-2 transition-all"
            >
              <Users className="w-4 h-4 text-zinc-800" />
              <span>View Dept Students</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Dept. Students</span>
          <span className="font-heading font-extrabold text-3xl text-zinc-900 block mt-1">{stats.deptStudents}</span>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Enrolled in {deptName}</span>
        </div>

        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Active Dept Drives</span>
          <span className="font-heading font-extrabold text-3xl text-zinc-900 block mt-1">{stats.activeDrives}</span>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Open for department branch</span>
        </div>

        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Pending Reviews</span>
          <span className="font-heading font-extrabold text-3xl text-amber-800 block mt-1">{stats.pendingShortlists}</span>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Applications awaiting review</span>
        </div>

        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Students Placed</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="font-heading font-extrabold text-3xl text-emerald-700">{stats.placedStudents}</span>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              {stats.placementRate}% Rate
            </span>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">{stats.placementRateDelta}</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Division Chart */}
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-300">
              <h3 className="font-heading text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                Division Placement Breakdown (%)
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#F5F0E6] border border-zinc-700 text-zinc-900 text-[10px] font-bold uppercase">
                {deptName}
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={divisionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE1D2" vertical={false} />
                  <XAxis dataKey="division" tick={{ fill: '#3F3F46', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#3F3F46', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #27272A', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(val) => [`${val}%`, 'Placement Rate']}
                  />
                  <Bar dataKey="rate" fill="#18181B" radius={[6, 6, 0, 0]} name="Placement Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dept Drives Table */}
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-300">
              <h3 className="font-heading text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                Department Eligible Drives
              </h3>
              <Link to="/drives" className="text-xs font-bold text-zinc-900 hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-zinc-800 text-zinc-600 font-extrabold uppercase tracking-wider text-[10px] bg-[#FAF8F5]">
                    <th className="py-3 px-3">Company Name</th>
                    <th className="py-3 px-3">Package</th>
                    <th className="py-3 px-3">Deadline</th>
                    <th className="py-3 px-3">Eligible Students</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-semibold text-zinc-900">
                  {upcomingDrives.map((d) => (
                    <tr key={d.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-3 font-bold text-zinc-900">{d.company}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-amber-800">{d.ctc}</td>
                      <td className="py-3.5 px-3 text-zinc-600 font-medium">{d.deadline}</td>
                      <td className="py-3.5 px-3 font-bold">{d.eligibleCount} Students</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-100 text-emerald-900 border-emerald-300">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Log Feed (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-300">
              <h3 className="font-heading text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                Department Activity Log
              </h3>
              <Clock className="w-4 h-4 text-zinc-500" />
            </div>

            <div className="space-y-3">
              {activities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-start space-x-3 text-xs border-b border-zinc-200 pb-2.5 last:border-0 last:pb-0">
                    <div className="w-7 h-7 rounded-lg bg-[#F5F0E6] text-zinc-900 flex items-center justify-center shrink-0 mt-0.5 border border-zinc-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-900 font-semibold leading-snug">{act.text}</p>
                      <span className="text-[10px] text-zinc-500 font-bold mt-0.5 block">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
