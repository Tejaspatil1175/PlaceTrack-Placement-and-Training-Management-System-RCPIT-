import React from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const deptName = user?.departmentName || 'Computer Engineering';

  // Fallback / Mock data scoped to Coordinator's department
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

  const trendData = data?.yearlyTrend || [
    { year: '2021', placed: 32, rate: 50 },
    { year: '2022', placed: 38, rate: 55 },
    { year: '2023', placed: 42, rate: 58 },
    { year: '2024', placed: 45, rate: 62 },
    { year: '2025', placed: 48, rate: 64 },
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
      {/* Coordinator Prominent Department Header Banner */}
      <div className="bg-primary-900 text-white p-6 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-700 border border-primary-500 text-accent-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Department Scoped Workflow</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            {deptName} Department
          </h1>
          <p className="text-primary-100/80 text-sm mt-0.5">
            Coordinator Dashboard — Student tracking, drive shortlisting, & department analytics.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-primary-700/60 px-4 py-2 rounded-lg border border-primary-500 shrink-0">
          <Users className="w-4 h-4 text-accent-500" />
          <span className="text-xs font-semibold text-white">
            {stats.deptStudents} Registered Students
          </span>
        </div>
      </div>

      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Dept. Students"
          value={stats.deptStudents}
          subtitle={`Enrolled in ${deptName}`}
          icon={Users}
          iconColor="text-primary-700"
          iconBg="bg-primary-100"
        />
        <StatCard
          label="Eligible Drives"
          value={stats.activeDrives}
          subtitle="Open for department branch"
          icon={Briefcase}
          iconColor="text-accent-500"
          iconBg="bg-accent-500/10"
        />
        <StatCard
          label="Pending Shortlists"
          value={stats.pendingShortlists}
          subtitle="Applications awaiting review"
          icon={FileCheck}
          iconColor="text-warning-600"
          iconBg="bg-warning-100"
        />
        <StatCard
          label="Students Placed"
          value={stats.placedStudents}
          delta={stats.placementRateDelta}
          deltaType="increase"
          subtitle={`${stats.placementRate}% department placement rate`}
          icon={Award}
          iconColor="text-success-600"
          iconBg="bg-success-100"
        />
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Division Breakdown Bar Chart */}
        <div className="bg-bg-surface p-5 border border-border-subtle rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-sm font-semibold text-text-primary">
                Division Placement Breakdown
              </h3>
              <p className="text-[11px] text-text-muted">Placement percentage by class division</p>
            </div>
            <span className="text-[10px] font-semibold text-primary-500 bg-primary-100 px-2 py-0.5 rounded uppercase">
              Class Divisions
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divisionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EB" vertical={false} />
                <XAxis dataKey="division" tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E6EB', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'Placement Rate']}
                />
                <Bar dataKey="rate" fill="#1C3F63" radius={[4, 4, 0, 0]} name="Placement Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Growth Trend Line Chart */}
        <div className="bg-bg-surface p-5 border border-border-subtle rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-sm font-semibold text-text-primary">
                Department Placement Growth
              </h3>
              <p className="text-[11px] text-text-muted">Historical department selection trend</p>
            </div>
            <span className="text-[10px] font-semibold text-success-600 bg-success-100 px-2 py-0.5 rounded uppercase">
              Department Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EB" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E6EB', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="placed" stroke="#1C3F63" strokeWidth={2.5} dot={{ r: 4, fill: '#B8862E' }} name="Department Placed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Department Drives Table + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-sm font-semibold text-text-primary">
                Department Eligible Drives
              </h3>
              <p className="text-[11px] text-text-muted">Active placement drives open for {deptName}</p>
            </div>
            <Link to="/drives" className="text-xs text-primary-500 font-semibold hover:underline flex items-center space-x-1">
              <span>View Drives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingDrives.length === 0 ? (
            <EmptyState title="No active drives" description="No active placement drives for your department currently." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-subtle text-text-muted font-semibold uppercase tracking-wider">
                    <th className="pb-2.5 font-semibold">Company Name</th>
                    <th className="pb-2.5 font-semibold">Package</th>
                    <th className="pb-2.5 font-semibold">Deadline</th>
                    <th className="pb-2.5 font-semibold">Eligible Students</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {upcomingDrives.map((drive) => (
                    <tr key={drive.id} className="hover:bg-bg-base transition-colors">
                      <td className="py-3 font-semibold text-primary-900">{drive.company}</td>
                      <td className="py-3 font-mono font-medium text-accent-500">{drive.ctc}</td>
                      <td className="py-3 text-text-secondary">{drive.deadline}</td>
                      <td className="py-3 text-text-secondary font-medium">{drive.eligibleCount}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            drive.status === 'Open'
                              ? 'bg-success-100 text-success-600'
                              : 'bg-warning-100 text-warning-600'
                          }`}
                        >
                          {drive.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Coordinator Activity Feed */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-text-primary">
              Department Logs
            </h3>
            <Clock className="w-4 h-4 text-text-muted" />
          </div>

          <div className="space-y-4">
            {activities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start space-x-3 text-xs border-b border-border-subtle/50 pb-3 last:border-0 last:pb-0">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium leading-tight">{act.text}</p>
                    <span className="text-[10px] text-text-muted mt-1 block">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
