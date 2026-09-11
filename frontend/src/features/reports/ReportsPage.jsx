import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Plus,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function ReportsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [scope, setScope] = useState('college_wide');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [department, setDepartment] = useState('Computer');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock list of previously generated reports
  const [reportsList, setReportsList] = useState([
    {
      id: 1,
      title: 'College-wide Placement Audit Summary 2024-25',
      scope: 'College-wide',
      academicYear: '2024-2025',
      generatedBy: 'Prof. T&P Officer',
      generatedDate: '2025-06-15',
      fileSize: '2.4 MB',
      fileFormat: 'PDF',
      url: 'https://res.cloudinary.com/demo/image/upload/v1/placement_report_2025.pdf',
    },
    {
      id: 2,
      title: 'Computer Engineering Department Placement Report',
      scope: 'Computer Dept',
      academicYear: '2024-2025',
      generatedBy: 'Computer Dept Coordinator',
      generatedDate: '2025-06-10',
      fileSize: '1.8 MB',
      fileFormat: 'PDF',
      url: 'https://res.cloudinary.com/demo/image/upload/v1/comp_dept_report.pdf',
    },
    {
      id: 3,
      title: 'NAAC Accreditation Placement Statistics 2023-24',
      scope: 'College-wide',
      academicYear: '2023-2024',
      generatedBy: 'Prof. T&P Officer',
      generatedDate: '2024-05-30',
      fileSize: '3.1 MB',
      fileFormat: 'PDF',
      url: 'https://res.cloudinary.com/demo/image/upload/v1/naac_report_2024.pdf',
    },
  ]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newReport = {
        id: Date.now(),
        title: `${scope === 'college_wide' ? 'College-wide' : department + ' Dept'} Placement Summary ${academicYear}`,
        scope: scope === 'college_wide' ? 'College-wide' : `${department} Dept`,
        academicYear,
        generatedBy: user?.name || 'Prof. T&P Officer',
        generatedDate: new Date().toISOString().split('T')[0],
        fileSize: '2.1 MB',
        fileFormat: 'PDF',
        url: 'https://res.cloudinary.com/demo/image/upload/v1/placement_report_generated.pdf',
      };
      setReportsList((prev) => [newReport, ...prev]);
      setIsGenerating(false);
      addToast('Placement PDF report generated successfully!', 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Placement Summary & Audit Reports
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Generate exportable PDF placement summary reports for college administration & NAAC accreditation audits.
            </p>
          </div>
        </div>
      </div>

      {/* Report Generator Control Card */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs space-y-4">
        <h3 className="font-heading text-sm font-bold text-primary-900 uppercase tracking-wider pb-2 border-b border-border-subtle">
          Report Generation Scope & Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
              Report Scope
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
            >
              <option value="college_wide">College-wide (All Departments)</option>
              <option value="department">Department Scoped</option>
            </select>
          </div>

          {scope === 'department' && (
            <div>
              <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                Select Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
              >
                <option value="Computer">Computer</option>
                <option value="IT">IT</option>
                <option value="AI&DS">AI & DS</option>
                <option value="ENTC">ENTC</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
              Academic Batch Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
            >
              <option value="2025-2026">2025 – 2026</option>
              <option value="2024-2025">2024 – 2025</option>
              <option value="2023-2024">2023 – 2024</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-primary-900 hover:bg-primary-700 text-white font-heading font-semibold text-xs rounded-lg shadow-sm inline-flex items-center space-x-2 disabled:opacity-60 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>{isGenerating ? 'Compiling PDF Report...' : 'Generate PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Previously Generated Reports Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border-subtle bg-bg-base">
          <h3 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider">
            Archive of Generated Placement Reports
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Report Document</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4">Generated By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Download Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-primary">
              {reportsList.map((report) => (
                <tr key={report.id} className="hover:bg-bg-base transition-colors">
                  <td className="py-3.5 px-4 font-bold text-primary-900">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-error-600 shrink-0" />
                      <span>{report.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-text-secondary">{report.scope}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold">{report.academicYear}</td>
                  <td className="py-3.5 px-4 text-text-secondary">{report.generatedBy}</td>
                  <td className="py-3.5 px-4 text-text-muted">{report.generatedDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-primary-100 hover:bg-primary-900 hover:text-white text-primary-900 font-semibold text-xs rounded inline-flex items-center space-x-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {report.fileFormat} ({report.fileSize})</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
