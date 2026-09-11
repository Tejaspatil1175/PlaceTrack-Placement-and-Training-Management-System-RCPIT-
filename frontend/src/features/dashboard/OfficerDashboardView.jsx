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
  Building2,
  Calendar,
  Bell,
  Clock,
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

  // Fallback / Mock analytical data for TPO
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
    { id: 5, company: 'Persistent Systems', ctc: '8.5 LPA', deadline: '2026-10-15', status: 'Upcoming', applicants: 0 },
  ];

  const activities = data?.recentActivities || [
    { id: 1, text: 'TCS Ninja drive eligibility filter generated for 180 students', time: '10 mins ago', icon: Briefcase },
    { id: 2, text: 'Computer Dept. Coordinator updated 14 interview selections', time: '1 hour ago', icon: FileCheck },
    { id: 3, text: 'Bulk Excel import completed for 60 EnTC 3rd year students', time: '3 hours ago', icon: Users },
    { id: 4, text: 'Mock Aptitude Session announced by T&P Cell for Sem 7', time: 'Yesterday', icon: Bell },
  ];

  const departments = data?.departmentSnapshots || [
    { name: 'Computer Engineering', total: 140, placed: 82, rate: '74%' },
    { name: 'Information Technology', total: 110, placed: 64, rate: '71%' },
    { name: 'AI & Data Science', total: 90, placed: 50, rate: '69%' },
    { name: 'Electronics & Telecommunication', total: 100, placed: 42, rate: '56%' },
    { name: 'Mechanical Engineering', total: 60, placed: 22, rate: '44%' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          subtitle="Registered across all branches"
          icon={Users}
          iconColor="text-primary-700"
          iconBg="bg-primary-100"
        />
        <StatCard
          label="Active Drives"
          value={stats.activeDrives}
          subtitle="Open for campus recruitment"
          icon={Briefcase}
          iconColor="text-accent-500"
          iconBg="bg-accent-500/10"
        />
        <StatCard
          label="Total Applications"
          value={stats.totalApplications}
          subtitle="Submitted this academic year"
          icon={FileCheck}
          iconColor="text-info-600"
          iconBg="bg-info-100"
        />
        <StatCard
          label="Students Placed"
          value={stats.studentsPlaced}
          delta={stats.placementRateDelta}
          deltaType="increase"
          subtitle={`${stats.placementRate}% overall placement rate`}
          icon={Award}
          iconColor="text-success-600"
          iconBg="bg-success-100"
        />
      </div>

      {/* 2. Charts Row (Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise Placement Bar Chart */}
        <div className="bg-bg-surface p-5 border border-border-subtle rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-sm font-semibold text-text-primary">
                Branch-wise Placement %
              </h3>
              <p className="text-[11px] text-text-muted">Current batch placement percentage by branch</p>
            </div>
            <span className="text-[10px] font-semibold text-accent-500 bg-accent-500/10 px-2 py-0.5 rounded uppercase">
              Live Batch
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EB" vertical={false} />
                <XAxis dataKey="branch" tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E6EB', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'Placement Rate']}
                />
                <Bar dataKey="rate" fill="#1C3F63" radius={[4, 4, 0, 0]} name="Placement Rate (%)" />
                <Bar dataKey="target" fill="#B8862E" radius={[4, 4, 0, 0]} opacity={0.3} name="Target (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Placement Trend Line Chart */}
        <div className="bg-bg-surface p-5 border border-border-subtle rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-sm font-semibold text-text-primary">
                Placement Trend (5-Year Growth)
              </h3>
              <p className="text-[11px] text-text-muted">Historical comparison of student selections</p>
            </div>
            <span className="text-[10px] font-semibold text-success-600 bg-success-100 px-2 py-0.5 rounded uppercase">
              5-Year Trajectory
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
                <Line type="monotone" dataKey="placed" stroke="#1C3F63" strokeWidth={2.5} dot={{ r: 4, fill: '#B8862E' }} name="Students Placed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Upcoming Drives Table + Right-Rail Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Drives (2 cols) */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  Upcoming & Active Drives
                </h3>
                <p className="text-[11px] text-text-muted">Top placement drives currently active for RCPIT students</p>
              </div>
              <Link
                to="/drives"
                className="text-xs text-primary-500 hover:text-primary-700 font-semibold inline-flex items-center space-x-1"
              >
                <span>View All Drives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingDrives.length === 0 ? (
              <EmptyState title="No active drives" description="There are currently no active placement drives scheduled." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-subtle text-text-muted font-semibold uppercase tracking-wider">
                      <th className="pb-2.5 font-semibold">Company Name</th>
                      <th className="pb-2.5 font-semibold">Package</th>
                      <th className="pb-2.5 font-semibold">Deadline</th>
                      <th className="pb-2.5 font-semibold">Applicants</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-text-primary">
                    {upcomingDrives.slice(0, 5).map((drive) => (
                      <tr key={drive.id} className="hover:bg-bg-base transition-colors">
                        <td className="py-3 font-semibold text-primary-900">{drive.company}</td>
                        <td className="py-3 font-mono font-medium text-accent-500">{drive.ctc}</td>
                        <td className="py-3 text-text-secondary">{drive.deadline}</td>
                        <td className="py-3 text-text-secondary font-medium">{drive.applicants}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              drive.status === 'Open'
                                ? 'bg-success-100 text-success-600'
                                : drive.status === 'Shortlisting'
                                ? 'bg-warning-100 text-warning-600'
                                : 'bg-info-100 text-info-600'
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
        </div>

        {/* Right-Rail Recent Activity Feed */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-text-primary">
              Recent System Activity
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

      {/* 4. Department Snapshot Card Grid */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-sm font-semibold text-text-primary">
              Department Placement Snapshot
            </h3>
            <p className="text-[11px] text-text-muted">Real-time department breakdown across engineering branches</p>
          </div>
          <Link to="/departments" className="text-xs text-primary-500 font-semibold hover:underline">
            Manage Departments
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {departments.map((dept) => (
            <div key={dept.name} className="p-3.5 bg-bg-base border border-border-subtle rounded-lg text-center">
              <span className="block text-xs font-bold text-text-primary truncate">{dept.name}</span>
              <span className="block font-heading font-bold text-lg text-primary-700 mt-1">{dept.rate}</span>
              <span className="block text-[10px] text-text-muted mt-0.5">{dept.placed} of {dept.total} placed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
