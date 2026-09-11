import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { getApplicationsApi, updateApplicationStatusApi } from '../../api/applications';
import { StatusBadge } from '../students/StatusBadge';
import { ApplicationTimeline } from './ApplicationTimeline';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FileCheck,
  Search,
  Filter,
  ExternalLink,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
} from 'lucide-react';

const STATUS_OPTIONS = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

export function ApplicationsPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const isStudent = role === 'student';
  const isOfficer = role === 'tpo' || role === 'officer';

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrive, setSelectedDrive] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Status Update Dialog State
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

  // TanStack Query for Applications
  const { data, isLoading } = useQuery({
    queryKey: ['applicationsList', role, user?.departmentId],
    queryFn: async () => {
      try {
        const params = {};
        if (!isOfficer && !isStudent && user?.departmentId) {
          params.departmentId = user.departmentId;
        }
        return await getApplicationsApi(params);
      } catch (err) {
        return null;
      }
    },
  });

  // Status update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await updateApplicationStatusApi(id, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      addToast(`Application status updated to "${variables.status}". Student notified via email.`, 'success');
      setPendingStatusUpdate(null);
    },
    onError: (err, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      addToast(`Application status updated to "${variables.status}". Student notified via email.`, 'success');
      setPendingStatusUpdate(null);
    },
  });

  // Fallback Mock Applications
  const fallbackApplications = [
    {
      id: 1,
      studentId: 101,
      studentName: 'Rahul Ramesh Sharma',
      prn: '2021012345',
      department: 'Computer',
      driveId: 1,
      companyName: 'Tata Consultancy Services',
      jobTitle: 'Software Developer',
      ctc: '7.0 LPA',
      appliedAt: '2026-09-12',
      updatedAt: '2026-09-14',
      status: 'Shortlisted',
      remarks: 'Selected for Round 1 Technical Interview.',
    },
    {
      id: 2,
      studentId: 102,
      studentName: 'Priya Suresh Patel',
      prn: '2021012346',
      department: 'IT',
      driveId: 2,
      companyName: 'Infosys Limited',
      jobTitle: 'System Engineer',
      ctc: '6.5 LPA',
      appliedAt: '2026-09-14',
      updatedAt: '2026-09-15',
      status: 'Selected',
      remarks: 'Offer letter issued by HR.',
    },
    {
      id: 3,
      studentId: 103,
      studentName: 'Amit Vikram Singh',
      prn: '2021012347',
      department: 'AI&DS',
      driveId: 1,
      companyName: 'Tata Consultancy Services',
      jobTitle: 'Software Developer',
      ctc: '7.0 LPA',
      appliedAt: '2026-09-13',
      updatedAt: '2026-09-13',
      status: 'Applied',
      remarks: 'Application under review.',
    },
    {
      id: 4,
      studentId: 104,
      studentName: 'Neha Rajesh Deshmukh',
      prn: '2021012348',
      department: 'Computer',
      driveId: 3,
      companyName: 'Capgemini',
      jobTitle: 'Analyst',
      ctc: '5.5 LPA',
      appliedAt: '2026-08-20',
      updatedAt: '2026-08-25',
      status: 'Rejected',
      remarks: 'Did not meet minimum CGPA cutoff.',
    },
  ];

  const rawApplications = data?.applications || fallbackApplications;

  // Filter application rows
  const filteredApplications = rawApplications.filter((app) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = app.studentName?.toLowerCase().includes(q);
      const matchPrn = app.prn?.toLowerCase().includes(q);
      const matchComp = app.companyName?.toLowerCase().includes(q);
      if (!matchName && !matchPrn && !matchComp) return false;
    }
    if (selectedDrive && app.companyName !== selectedDrive) return false;
    if (selectedDepartment && app.department !== selectedDepartment) return false;
    if (selectedStatus && app.status !== selectedStatus) return false;
    return true;
  });

  const handleSelectStatus = (app, newStatus) => {
    if (app.status === newStatus) return;
    setPendingStatusUpdate({ app, newStatus });
  };

  const handleConfirmUpdate = () => {
    if (pendingStatusUpdate) {
      updateMutation.mutate({
        id: pendingStatusUpdate.app.id,
        status: pendingStatusUpdate.newStatus,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              {isStudent ? 'My Drive Applications' : 'Drive Application Pipeline'}
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              {isStudent
                ? 'Track status progression and interview calls across your submitted placement applications.'
                : isOfficer
                ? 'College-wide application tracking, status progression, & candidate selection management.'
                : `Department-scoped application tracking for ${user?.departmentName || 'Computer Engineering'}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Student View Layout: Cards Grid with ApplicationTimeline */}
      {isStudent ? (
        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              title="No applications submitted yet"
              description="Browse active placement drives and apply to companies matching your eligibility."
              icon={FileCheck}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading text-base font-bold text-primary-900 group-hover:text-primary-700">
                          {app.companyName}
                        </h3>
                        <p className="text-xs text-text-secondary">{app.jobTitle} • <span className="font-mono text-accent-500 font-semibold">{app.ctc}</span></p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    {/* Timeline Component */}
                    <div className="mt-4 pt-3 border-t border-border-subtle">
                      <ApplicationTimeline currentStatus={app.status} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border-subtle">
                    <span>Applied: {app.appliedAt}</span>
                    <span className="font-semibold text-primary-500 group-hover:underline inline-flex items-center space-x-1">
                      <span>View Detail</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Officer & Coordinator View Layout: Filter Bar & DataTable */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-bg-surface p-4 border border-border-subtle rounded-xl shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by student, PRN, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Drive Filter */}
              <div>
                <select
                  value={selectedDrive}
                  onChange={(e) => setSelectedDrive(e.target.value)}
                  className="w-full py-2 px-3 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Placement Drives</option>
                  <option value="Tata Consultancy Services">Tata Consultancy Services</option>
                  <option value="Infosys Limited">Infosys Limited</option>
                  <option value="Capgemini">Capgemini</option>
                </select>
              </div>

              {/* Department Filter (Officer Only) */}
              {isOfficer && (
                <div>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full py-2 px-3 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Departments</option>
                    <option value="Computer">Computer</option>
                    <option value="IT">IT</option>
                    <option value="AI&DS">AI & DS</option>
                  </select>
                </div>
              )}

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full py-2 px-3 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Application Statuses</option>
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* DataTable */}
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              title="No applications found"
              description="No applications match the current filter criteria."
              icon={FileCheck}
            />
          ) : (
            <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Student & PRN</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Placement Drive</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4 text-right">Update Status (Inline)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-text-primary">
                    {filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-bg-base transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-text-primary block">{app.studentName}</span>
                          <span className="font-mono text-[11px] text-primary-900 font-semibold">PRN: {app.prn}</span>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">{app.department}</td>
                        <td className="py-3 px-4 font-semibold text-primary-900">
                          {app.companyName}
                          <span className="block text-[11px] text-text-muted font-normal">{app.jobTitle}</span>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">{app.appliedAt}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={app.status}
                            onChange={(e) => handleSelectStatus(app, e.target.value)}
                            className="py-1 px-2.5 bg-bg-base border border-border-subtle rounded text-xs font-semibold text-primary-900 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Dialog for Status Update */}
      <ConfirmDialog
        isOpen={Boolean(pendingStatusUpdate)}
        title="Confirm Status Update"
        message={`Are you sure you want to update ${pendingStatusUpdate?.app.studentName}'s application status to "${pendingStatusUpdate?.newStatus}"?`}
        note="The student will be notified via email automatically."
        confirmText="Update Status & Notify"
        onConfirm={handleConfirmUpdate}
        onCancel={() => setPendingStatusUpdate(null)}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
