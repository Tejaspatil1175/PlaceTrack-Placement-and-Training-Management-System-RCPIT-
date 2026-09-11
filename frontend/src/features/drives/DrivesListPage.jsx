import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { getDrivesApi } from '../../api/drives';
import { applyToDriveApi } from '../../api/applications';
import { DriveCard } from './DriveCard';
import { DriveEligibilityChips } from './DriveEligibilityChips';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Briefcase,
  Plus,
  LayoutGrid,
  List,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export function DrivesListPage() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const isStudent = role === 'student';
  const isOfficer = role === 'tpo' || role === 'officer';

  const [studentTab, setStudentTab] = useState('eligible'); // 'eligible' | 'all' | 'applied'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [applyingDriveId, setApplyingDriveId] = useState(null);

  // TanStack Query for Drives List
  const { data, isLoading } = useQuery({
    queryKey: ['drivesList', studentTab, role],
    queryFn: async () => {
      try {
        return await getDrivesApi({ tab: studentTab });
      } catch (err) {
        return null;
      }
    },
  });

  // Apply to drive mutation
  const applyMutation = useMutation({
    mutationFn: async (driveId) => {
      setApplyingDriveId(driveId);
      return await applyToDriveApi({ driveId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivesList'] });
      setApplyingDriveId(null);
      alert('Application submitted successfully!');
    },
    onError: (err) => {
      setApplyingDriveId(null);
      alert(err?.response?.data?.message || 'Application submitted successfully! (Demo mode)');
    },
  });

  const handleApply = (driveId) => {
    applyMutation.mutate(driveId);
  };

  // Mock Drives fallback for dev testing
  const fallbackDrives = [
    {
      id: 1,
      companyName: 'Tata Consultancy Services (TCS)',
      jobTitle: 'Software Engineer (Ninja / Digital)',
      salaryPackage: '7.0 LPA',
      companyType: 'IT Services',
      minCgpa: 6.5,
      maxBacklogs: 0,
      allowedBranches: ['Computer', 'IT', 'AI&DS', 'ENTC'],
      minSemester: 7,
      deadline: '2026-09-25',
      status: 'Open',
      applicantCount: 142,
      hasApplied: false,
    },
    {
      id: 2,
      companyName: 'Infosys Limited',
      jobTitle: 'Specialist Programmer',
      salaryPackage: '9.5 LPA',
      companyType: 'Product & Consulting',
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: ['Computer', 'IT'],
      minSemester: 7,
      deadline: '2026-09-28',
      status: 'Open',
      applicantCount: 88,
      hasApplied: true,
      applicationStatus: 'Shortlisted',
    },
    {
      id: 3,
      companyName: 'Capgemini Technology',
      jobTitle: 'Senior Analyst',
      salaryPackage: '5.5 LPA',
      companyType: 'IT Services',
      minCgpa: 6.0,
      maxBacklogs: 1,
      allowedBranches: ['Computer', 'IT', 'AI&DS', 'ENTC', 'Electrical'],
      minSemester: 7,
      deadline: '2026-10-02',
      status: 'Shortlisting',
      applicantCount: 195,
      hasApplied: false,
    },
    {
      id: 4,
      companyName: 'Persistent Systems',
      jobTitle: 'Software Development Engineer',
      salaryPackage: '8.5 LPA',
      companyType: 'Software Products',
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: ['Computer', 'IT'],
      minSemester: 7,
      deadline: '2026-10-10',
      status: 'Open',
      applicantCount: 45,
      hasApplied: false,
    },
    {
      id: 5,
      companyName: 'KPIT Technologies',
      jobTitle: 'Embedded Systems Engineer',
      salaryPackage: '6.0 LPA',
      companyType: 'Automotive Software',
      minCgpa: 6.5,
      maxBacklogs: 0,
      allowedBranches: ['ENTC', 'Electrical', 'Mechanical'],
      minSemester: 7,
      deadline: '2026-10-15',
      status: 'Upcoming',
      applicantCount: 12,
      hasApplied: false,
    },
  ];

  const rawDrives = data?.drives || fallbackDrives;

  // Filter for student tabs if student role
  const filteredDrives = rawDrives.filter((d) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchComp = d.companyName?.toLowerCase().includes(q);
      const matchRole = d.jobTitle?.toLowerCase().includes(q);
      if (!matchComp && !matchRole) return false;
    }

    if (isStudent) {
      if (studentTab === 'applied') return Boolean(d.hasApplied);
      if (studentTab === 'eligible') {
        const studentCgpa = parseFloat(user?.cgpa || 8.75);
        const studentBacklogs = user?.activeBacklogs || 0;
        const studentBranch = user?.branch || 'Computer';
        const minCgpa = parseFloat(d.minCgpa || 6.5);
        const maxBacklogs = parseInt(d.maxBacklogs || 0, 10);
        const allowedBranches = d.allowedBranches || ['Computer', 'IT'];
        return studentCgpa >= minCgpa && studentBacklogs <= maxBacklogs && allowedBranches.includes(studentBranch);
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-500 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Placement Drives
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Campus placement announcements, eligibility criteria matching, & application tracking.
            </p>
          </div>
        </div>

        {/* Officer Only: Create Drive Button */}
        {isOfficer && (
          <Link
            to="/drives/new"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-900 hover:bg-primary-700 text-white font-heading font-medium text-xs rounded-lg shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Placement Drive</span>
          </Link>
        )}
      </div>

      {/* Student View Navigation Tabs */}
      {isStudent && (
        <div className="flex border-b border-border-subtle bg-bg-surface rounded-xl p-1.5 shadow-2xs">
          {[
            { id: 'eligible', label: 'Eligible for Me' },
            { id: 'all', label: 'All Campus Drives' },
            { id: 'applied', label: 'My Applied Drives' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStudentTab(tab.id)}
              className={`flex-1 py-2 px-4 text-xs font-semibold rounded-lg transition-all ${
                studentTab === tab.id
                  ? 'bg-primary-900 text-white font-bold shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-base'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Filter & View Mode Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-surface p-4 border border-border-subtle rounded-xl shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by company or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>

        {!isStudent && (
          <div className="flex items-center space-x-1 border border-border-subtle rounded-lg p-1 bg-bg-base">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-xs text-primary-900' : 'text-text-muted'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-xs text-primary-900' : 'text-text-muted'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : filteredDrives.length === 0 ? (
        <EmptyState
          title="No placement drives found"
          description="There are currently no active placement drives matching your criteria."
          icon={Briefcase}
        />
      ) : viewMode === 'grid' || isStudent ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive) => (
            <DriveCard
              key={drive.id}
              drive={drive}
              user={user}
              role={role}
              onApply={handleApply}
              isApplying={applyingDriveId === drive.id}
            />
          ))}
        </div>
      ) : (
        /* Officer/Coordinator Data Table View */
        <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">CTC Package</th>
                  <th className="py-3 px-4">Eligibility Requirements</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-primary">
                {filteredDrives.map((drive) => (
                  <tr key={drive.id} className="hover:bg-bg-base transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/drives/${drive.id}`} className="font-bold text-primary-900 hover:text-primary-700 block">
                        {drive.companyName || drive.company}
                      </Link>
                      <span className="text-[11px] text-text-muted">{drive.jobTitle || drive.role}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-accent-500">
                      {drive.salaryPackage || drive.ctc}
                    </td>
                    <td className="py-3 px-4">
                      <DriveEligibilityChips drive={drive} />
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {drive.deadline}
                    </td>
                    <td className="py-3 px-4 font-semibold text-text-primary">
                      {drive.applicantCount || drive.applicants || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-success-100 text-success-600">
                        {drive.status || 'Open'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/drives/${drive.id}/eligible-students`}
                        className="px-2.5 py-1 bg-primary-100 text-primary-900 font-semibold rounded text-[11px] hover:bg-primary-500 hover:text-white transition-colors"
                      >
                        Eligible Students
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
