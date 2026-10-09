import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEligibleStudentsApi, getDriveByIdApi } from '../../api/drives';
import { StatusBadge } from '../students/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Users,
  Download,
  ArrowLeft,
  Award,
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export function DriveEligibleStudentsPage() {
  const { id } = useParams();

  // Fetch Drive Details
  const { data: driveData } = useQuery({
    queryKey: ['driveDetail', id],
    queryFn: async () => {
      try {
        return await getDriveByIdApi(id);
      } catch (err) {
        return null;
      }
    },
  });

  // Fetch Auto-Matched Eligible Students
  const { data: eligibleData, isLoading } = useQuery({
    queryKey: ['eligibleStudents', id],
    queryFn: async () => {
      try {
        return await getEligibleStudentsApi(id);
      } catch (err) {
        return null;
      }
    },
  });

  const drive = driveData?.data || driveData || {};
  const rawStudents = eligibleData?.data?.eligibleStudents || eligibleData?.data || (Array.isArray(eligibleData) ? eligibleData : []);

  const students = (Array.isArray(rawStudents) ? rawStudents : []).map((s) => ({
    id: s.id,
    prn: s.prn || s.user?.prn || 'N/A',
    name: s.name || s.user?.name || 'N/A',
    branch: s.branch || s.department?.name || 'N/A',
    cgpa: s.cgpa ? parseFloat(s.cgpa).toFixed(2) : '0.00',
    backlogs: s.activeBacklogs ?? s.backlogs ?? 0,
    status: s.applicationStatus || s.status || 'Eligible',
  }));

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'PRN,Name,Branch,CGPA,ActiveBacklogs,ApplicationStatus\n' +
      students.map((s) => `${s.prn},${s.name},${s.branch},${s.cgpa},${s.backlogs},${s.status}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Eligible_Students_${(drive.companyName || 'Drive').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to={`/drives/${id}`}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-primary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Drive Details</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-primary-900 text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-700 border border-primary-500 text-accent-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Auto-Matched Eligibility Filter</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">
            {drive.companyName || 'Campus Drive'} — Eligible Students List
          </h1>
          <p className="text-primary-100/80 text-xs mt-0.5">
            Role: {drive.role || drive.jobTitle || 'All Roles'} • Package: <span className="font-mono text-accent-500">{drive.ctc ? `${drive.ctc} LPA` : drive.salaryPackage || 'Competitive'}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={students.length === 0}
          className="px-4 py-2.5 bg-accent-500 hover:bg-accent-500/90 disabled:opacity-50 text-white font-heading font-bold text-xs rounded-lg shadow-sm inline-flex items-center space-x-2 shrink-0 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export List to CSV</span>
        </button>
      </div>

      {/* Criteria Summary Card */}
      <div className="p-4 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-text-primary">Matched Rules:</span>
          <span className="px-2.5 py-1 bg-primary-100 text-primary-900 rounded font-semibold">Min CGPA ≥ {drive.minCgpa ?? 'N/A'}</span>
          <span className="px-2.5 py-1 bg-bg-base text-text-primary rounded border border-border-subtle">Max Backlogs: {drive.maxBacklogs ?? 0}</span>
          <span className="px-2.5 py-1 bg-bg-base text-text-primary rounded border border-border-subtle">
            Branches: {Array.isArray(drive.eligibleBranches || drive.allowedBranches) ? (drive.eligibleBranches || drive.allowedBranches).join(', ') : (drive.eligibleBranches || drive.allowedBranches || 'All Branches')}
          </span>
        </div>
        <span className="font-bold text-success-600 bg-success-100 px-3 py-1 rounded-full">
          {students.length} Students Qualified
        </span>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : students.length === 0 ? (
        <EmptyState
          title="No eligible students found"
          description="No students currently match the minimum CGPA and backlog criteria for this drive."
          icon={Users}
        />
      ) : (
        <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">PRN</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Cumulative CGPA</th>
                  <th className="py-3 px-4">Active Backlogs</th>
                  <th className="py-3 px-4">Application Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-primary">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-bg-base transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary-900">{student.prn}</td>
                    <td className="py-3 px-4 font-semibold">{student.name}</td>
                    <td className="py-3 px-4 text-text-secondary">{student.branch}</td>
                    <td className="py-3 px-4 font-mono font-bold text-primary-700">{student.cgpa}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-success-100 text-success-600">
                        {student.backlogs} Backlogs
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={student.status} />
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
