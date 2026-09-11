import React from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/ui/StatCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Award,
  AlertCircle,
  FileCheck,
  Briefcase,
  ArrowRight,
  Bell,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function StudentDashboardView({ data, isLoading, user }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  // Student specific parameters from session / API
  const studentName = user?.name || 'Rahul Sharma';
  const prn = user?.prn || '2021012345';
  const branch = user?.branch || 'Computer Engineering';
  const semester = user?.currentSemester || 7;

  // Fallback / Mock Student analytical state
  const stats = data?.stats || {
    cgpa: '8.75',
    activeBacklogs: 0,
    applicationsCount: 5,
    eligibleDrivesCount: 12,
  };

  // Profile Completeness calculation
  const hasResume = Boolean(user?.resumeUrl || true);
  const skillsCount = user?.skills?.length || 4;
  const profileCompleteness = Math.min(100, (hasResume ? 50 : 0) + Math.min(50, skillsCount * 12.5));

  const eligibleDrives = data?.eligibleDrives || [
    { id: 1, company: 'Tata Consultancy Services (TCS)', role: 'Software Developer', ctc: '7.0 LPA', minCgpa: 6.5, deadline: '2026-09-25' },
    { id: 2, company: 'Infosys Limited', role: 'System Engineer', ctc: '6.5 LPA', minCgpa: 6.0, deadline: '2026-09-28' },
    { id: 3, company: 'Persistent Systems', role: 'Software Engineer', ctc: '8.5 LPA', minCgpa: 7.5, deadline: '2026-10-15' },
  ];

  const notifications = data?.notifications || [
    { id: 1, title: 'TCS Ninja Shortlist Released', text: 'You have been shortlisted for Round 1 Technical Interview.', time: '2 hours ago', type: 'success' },
    { id: 2, title: 'Resume Verification Notice', text: 'Please ensure your uploaded Cloudinary resume link is active before Sept 20.', time: '1 day ago', type: 'info' },
    { id: 3, title: 'Aptitude Mock Test Schedule', text: 'College-wide online mock test begins this Saturday at 10:00 AM.', time: '2 days ago', type: 'warning' },
  ];

  const events = data?.events || [
    { id: 1, title: 'System Design & Data Structures Workshop', date: '22 Sept 2026', time: '02:00 PM', location: 'Seminar Hall B' },
    { id: 2, title: 'Mock Technical Interview Session', date: '26 Sept 2026', time: '10:00 AM', location: 'T&P Lab 3' },
    { id: 3, title: 'Soft Skills & Group Discussion Masterclass', date: '01 Oct 2026', time: '11:30 AM', location: 'Main Auditorium' },
  ];

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Banner */}
      <div className="bg-primary-900 text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-700 border border-primary-500 text-accent-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Student Placement Portal</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Welcome, {studentName}!
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-primary-100/90 mt-1">
            <span className="font-mono bg-primary-700/80 px-2 py-0.5 rounded text-accent-500">PRN: {prn}</span>
            <span>•</span>
            <span>{branch}</span>
            <span>•</span>
            <span className="font-semibold text-white">Semester {semester}</span>
          </div>
        </div>

        <Link
          to="/profile"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-500/90 text-white font-heading font-medium text-xs rounded-lg shadow-sm transition-all"
        >
          <User className="w-4 h-4" />
          <span>View Profile</span>
        </Link>
      </div>

      {/* Profile Completeness Nudge Banner */}
      {profileCompleteness < 100 && (
        <div className="p-4 bg-warning-100/60 border border-warning-600/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-warning-600/10 text-warning-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading text-xs font-bold text-warning-600 uppercase tracking-wider">
                Profile Completeness: {profileCompleteness}%
              </h4>
              <p className="text-text-secondary text-xs mt-0.5">
                Complete your technical skills and resume link to increase drive eligibility visibility.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="px-3.5 py-1.5 bg-warning-600 text-white font-heading font-semibold text-xs rounded-lg hover:bg-warning-600/90 text-center shrink-0 transition-colors"
          >
            Update Profile
          </Link>
        </div>
      )}

      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cumulative CGPA"
          value={stats.cgpa}
          subtitle="Credit-weighted aggregate"
          icon={Award}
          iconColor="text-accent-500"
          iconBg="bg-accent-500/10"
        />
        <StatCard
          label="Active Backlogs"
          value={stats.activeBacklogs}
          subtitle={stats.activeBacklogs === 0 ? 'No uncleared backlogs' : 'Uncleared backlog subjects'}
          icon={AlertCircle}
          iconColor={stats.activeBacklogs === 0 ? 'text-success-600' : 'text-error-600'}
          iconBg={stats.activeBacklogs === 0 ? 'bg-success-100' : 'bg-error-100'}
        />
        <StatCard
          label="Applications in Progress"
          value={stats.applicationsCount}
          subtitle="Active drive submissions"
          icon={FileCheck}
          iconColor="text-primary-700"
          iconBg="bg-primary-100"
        />
        <StatCard
          label="Eligible Drives"
          value={stats.eligibleDrivesCount}
          subtitle="Matching your CGPA & branch"
          icon={Briefcase}
          iconColor="text-info-600"
          iconBg="bg-info-100"
        />
      </div>

      {/* 2. Top 3 Previews Grid: Eligible Drives, Notifications, Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Eligible Drives Preview */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  Eligible Drives Preview
                </h3>
                <p className="text-[11px] text-text-muted">Top drives open for your criteria</p>
              </div>
              <Link to="/drives" className="text-xs text-primary-500 font-semibold hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {eligibleDrives.length === 0 ? (
              <EmptyState title="No eligible drives" description="No active drives currently match your criteria." />
            ) : (
              <div className="space-y-3">
                {eligibleDrives.map((d) => (
                  <div key={d.id} className="p-3 bg-bg-base border border-border-subtle rounded-lg hover:border-primary-500 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-xs font-bold text-primary-900">{d.company}</span>
                      <span className="text-xs font-mono font-semibold text-accent-500">{d.ctc}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5">{d.role}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle/60 text-[10px] text-text-muted">
                      <span>Min CGPA: {d.minCgpa}</span>
                      <span>Deadline: {d.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top 3 Notifications Preview */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  Recent Notifications
                </h3>
                <p className="text-[11px] text-text-muted">Direct announcements & interview calls</p>
              </div>
              <Link to="/notifications" className="text-xs text-primary-500 font-semibold hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-bg-base border border-border-subtle rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-3.5 h-3.5 text-accent-500 shrink-0" />
                    <span className="font-heading text-xs font-bold text-text-primary">{n.title}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1 leading-snug">{n.text}</p>
                  <span className="text-[10px] text-text-muted mt-1.5 block">{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Upcoming Events Preview */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-text-primary">
                  Upcoming Events
                </h3>
                <p className="text-[11px] text-text-muted">Training sessions & workshops</p>
              </div>
              <Link to="/events" className="text-xs text-primary-500 font-semibold hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {events.map((e) => (
                <div key={e.id} className="p-3 bg-bg-base border border-border-subtle rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                    <span className="font-heading text-xs font-bold text-text-primary">{e.title}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted font-medium">
                    <span>{e.date} • {e.time}</span>
                    <span className="text-primary-700">{e.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
