import React from 'react';
import { Link } from 'react-router-dom';
import { DriveEligibilityChips } from './DriveEligibilityChips';
import { StatusBadge } from '../students/StatusBadge';
import {
  Briefcase,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export function DriveCard({
  drive,
  user,
  role,
  onApply,
  isApplying = false,
}) {
  const isStudent = role === 'student';
  const isOfficer = role === 'tpo' || role === 'officer';

  // Calculate student eligibility status if role === student
  let isEligible = true;
  let eligibilityReason = '';
  let alreadyApplied = Boolean(drive.hasApplied);
  let applicationStatus = drive.applicationStatus || 'Applied';

  if (isStudent && user) {
    const studentCgpa = parseFloat(user.cgpa || user.studentProfile?.cgpa || 8.75);
    const studentBacklogs = user.activeBacklogs || user.studentProfile?.activeBacklogs || 0;
    const studentBranch = user.branch || user.studentProfile?.branch || 'Computer';
    const studentSem = user.currentSemester || user.studentProfile?.currentSemester || 7;

    const minCgpa = parseFloat(drive.minCgpa || 6.5);
    const maxBacklogs = parseInt(drive.maxBacklogs || 0, 10);
    const allowedBranches = drive.allowedBranches || ['Computer', 'IT', 'AI&DS'];
    const minSem = parseInt(drive.minSemester || 7, 10);

    if (studentCgpa < minCgpa) {
      isEligible = false;
      eligibilityReason = `Requires CGPA ≥ ${minCgpa} — yours: ${studentCgpa.toFixed(2)}`;
    } else if (studentBacklogs > maxBacklogs) {
      isEligible = false;
      eligibilityReason = `Max backlogs allowed: ${maxBacklogs} — yours: ${studentBacklogs}`;
    } else if (!allowedBranches.includes(studentBranch)) {
      isEligible = false;
      eligibilityReason = `Allowed branches: ${allowedBranches.join(', ')} — your branch: ${studentBranch}`;
    } else if (studentSem < minSem) {
      isEligible = false;
      eligibilityReason = `Requires Min Sem ${minSem} — your sem: ${studentSem}`;
    }
  }

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4">
      <div>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              {drive.companyType || 'IT Services'}
            </span>
            <h3 className="font-heading text-lg font-bold text-primary-900 leading-snug">
              {drive.companyName || drive.company}
            </h3>
            <p className="text-xs text-text-secondary font-medium">
              {drive.jobTitle || drive.role}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="font-heading font-bold text-base text-accent-500 block font-mono">
              {drive.salaryPackage || drive.ctc}
            </span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                drive.status === 'Open' || drive.status === 'Ongoing'
                  ? 'bg-success-100 text-success-600'
                  : drive.status === 'Shortlisting'
                  ? 'bg-warning-100 text-warning-600'
                  : 'bg-bg-base text-text-muted border border-border-subtle'
              }`}
            >
              {drive.status || 'Open'}
            </span>
          </div>
        </div>

        {/* Eligibility Chips */}
        <div className="my-3">
          <DriveEligibilityChips drive={drive} />
        </div>

        {/* Schedule info */}
        <div className="flex items-center space-x-4 text-xs text-text-muted pt-2 border-t border-border-subtle/60">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-primary-700" />
            <span>Deadline: {drive.deadline || '2026-09-30'}</span>
          </span>
          {!isStudent && (
            <span className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-accent-500" />
              <span>{drive.applicantCount || drive.applicants || 0} Applicants</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
        <Link
          to={`/drives/${drive.id}`}
          className="text-xs font-semibold text-primary-500 hover:text-primary-700 inline-flex items-center space-x-1"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3" />
        </Link>

        {/* Student Action Flow */}
        {isStudent && (
          <div>
            {alreadyApplied ? (
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-600" />
                <StatusBadge status={applicationStatus} />
              </div>
            ) : isEligible ? (
              <button
                type="button"
                onClick={() => onApply && onApply(drive.id)}
                disabled={isApplying}
                className="px-4 py-2 bg-accent-500 hover:bg-accent-500/90 text-white font-heading text-xs font-bold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
              >
                {isApplying ? 'Applying...' : 'Apply Now'}
              </button>
            ) : (
              <div className="relative group">
                <button
                  type="button"
                  disabled
                  className="px-3.5 py-1.5 bg-bg-base border border-border-subtle text-text-muted text-xs font-medium rounded-lg cursor-not-allowed flex items-center space-x-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-warning-600" />
                  <span>Not Eligible</span>
                </button>
                {/* Tooltip explaining exact reason */}
                <div className="absolute bottom-full mb-1 right-0 hidden group-hover:block w-56 p-2 bg-primary-900 text-white text-[10px] rounded shadow-lg z-30 font-medium">
                  {eligibilityReason}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Officer/Coordinator Actions */}
        {!isStudent && (
          <Link
            to={`/drives/${drive.id}/eligible-students`}
            className="px-3 py-1.5 bg-primary-100/80 hover:bg-primary-100 text-primary-900 text-xs font-semibold rounded-lg border border-primary-500/20 transition-colors"
          >
            Eligible Students
          </Link>
        )}
      </div>
    </div>
  );
}
