import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEligibleStudentsApi, getDriveByIdApi } from '../../api/drives';
import { StatusBadge } from '../students/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Users,
  Download,
  ArrowLeft,
  Award,
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText,
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

  const handleExportPdf = () => {
    if (students.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const companyName = drive.companyName || 'Placement Drive';
    const jobRole = drive.role || drive.jobTitle || 'Software Engineer';
    const pkg = drive.ctc ? `${drive.ctc} LPA` : drive.salaryPackage || 'Competitive';
    const minCgpa = drive.minCgpa ?? 'N/A';
    const maxBacklogs = drive.maxBacklogs ?? 0;
    const branches = Array.isArray(drive.eligibleBranches || drive.allowedBranches)
      ? (drive.eligibleBranches || drive.allowedBranches).join(', ')
      : drive.eligibleBranches || drive.allowedBranches || 'All Branches';

    // 1. Institutional Header
    doc.setFillColor(28, 63, 99); // Navy blue
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('R. C. Patel Institute of Technology, Shirpur', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(220, 230, 242);
    doc.text('Training & Placement Cell • Auto-Matched Eligibility Roster', 14, 18);

    // Accent gold line
    doc.setFillColor(184, 134, 46);
    doc.rect(0, 24, 210, 2, 'F');

    // 2. Drive Overview Meta Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 31, 182, 32, 2, 2, 'FD');

    doc.setTextColor(28, 63, 99);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${companyName}`, 18, 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Role: ${jobRole}   |   Package: ${pkg}`, 18, 44);
    doc.text(`Matched Criteria: Min CGPA ≥ ${minCgpa}   |   Max Backlogs: ${maxBacklogs}`, 18, 50);
    doc.text(`Eligible Branches: ${branches.length > 70 ? branches.slice(0, 67) + '...' : branches}`, 18, 56);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // Green
    doc.text(`Qualified Students: ${students.length}`, 150, 38);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 44);

    // 3. AutoTable Data Table
    const tableHeaders = [['#', 'PRN', 'Candidate Name', 'Branch', 'CGPA', 'Backlogs', 'Status']];
    const tableData = students.map((s, idx) => [
      idx + 1,
      s.prn,
      s.name,
      s.branch,
      s.cgpa,
      `${s.backlogs} Backlog${s.backlogs === 1 ? '' : 's'}`,
      s.status,
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: 68,
      margin: { left: 14, right: 14 },
      headStyles: {
        fillColor: [28, 63, 99],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 28, fontStyle: 'bold' },
        2: { cellWidth: 50 },
        3: { cellWidth: 35 },
        4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 22, halign: 'center' },
        6: { cellWidth: 19, halign: 'center' },
      },
      didDrawPage: (data) => {
        // Footer on every page
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `PlaceTrack RCPIT Institutional Placement Record • Confidential • Page ${data.pageNumber} of ${pageCount}`,
          14,
          290
        );
      },
    });

    doc.save(`Eligible_Students_${companyName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
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

        {/* Export Actions (PDF & CSV) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={students.length === 0}
            className="px-4 py-2.5 bg-accent-500 hover:bg-accent-500/90 disabled:opacity-50 text-white font-heading font-bold text-xs rounded-lg shadow-sm inline-flex items-center space-x-2 shrink-0 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export Official PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={students.length === 0}
            className="px-3.5 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white font-heading font-semibold text-xs rounded-lg border border-primary-500 shadow-sm inline-flex items-center space-x-2 shrink-0 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
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
