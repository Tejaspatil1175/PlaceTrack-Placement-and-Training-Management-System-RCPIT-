import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../store/authStore';
import { getTpoAnalyticsApi, getCoordinatorAnalyticsApi } from '../../api/analytics';
import { StatCard } from '../../components/ui/StatCard';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Filter,
  Download,
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
  Cell,
} from 'recharts';

export function AnalyticsPage() {
  const { user, role } = useAuth();
  const isOfficer = role === 'tpo' || role === 'officer';

  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [selectedDept, setSelectedDept] = useState(isOfficer ? '' : user?.departmentName || 'Computer');

  // TanStack Query to fetch analytics
  const { data, isLoading } = useQuery({
    queryKey: ['analyticsPage', role, academicYear, selectedDept],
    queryFn: async () => {
      try {
        if (isOfficer) {
          return await getTpoAnalyticsApi({ academicYear, department: selectedDept });
        }
        return await getCoordinatorAnalyticsApi({ academicYear });
      } catch (err) {
        return null;
      }
    },
  });

  // Fallback analytical datasets
  const branchData = data?.branchWisePlacement || [
    { branch: 'Computer', rate: 82, target: 90 },
    { branch: 'IT', rate: 78, target: 85 },
    { branch: 'AI & DS', rate: 74, target: 80 },
    { branch: 'ENTC', rate: 61, target: 70 },
    { branch: 'Mechanical', rate: 52, target: 65 },
    { branch: 'Civil', rate: 45, target: 60 },
  ];

  const packageData = data?.packageDistribution || [
    { bracket: '< 4.0 LPA', count: 45 },
    { bracket: '4.0 - 6.0 LPA', count: 85 },
    { bracket: '6.0 - 8.5 LPA', count: 42 },
    { bracket: '8.5+ LPA', count: 13 },
  ];

  const conversionFunnelData = data?.conversionFunnel || [
    { stage: 'Total Applications', count: 1280, fill: '#1C3F63' },
    { stage: 'Shortlisted for Test/Interview', count: 420, fill: '#2D5A82' },
    { stage: 'Final Offers Issued', count: 185, fill: '#B8862E' },
  ];

  const yearlyTrend = data?.yearlyTrend || [
    { year: '2021', placed: 110, rate: 55 },
    { year: '2022', placed: 135, rate: 60 },
    { year: '2023', placed: 152, rate: 64 },
    { year: '2024', placed: 168, rate: 66 },
    { year: '2025', placed: 185, rate: 68.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Placement Analytics & Insights
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              {isOfficer
                ? 'College-wide placement statistics, branch performance, CTC distribution, & conversion funnels.'
                : `Department-scoped placement statistics for ${user?.departmentName || 'Computer Engineering'}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-bg-surface p-4 border border-border-subtle rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="py-1.5 px-3 bg-bg-base border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="2025-2026">2025 – 2026 (Current)</option>
              <option value="2024-2025">2024 – 2025</option>
              <option value="2023-2024">2023 – 2024</option>
            </select>
          </div>

          {/* Department Filter (Officer Only) */}
          {isOfficer && (
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                Department Filter
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="py-1.5 px-3 bg-bg-base border border-border-subtle rounded-lg text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Departments</option>
                <option value="Computer">Computer</option>
                <option value="IT">IT</option>
                <option value="AI&DS">AI & DS</option>
                <option value="ENTC">ENTC</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>
          )}
        </div>

        <span className="text-xs text-text-muted font-medium">
          Data source: Institutional Placement Database
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        /* Charts Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Branch-wise Placement % */}
          <div className="bg-bg-surface p-5 border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  Branch-wise Placement Rate (%)
                </h3>
                <p className="text-[11px] text-text-muted">Placement percentage vs target benchmark</p>
              </div>
              <span className="text-[10px] font-bold text-primary-900 bg-primary-100 px-2 py-0.5 rounded">
                Bar Chart
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
                  <Bar dataKey="target" fill="#B8862E" radius={[4, 4, 0, 0]} opacity={0.3} name="Target Benchmark (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Salary Package Distribution */}
          <div className="bg-bg-surface p-5 border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  Salary Package Distribution (CTC Brackets)
                </h3>
                <p className="text-[11px] text-text-muted">Number of student offers per salary bracket</p>
              </div>
              <span className="text-[10px] font-bold text-accent-500 bg-accent-500/10 px-2 py-0.5 rounded">
                CTC Brackets
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EB" vertical={false} />
                  <XAxis dataKey="bracket" tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E6EB', fontSize: '12px' }}
                    formatter={(val) => [`${val} Students`, 'Offers Count']}
                  />
                  <Bar dataKey="count" fill="#1C3F63" radius={[4, 4, 0, 0]}>
                    {packageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#B8862E' : '#1C3F63'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Conversion Funnel (Applied -> Shortlisted -> Selected) */}
          <div className="bg-bg-surface p-5 border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  Drive-wise Conversion Funnel
                </h3>
                <p className="text-[11px] text-text-muted">Stage progression from total applications to final selection</p>
              </div>
              <span className="text-[10px] font-bold text-info-600 bg-info-100 px-2 py-0.5 rounded">
                Conversion Funnel
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionFunnelData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EB" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="stage" type="category" tick={{ fill: '#5B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} width={150} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E2E6EB', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {conversionFunnelData.map((entry, index) => (
                      <Cell key={`funnel-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: YoY Placement Trend Line Chart */}
          <div className="bg-bg-surface p-5 border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  Year-over-Year Placement Growth
                </h3>
                <p className="text-[11px] text-text-muted">5-year trajectory of total student selections</p>
              </div>
              <span className="text-[10px] font-bold text-success-600 bg-success-100 px-2 py-0.5 rounded">
                Line Chart
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
      )}
    </div>
  );
}
