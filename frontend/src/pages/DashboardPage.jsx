import React from 'react';
import { useAuth } from '../store/authStore';
import { LayoutDashboard, Users, Briefcase, GraduationCap, FileCheck, Award } from 'lucide-react';

export function DashboardPage() {
  const { user, role } = useAuth();
  const normalizedRole = role === 'officer' ? 'tpo' : role || 'student';

  return (
    <div className="space-y-6">
      {/* Welcome Header Banner */}
      <div className="bg-primary-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-700/70 border border-primary-500 text-accent-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>{normalizedRole === 'tpo' ? 'Super Admin Dashboard' : normalizedRole === 'coordinator' ? 'Department Coordinator Dashboard' : 'Student Portal'}</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-primary-100/80 text-sm mt-1">
            PlaceTrack Placement & Training Management System — RCPIT Shirpur.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <div className="px-4 py-2 bg-primary-700/80 rounded-xl border border-primary-500 text-right">
            <span className="block text-[10px] text-primary-100/70 font-semibold uppercase tracking-wider">Academic Year</span>
            <span className="font-heading font-bold text-sm text-accent-500">2025 – 2026</span>
          </div>
        </div>
      </div>

      {/* Role-Aware Metric Summary Cards */}
      {normalizedRole === 'tpo' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Drives</span>
              <Briefcase className="w-5 h-5 text-primary-500" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">24</div>
            <p className="text-[11px] text-text-muted mt-1">Active campus drives</p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Registered Students</span>
              <GraduationCap className="w-5 h-5 text-accent-500" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">540</div>
            <p className="text-[11px] text-text-muted mt-1">Across all departments</p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total Selections</span>
              <Award className="w-5 h-5 text-success-600" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">185</div>
            <p className="text-[11px] text-text-muted mt-1">Students placed</p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Coordinators</span>
              <Users className="w-5 h-5 text-info-600" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">7</div>
            <p className="text-[11px] text-text-muted mt-1">Department leads</p>
          </div>
        </div>
      )}

      {normalizedRole === 'coordinator' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Dept. Students</span>
              <GraduationCap className="w-5 h-5 text-primary-500" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">120</div>
            <p className="text-[11px] text-text-muted mt-1">Computer Department</p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Eligible Drives</span>
              <Briefcase className="w-5 h-5 text-accent-500" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">18</div>
            <p className="text-[11px] text-text-muted mt-1">Open for applications</p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Pending Shortlists</span>
              <FileCheck className="w-5 h-5 text-warning-600" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">42</div>
            <p className="text-[11px] text-text-muted mt-1">Applications to review</p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Placed Students</span>
              <Award className="w-5 h-5 text-success-600" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">48</div>
            <p className="text-[11px] text-text-muted mt-1">40% Placement rate</p>
          </div>
        </div>
      )}

      {normalizedRole === 'student' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Cumulative CGPA</span>
              <Award className="w-5 h-5 text-accent-500" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">8.75</div>
            <p className="text-[11px] text-text-muted mt-1">Calculated from 6 semesters</p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Active Backlogs</span>
              <FileCheck className="w-5 h-5 text-success-600" />
            </div>
            <div className="font-heading font-bold text-2xl text-success-600">0</div>
            <p className="text-[11px] text-text-muted mt-1">No uncleared backlogs</p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">My Applications</span>
              <FileCheck className="w-5 h-5 text-primary-500" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">5</div>
            <p className="text-[11px] text-text-muted mt-1">Applied drives</p>
          </div>

          <div className="p-5 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Eligible Drives</span>
              <Briefcase className="w-5 h-5 text-info-600" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">12</div>
            <p className="text-[11px] text-text-muted mt-1">Ready for application</p>
          </div>
        </div>
      )}

      {/* Main Content Placeholder Section */}
      <div className="bg-bg-surface p-8 border border-border-subtle rounded-xl shadow-2xs">
        <h2 className="font-heading text-lg font-semibold text-text-primary mb-2">
          Dashboard Summary & Overview
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Welcome to the unified PlaceTrack dashboard shell. Live stats, activity streams, drive timelines, and data management modules will load dynamically based on your role context.
        </p>
      </div>
    </div>
  );
}
