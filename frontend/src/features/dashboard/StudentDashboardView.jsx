import React from 'react';
import { Link } from 'react-router-dom';
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
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

export function StudentDashboardView({ data, isLoading, user }) {
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
      {/* Student Welcome Hero Header */}
      <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F5F0E6] border border-zinc-700 text-zinc-900 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-800" />
              <span>Student Self-Service Portal</span>
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-zinc-900">
              Welcome back, {studentName}!
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 font-bold mt-1">
              <span className="font-mono bg-[#FAF8F5] border border-zinc-700 px-2.5 py-0.5 rounded-md text-zinc-900">PRN: {prn}</span>
              <span>•</span>
              <span>{branch}</span>
              <span>•</span>
              <span className="text-zinc-900">Semester {semester}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/profile"
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-heading font-bold text-xs rounded-xl shadow-xs inline-flex items-center space-x-2 transition-all border border-zinc-800"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>
            <Link
              to="/academics"
              className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F5F0E6] border border-zinc-700 text-zinc-900 font-heading font-bold text-xs rounded-xl inline-flex items-center space-x-2 transition-all"
            >
              <Award className="w-4 h-4 text-amber-700" />
              <span>Academics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Readiness Nudge Banner */}
      {profileCompleteness < 100 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-pop">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-400 text-amber-900 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                Profile Readiness Status: {profileCompleteness}%
              </h4>
              <p className="text-amber-800 text-xs font-semibold mt-0.5">
                Complete your skills tag list and resume PDF link to increase drive recruiter eligibility.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white font-heading font-bold text-xs rounded-xl text-center shrink-0 transition-colors"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* 3 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Cumulative CGPA</span>
          <span className="font-heading font-extrabold text-3xl text-amber-800 block mt-1">{stats.cgpa}</span>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Credit-weighted aggregate</span>
        </div>

        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Active Backlogs</span>
          <span className={`font-heading font-extrabold text-3xl block mt-1 ${stats.activeBacklogs === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {stats.activeBacklogs} Backlogs
          </span>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Verified university record</span>
        </div>

        <div className="p-5 bg-white border border-zinc-700 rounded-2xl shadow-sm card-pop">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">Eligible Drives</span>
          <span className="font-heading font-extrabold text-3xl text-zinc-900 block mt-1">{stats.eligibleDrivesCount} Drives</span>
          <span className="text-[10px] font-bold text-zinc-500 mt-1 block">Matching your criteria</span>
        </div>
      </div>

      {/* Main Content Grid: Drives Left (8 cols) + Alerts Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Top Eligible Drives */}
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-300">
              <div>
                <h3 className="font-heading text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                  Top Eligible Placement Drives
                </h3>
                <p className="text-zinc-600 text-xs mt-0.5 font-medium">Campus recruiting drives matching your CGPA and branch</p>
              </div>
              <Link
                to="/drives"
                className="text-xs font-bold text-zinc-900 hover:underline inline-flex items-center space-x-1"
              >
                <span>View All Drives</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {eligibleDrives.map((d) => (
                <div key={d.id} className="p-4 bg-[#FAF8F5] border border-zinc-700 rounded-xl hover:border-zinc-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-heading text-sm font-extrabold text-zinc-900">{d.company}</span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-bold">
                        Eligible
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 font-bold mt-0.5">{d.role} • Min CGPA: {d.minCgpa}</p>
                    <span className="text-[10px] text-zinc-500 font-semibold block mt-1">Application Deadline: {d.deadline}</span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="font-mono font-extrabold text-amber-900 text-sm">{d.ctc}</span>
                    <Link
                      to={`/drives/${d.id}`}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-colors border border-zinc-800"
                    >
                      View & Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Direct Alerts & Events (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications Feed */}
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-300">
              <h3 className="font-heading text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                Direct Alerts & Notices
              </h3>
              <Link to="/notifications" className="text-[11px] font-bold text-zinc-900 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-[#FAF8F5] border border-zinc-700 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                    <span className="font-heading text-xs font-bold text-zinc-900">{n.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-700 mt-1 leading-relaxed font-medium">{n.text}</p>
                  <span className="text-[10px] text-zinc-500 font-bold mt-1.5 block">{n.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Training Events */}
          <div className="bg-white border-2 border-zinc-800 rounded-2xl p-6 shadow-sm card-pop space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-300">
              <h3 className="font-heading text-xs font-extrabold text-zinc-900 uppercase tracking-wider">
                Training Workshops
              </h3>
              <Link to="/events" className="text-[11px] font-bold text-zinc-900 hover:underline">
                Calendar
              </Link>
            </div>

            <div className="space-y-3">
              {events.map((e) => (
                <div key={e.id} className="p-3 bg-[#FAF8F5] border border-zinc-700 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    <span className="font-heading text-xs font-bold text-zinc-900">{e.title}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-600 font-bold">
                    <span>{e.date} • {e.time}</span>
                    <span className="text-zinc-900">{e.location}</span>
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
