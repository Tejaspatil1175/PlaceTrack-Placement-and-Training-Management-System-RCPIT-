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
  Building2,
  Calendar,
  Bell,
  Clock,
  Plus,
  FileSpreadsheet,
  TrendingUp,
  ExternalLink,
  Sparkles,
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

export function OfficerDashboardView({ data, isLoading }) {
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

  // Analytics datasets
  const stats = data?.stats || {
    totalStudents: 540,
    activeDrives: 24,
    totalApplications: 1280,
    studentsPlaced: 185,
    placementRate: 68.5,
    placementRateDelta: '+8.2% vs 2024',
  };

  const branchData = data?.branchWisePlacement || [
    { branch: 'Computer', rate: 82, target: 90 },
    { branch: 'IT', rate: 78, target: 85 },
    { branch: 'AI & DS', rate: 74, target: 80 },
    { branch: 'ENTC', rate: 61, target: 70 },
    { branch: 'Mechanical', rate: 52, target: 65 },
    { branch: 'Civil', rate: 45, target: 60 },
  ];

  const trendData = data?.yearlyTrend || [
    { year: '2021', placed: 110, rate: 55 },
    { year: '2022', placed: 135, rate: 60 },
    { year: '2023', placed: 152, rate: 64 },
    { year: '2024', placed: 168, rate: 66 },
    { year: '2025', placed: 185, rate: 68.5 },
  ];

  const upcomingDrives = data?.upcomingDrives || [
    { id: 1, company: 'Tata Consultancy Services (TCS)', ctc: '7.0 LPA', deadline: '2026-09-25', status: 'Open', applicants: 142 },
    { id: 2, company: 'Infosys Limited', ctc: '6.5 LPA', deadline: '2026-09-28', status: 'Open', applicants: 118 },
    { id: 3, company: 'Capgemini India', ctc: '5.5 LPA', deadline: '2026-10-02', status: 'Shortlisting', applicants: 95 },
    { id: 4, company: 'KPIT Technologies', ctc: '6.0 LPA', deadline: '2026-10-08', status: 'Open', applicants: 74 },
  ];

  const activities = data?.recentActivities || [
    { id: 1, text: 'TCS Ninja drive eligibility filter generated for 180 students', time: '10 mins ago', icon: Briefcase },
    { id: 2, text: 'Computer Dept. Coordinator updated 14 interview selections', time: '1 hour ago', icon: FileCheck },
    { id: 3, text: 'Bulk Excel import completed for 60 ENTC 3rd year students', time: '3 hours ago', icon: Users },
    { id: 4, text: 'Mock Aptitude Session announced by T&P Cell for Sem 7', time: 'Yesterday', icon: Bell },
  ];

  const departments = data?.departmentSnapshots || [
    { name: 'Computer Engineering', total: 140, placed: 82, rate: '74%' },
    { name: 'Information Technology', total: 110, placed: 64, rate: '71%' },
    { name: 'AI & Data Science', total: 90, placed: 50, rate: '69%' },
    { name: 'Electronics & Telecom', total: 100, placed: 42, rate: '56%' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Action Header (Full White surface, Beige accent highlight, Dark Grey thin border) */}
      <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F5F0E6] border border-zinc-700 text-zinc-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5 text-zinc-800" />
              <span>Training & Placement Cell • Command Overview</span>
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-zinc-900">
              Campus Placement Command Center
            </h1>
            <p className="text-zinc-600 text-xs mt-1 max-w-2xl font-medium">
              R.C. Patel Institute of Technology, Shirpur — Live overview of recruiting drives, branch performance, & department workflows.
            </p>
          </div>

          {/* Quick Action Launchpad */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/drives/new"
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-heading font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-2 transition-all border border-zinc-800 focus:ring-2 focus:ring-zinc-800"
            >
              <Plus className="w-4 h-4" />
              <span>Create Drive</span>
            </Link>
            <Link
              to="/notifications/new"
              className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F5F0E6] border border-zinc-700 text-zinc-900 font-heading font-bold text-xs rounded-xl inline-flex items-center space-x-2 transition-all focus:ring-2 focus:ring-zinc-800"
            >
              <Bell className="w-4 h-4 text-amber-700" />
              <span>Send Announcement</span>
            </Link>
            <Link
              to="/students/import"
              className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F5F0E6] border border-zinc-700 text-zinc-900 font-heading font-bold text-xs rounded-xl inline-flex items-center space-x-2 transition-all focus:ring-2 focus:ring-zinc-800"
            >
              <FileSpreadsheet className="w-4 h-4 text-zinc-800" />
              <span>Bulk Excel Import</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Cards Grid (Full White, Beige icon bg, Dark Grey Thin Border, Card-Pop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Total Registered</span>
            <div className="w-9 h-9 rounded-xl bg-[#F5F0E6] text-zinc-900 flex items-center justify-center shrink-0 border border-zinc-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-extrabold text-3xl text-zinc-900 block">{stats.totalStudents}</span>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Registered across all departments</span>
        </div>

        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Active Drives</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-extrabold text-3xl text-zinc-900 block">{stats.activeDrives}</span>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Open placement drives</span>
        </div>

        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Total Applications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 border border-blue-300">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-extrabold text-3xl text-zinc-900 block">{stats.totalApplications}</span>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Submitted this academic year</span>
        </div>

        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Students Placed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-heading font-extrabold text-3xl text-emerald-700">{stats.studentsPlaced}</span>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              {stats.placementRate}% Rate
            </span>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">{stats.placementRateDelta}</span>
        </div>
      </div>

      {/* Main Grid: Charts & Drives Left (8 cols) + Activity Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Branch-wise Placement Bar Chart */}
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-300">
              <div>
                <h3 className="font-heading text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                  Branch Placement Percentage (%)
                </h3>
                <p className="text-zinc-600 text-xs mt-0.5 font-medium">Branch-wise placement rate comparison vs targets</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#F5F0E6] border border-zinc-700 text-zinc-900 text-[10px] font-bold uppercase">
                Current Batch 2025-26
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE1D2" vertical={false} />
                  <XAxis dataKey="branch" tick={{ fill: '#3F3F46', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#3F3F46', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #27272A', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(val) => [`${val}%`, 'Placement Rate']}
                  />
                  <Bar dataKey="rate" fill="#18181B" radius={[6, 6, 0, 0]} name="Placement Rate (%)" />
                  <Bar dataKey="target" fill="#A69282" radius={[6, 6, 0, 0]} opacity={0.4} name="Target (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Recruitment Drives Table */}
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-300">
              <div>
                <h3 className="font-heading text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                  Active Placement Drives
                </h3>
                <p className="text-zinc-600 text-xs mt-0.5 font-medium">Top recruiting companies open for RCPIT students</p>
              </div>
              <Link
                to="/drives"
                className="text-xs font-bold text-zinc-900 hover:underline inline-flex items-center space-x-1"
              >
                <span>View All Drives</span>
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
                    <th className="py-3 px-3">Applicants</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-semibold text-zinc-900">
                  {upcomingDrives.map((d) => (
                    <tr key={d.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-3 font-bold text-zinc-900">{d.company}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-amber-800">{d.ctc}</td>
                      <td className="py-3.5 px-3 text-zinc-600 font-medium">{d.deadline}</td>
                      <td className="py-3.5 px-3 font-bold">{d.applicants} Students</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            d.status === 'Open'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <Link
                          to={`/drives/${d.id}`}
                          className="p-1 text-zinc-700 hover:text-zinc-900 inline-block"
                          title="Open drive detail"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Department Breakdown Panel */}
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-300">
              <h3 className="font-heading text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                Department Overview
              </h3>
              <Link to="/departments" className="text-[11px] font-bold text-zinc-800 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {departments.map((dept) => (
                <div key={dept.name} className="p-3 bg-[#FAF8F5] border border-zinc-700 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 truncate">{dept.name}</span>
                  <span className="font-extrabold text-zinc-900 shrink-0 ml-2">{dept.rate} ({dept.placed}/{dept.total})</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Activity Ticker */}
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-300">
              <h3 className="font-heading text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                Recent Activity Log
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
