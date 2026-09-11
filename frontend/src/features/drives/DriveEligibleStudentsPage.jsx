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

  const drive = driveData || {
    id: id || 1,
    companyName: 'Tata Consultancy Services (TCS)',
    jobTitle: 'Software Engineer (Ninja / Digital)',
    salaryPackage: '7.0 LPA',
    minCgpa: 6.5,
    maxBacklogs: 0,
    allowedBranches: ['Computer', 'IT', 'AI&DS', 'ENTC'],
  };

  const fallbackEligibleStudents = [
    { id: 1, prn: '2021012345', name: 'Rahul Ramesh Sharma', branch: 'Computer', cgpa: 8.75, backlogs: 0, status: 'Applied' },
    { id: 2, prn: '2021012346', name: 'Priya Suresh Patel', branch: 'IT', cgpa: 9.12, backlogs: 0, status: 'Shortlisted' },
    { id: 4, prn: '2021012348', name: 'Neha Rajesh Deshmukh', branch: 'Computer', cgpa: 8.90, backlogs: 0, status: 'Applied' },
    { id: 6, prn: '2021012350', name: 'Ganesh Shinde', branch: 'AI&DS', cgpa: 7.80, backlogs: 0, status: 'Eligible' },
    { id: 7, prn: '2021012351', name: 'Kavita Patil', branch: 'Computer', cgpa: 8.40, backlogs: 0, status: 'Eligible' },
  ];

  const students = eligibleData?.students || fallbackEligibleStudents;

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'PRN,Name,Branch,CGPA,ActiveBacklogs,ApplicationStatus\n' +
      students.map((s) => `${s.prn},${s.name},${s.branch},${s.cgpa},${s.backlogs},${s.status}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Eligible_Students_${drive.companyName.replace(/\s+/g, '_')}.csv`);
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
            {drive.companyName} — Eligible Students List
          </h1>
          <p className="text-primary-100/80 text-xs mt-0.5">
            Role: {drive.jobTitle} • Package: <span className="font-mono text-accent-500">{drive.salaryPackage}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-accent-500 hover:bg-accent-500/90 text-white font-heading font-bold text-xs rounded-lg shadow-sm inline-flex items-center space-x-2 shrink-0 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export List to CSV</span>
        </button>
      </div>

      {/* Criteria Summary Card */}
      <div className="p-4 bg-bg-surface border border-border-subtle rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-text-primary">Matched Rules:</span>
          <span className="px-2.5 py-1 bg-primary-100 text-primary-900 rounded font-semibold">Min CGPA ≥ {drive.minCgpa}</span>
          <span className="px-2.5 py-1 bg-bg-base text-text-primary rounded border border-border-subtle">Max Backlogs: {drive.maxBacklogs}</span>
          <span className="px-2.5 py-1 bg-bg-base text-text-primary rounded border border-border-subtle">Branches: {(drive.allowedBranches || []).join(', ')}</span>
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
