import React from 'react';
import { StatusBadge } from './StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Info, ExternalLink, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function StudentDataTable({
  students = [],
  isLoading = false,
  onSelectStudent,
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-3 shadow-2xs">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <EmptyState
        title="No students found"
        description="No student records match the selected filter criteria."
        icon={GraduationCap}
      />
    );
  }

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider">
              <th className="py-3 px-4">PRN</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Dept / Branch</th>
              <th className="py-3 px-4">Sem</th>
              <th className="py-3 px-4">
                <div className="flex items-center space-x-1">
                  <span>CGPA</span>
                  <div className="relative group cursor-help">
                    <Info className="w-3.5 h-3.5 text-text-muted hover:text-primary-500" />
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-primary-900 text-white text-[10px] rounded shadow-lg z-20 font-normal normal-case">
                      Auto-calculated credit-weighted average from completed semester records.
                    </div>
                  </div>
                </div>
              </th>
              <th className="py-3 px-4">Active Backlogs</th>
              <th className="py-3 px-4">Placement Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-text-primary">
            {students.map((student) => {
              const profile = student.studentProfile || {};
              const cgpa = profile.cgpa !== undefined ? parseFloat(profile.cgpa).toFixed(2) : '0.00';
              const backlogs = profile.activeBacklogs || 0;
              const branch = profile.branch || 'Computer';
              const sem = profile.currentSemester || 7;
              const placementStatus = student.placementStatus || 'Unplaced';

              return (
                <tr
                  key={student.id}
                  onClick={() => onSelectStudent && onSelectStudent(student)}
                  className="hover:bg-primary-100/30 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-primary-900">
                    {student.prn || '2021012345'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-text-primary group-hover:text-primary-700">
                    {student.name}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {branch}
                  </td>
                  <td className="py-3 px-4 text-text-secondary font-medium">
                    Sem {sem}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-primary-700">
                    {cgpa}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        backlogs === 0
                          ? 'bg-success-100 text-success-600'
                          : 'bg-error-100 text-error-600'
                      }`}
                    >
                      {backlogs} {backlogs === 1 ? 'Backlog' : 'Backlogs'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={placementStatus} />
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="p-1.5 rounded text-text-muted hover:text-primary-700 hover:bg-bg-base transition-colors"
                      title="Open full detail page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
