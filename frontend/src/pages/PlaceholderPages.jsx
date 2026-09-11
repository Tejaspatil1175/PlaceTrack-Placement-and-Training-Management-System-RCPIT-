import React from 'react';
import { useAuth } from '../store/authStore';
import {
  Building2,
  Users,
  UserPlus,
  GraduationCap,
  FileSpreadsheet,
  Briefcase,
  PlusCircle,
  FileCheck,
  Bell,
  Calendar,
  BarChart3,
  History,
  User,
  BookOpen,
  Settings as SettingsIcon,
} from 'lucide-react';

function PageShell({ title, description, icon: Icon, allowedRoles }) {
  const { role } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">{title}</h1>
            <p className="text-text-secondary text-sm mt-0.5">{description}</p>
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="text-xs font-mono px-3 py-1 bg-bg-base border border-border-subtle text-text-muted rounded-full">
            Role: {role || 'All'}
          </span>
        </div>
      </div>

      <div className="bg-bg-surface p-8 rounded-xl border border-border-subtle shadow-2xs text-center my-6">
        <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-3 font-heading font-semibold text-base">
          PlaceTrack
        </div>
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-1">
          {title} Module Placeholder
        </h3>
        <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
          This feature module will be fully populated with interactive tables, forms, and actions in subsequent steps.
        </p>
      </div>
    </div>
  );
}

export function DepartmentsPage() {
  return (
    <PageShell
      title="Departments Management"
      description="Manage academic departments and assign coordinators across RCPIT Shirpur."
      icon={Building2}
    />
  );
}

export function CoordinatorsPage() {
  return (
    <PageShell
      title="Department Coordinators"
      description="Overview of department placement coordinators and credentials."
      icon={Users}
    />
  );
}

export function CoordinatorCreatePage() {
  return (
    <PageShell
      title="Add New Department Coordinator"
      description="Provision a new coordinator account for a specific department."
      icon={UserPlus}
    />
  );
}

export function StudentsListPage() {
  const { role } = useAuth();
  const isTpo = role === 'tpo' || role === 'officer';
  return (
    <PageShell
      title={isTpo ? "College-wide Student Directory" : "Department Student Directory"}
      description={
        isTpo
          ? "Browse, filter, and manage student records across all engineering departments."
          : "Manage student profiles and academic records for your assigned department."
      }
      icon={GraduationCap}
    />
  );
}

export function StudentDetailPage() {
  return (
    <PageShell
      title="Student Profile & Academic Detail"
      description="Comprehensive view of student PRN, semester-wise SGPA history, CGPA, backlogs, and resume."
      icon={User}
    />
  );
}

export function StudentImportPage() {
  return (
    <PageShell
      title="Bulk Excel Student Import"
      description="Upload multi-semester Excel data sheet following the PlaceTrack Excel Data Contract."
      icon={FileSpreadsheet}
    />
  );
}

export function DrivesListPage() {
  return (
    <PageShell
      title="Placement Drives"
      description="Active, upcoming, and completed campus placement drives with eligibility criteria."
      icon={Briefcase}
    />
  );
}

export function DriveCreatePage() {
  return (
    <PageShell
      title="Create Placement Drive"
      description="Announce a new company recruiting drive and configure eligibility criteria."
      icon={PlusCircle}
    />
  );
}

export function DriveDetailPage() {
  return (
    <PageShell
      title="Placement Drive Detail"
      description="Detailed drive criteria, company package details, application pipeline, and schedules."
      icon={Briefcase}
    />
  );
}

export function DriveEligibleStudentsPage() {
  return (
    <PageShell
      title="Auto-Shortlisted Eligible Students"
      description="Real-time filtered list of students matching CGPA, active backlog, and semester rules."
      icon={Users}
    />
  );
}

export function ApplicationsPage() {
  const { role } = useAuth();
  const isStudent = role === 'student';
  return (
    <PageShell
      title={isStudent ? "My Drive Applications" : "Campus Drive Applications"}
      description={
        isStudent
          ? "Track status updates across your submitted placement drive applications."
          : "Review student applications across active placement drive selection rounds."
      }
      icon={FileCheck}
    />
  );
}

export function ApplicationDetailPage() {
  return (
    <PageShell
      title="Application Status Detail"
      description="Detailed timeline and status tracking for placement drive application."
      icon={FileCheck}
    />
  );
}

export function NotificationsPage() {
  return (
    <PageShell
      title="Announcements & Notifications"
      description="College-wide and department-specific announcements, interview calls, and results."
      icon={Bell}
    />
  );
}

export function NotificationCreatePage() {
  return (
    <PageShell
      title="Broadcast Announcement"
      description="Send targeted notifications and email announcements to students."
      icon={PlusCircle}
    />
  );
}

export function EventsPage() {
  return (
    <PageShell
      title="Training Sessions & Events"
      description="Schedule of industry workshops, mock interview sessions, and aptitude training."
      icon={Calendar}
    />
  );
}

export function EventCreatePage() {
  return (
    <PageShell
      title="Schedule Training Event"
      description="Create a new training program, workshop, or guest lecture announcement."
      icon={PlusCircle}
    />
  );
}

export function AnalyticsPage() {
  return (
    <PageShell
      title="Placement Analytics"
      description="Branch-wise placement statistics, package distributions, and historical trends."
      icon={BarChart3}
    />
  );
}

export function ReportsPage() {
  return (
    <PageShell
      title="Export Placement Reports"
      description="Generate downloadable PDF & Excel reports for college administration and NAAC audits."
      icon={FileSpreadsheet}
    />
  );
}

export function UploadLogsPage() {
  return (
    <PageShell
      title="Excel Ingestion Audit Logs"
      description="Audit trail of bulk data imports, row-level error reports, and validation summaries."
      icon={History}
    />
  );
}

export function StudentProfilePage() {
  return (
    <PageShell
      title="My Student Profile"
      description="Manage personal contact details, technical skills, certifications, and resume upload."
      icon={User}
    />
  );
}

export function StudentAcademicsPage() {
  return (
    <PageShell
      title="Academic History & Backlog Audit"
      description="Semester-wise SGPA, earned credits, new backlogs, and cleared backlog record."
      icon={BookOpen}
    />
  );
}

export function SettingsPage() {
  return (
    <PageShell
      title="Account & System Settings"
      description="Manage password, preferences, and account credentials."
      icon={SettingsIcon}
    />
  );
}
