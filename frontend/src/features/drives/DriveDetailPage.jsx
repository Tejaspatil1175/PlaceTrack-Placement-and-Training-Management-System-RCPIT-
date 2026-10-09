import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../store/authStore';
import { getDriveByIdApi } from '../../api/drives';
import { applyToDriveApi, updateApplicationStatusApi } from '../../api/applications';
import { DriveEligibilityChips } from './DriveEligibilityChips';
import { StatusBadge } from '../students/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Briefcase,
  Building2,
  Calendar,
  Users,
  Award,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export function DriveDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const isStudent = role === 'student';
  const isOfficer = role === 'tpo' || role === 'officer';

  const [activeTab, setActiveTab] = useState('overview');
  const [isApplying, setIsApplying] = useState(false);

  // Fetch Drive Details
  const { data, isLoading } = useQuery({
    queryKey: ['driveDetail', id],
    queryFn: async () => {
      try {
        return await getDriveByIdApi(id);
      } catch (err) {
        return null;
      }
    },
  });

  // Apply to drive mutation for student
  const applyMutation = useMutation({
    mutationFn: async () => {
      setIsApplying(true);
      return await applyToDriveApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driveDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['drivesList'] });
      queryClient.invalidateQueries({ queryKey: ['applicationsList'] });
      queryClient.invalidateQueries({ queryKey: ['studentAnalytics'] });
      setIsApplying(false);
      addToast('Application submitted successfully! T&P Cell has received your submission.', 'success');
    },
    onError: (err) => {
      setIsApplying(false);
      const msg = err?.response?.data?.message || err?.message || 'Unable to submit application.';
      addToast(msg, 'error');
    },
  });

  // Status update mutation for officer/coordinator
  const updateStatusMutation = useMutation({
    mutationFn: async ({ appId, status }) => {
      return await updateApplicationStatusApi(appId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driveDetail', id] });
      alert('Application status updated successfully!');
    },
  });

  const apiDrive = data?.data || data;
  const drive = (apiDrive && apiDrive.companyName) ? apiDrive : null;

  // Eligibility evaluation if student
  let isEligible = drive?.isEligible !== undefined ? drive.isEligible : true;
  let eligibilityReason = Array.isArray(drive?.eligibilityReasons)
    ? drive.eligibilityReasons.join(', ')
    : (typeof drive?.eligibilityReasons === 'string' ? drive.eligibilityReasons : '');

  const BRANCH_ALIASES = {
    computer: ['computer engineering', 'computer', 'cs', 'cse', 'comp'],
    'computer engineering': ['computer engineering', 'computer', 'cs', 'cse', 'comp'],
    it: ['information technology', 'it'],
    'information technology': ['information technology', 'it'],
    'ai&ds': ['artificial intelligence and data science', 'ai&ds', 'ai & ds', 'aids', 'data science'],
    'ai & ds': ['artificial intelligence and data science', 'ai&ds', 'ai & ds', 'aids', 'data science'],
    entc: ['electronics and telecommunication engineering', 'entc', 'e&tc', 'telecommunication', 'electronics'],
    'e&tc': ['electronics and telecommunication engineering', 'entc', 'e&tc', 'telecommunication', 'electronics'],
    'electronics and telecommunication engineering': ['electronics and telecommunication engineering', 'entc', 'e&tc'],
    mechanical: ['mechanical engineering', 'mechanical', 'mech'],
    'mechanical engineering': ['mechanical engineering', 'mechanical', 'mech'],
    civil: ['civil engineering', 'civil'],
    'civil engineering': ['civil engineering', 'civil'],
    electrical: ['electrical engineering', 'electrical'],
    'electrical engineering': ['electrical engineering', 'electrical'],
  };

  const isBranchEligible = (allowedBranches, studentBranch) => {
    if (!allowedBranches || allowedBranches.length === 0) return true;
    if (!studentBranch) return true;
    const sLower = studentBranch.toLowerCase().trim();
    return allowedBranches.some((b) => {
      const bLower = (b || '').toLowerCase().trim();
      if (bLower === sLower || bLower.includes(sLower) || sLower.includes(bLower)) return true;
      const aliases = BRANCH_ALIASES[bLower] || BRANCH_ALIASES[sLower] || [];
      return aliases.some((a) => a === sLower || a === bLower || sLower.includes(a) || bLower.includes(a));
    });
  };

  if (isStudent && user && drive && drive.isEligible === undefined) {
    const studentCgpa = parseFloat(user.cgpa || user.studentProfile?.cgpa || 8.75);
    const studentBacklogs = user.activeBacklogs || user.studentProfile?.activeBacklogs || 0;
    const studentBranch = user.branch || user.studentProfile?.branch || user.departmentName || 'Computer';
    const allowedBranches = Array.isArray(drive.allowedBranches) ? drive.allowedBranches : ['Computer Engineering', 'Information Technology', 'AI&DS'];
    const maxBacklogs = parseInt(drive.maxActiveBacklogs !== undefined ? drive.maxActiveBacklogs : (drive.maxBacklogs || 0), 10);

    if (studentCgpa < parseFloat(drive.minCgpa)) {
      isEligible = false;
      eligibilityReason = `Requires CGPA ≥ ${drive.minCgpa} — your CGPA is ${studentCgpa.toFixed(2)}`;
    } else if (studentBacklogs > maxBacklogs) {
      isEligible = false;
      eligibilityReason = `Max backlogs allowed is ${maxBacklogs} — you have ${studentBacklogs}`;
    } else if (!isBranchEligible(allowedBranches, studentBranch)) {
      isEligible = false;
      eligibilityReason = `Allowed branches: ${allowedBranches.join(', ')} — your branch is ${studentBranch}`;
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            to="/drives"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-primary-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Placement Drives</span>
          </Link>
        </div>
        <EmptyState
          title="Placement Drive Not Found"
          description="The requested placement drive could not be located in the database."
          icon={Briefcase}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/drives"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-primary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Placement Drives</span>
        </Link>
      </div>

      {/* Main Drive Header Card */}
      <div className="bg-primary-900 text-white p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-700 text-accent-500">
                {drive.companyType || 'IT Services'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-success-600/30 text-success-100 border border-success-600/40">
                {drive.status || 'Open'}
              </span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">
              {drive.companyName}
            </h1>
            <p className="text-sm text-primary-100/90 font-medium mt-0.5">
              {drive.jobTitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="px-4 py-2 bg-primary-700/80 rounded-xl border border-primary-500 text-right">
              <span className="block text-[10px] text-primary-100/70 font-semibold uppercase">CTC Package</span>
              <span className="font-heading font-bold text-xl text-accent-500 font-mono">{drive.salaryPackage}</span>
            </div>

            {/* Student CTA Flow */}
            {isStudent && (
              <div>
                {drive.hasApplied ? (
                  <div className="px-4 py-2 bg-primary-700 rounded-xl border border-primary-500 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-success-600" />
                    <span className="text-xs font-bold text-white">Applied</span>
                  </div>
                ) : isEligible ? (
                  <button
                    type="button"
                    onClick={() => applyMutation.mutate()}
                    disabled={isApplying}
                    className="px-6 py-3 bg-accent-500 hover:bg-accent-500/90 text-white font-heading text-sm font-bold rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
                  >
                    {isApplying ? 'Applying...' : 'Apply Now'}
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-warning-100/20 border border-warning-600/40 rounded-xl text-left">
                    <span className="text-[10px] font-bold uppercase text-accent-500 block">Not Eligible</span>
                    <span className="text-[11px] text-primary-100/80">{eligibilityReason}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Eligibility Chips */}
        <div className="pt-2 border-t border-primary-700">
          <DriveEligibilityChips drive={drive} />
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-border-subtle bg-bg-surface px-6 rounded-xl shadow-2xs">
        {[
          { id: 'overview', label: 'Overview & JD', icon: Briefcase },
          ...(!isStudent
            ? [
                { id: 'eligible', label: 'Eligible Students', icon: CheckCircle2 },
                { id: 'applications', label: 'Applicants List', icon: FileCheck },
                { id: 'rounds', label: 'Rounds & Results', icon: Calendar },
              ]
            : []),
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'eligible') {
                  navigate(`/drives/${id}/eligible-students`);
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`py-3.5 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-900 bg-white font-bold'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
                Job Description & Scope
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed p-4 bg-bg-base rounded-lg border border-border-subtle">
                {drive.description}
              </p>
            </div>

            {/* Selection Rounds Timeline */}
            <div>
              <h3 className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider mb-3">
                Recruitment Schedule & Selection Rounds
              </h3>
              <div className="space-y-3">
                {(drive.rounds || []).map((round, idx) => (
                  <div key={idx} className="p-3.5 bg-bg-base border border-border-subtle rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-primary-900 text-white font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-text-primary">{round.roundName}</span>
                    </div>
                    {round.date && <span className="text-text-muted font-medium">{round.date}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Applicants List Tab for Officer/Coordinator */}
        {!isStudent && activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider">
                Submitted Student Applications ({drive.applicantsList?.length || 0})
              </h3>
            </div>

            <div className="overflow-x-auto border border-border-subtle rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase">
                    <th className="py-2.5 px-3">PRN</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">CGPA</th>
                    <th className="py-2.5 px-3">Current Status</th>
                    <th className="py-2.5 px-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {(drive.applicantsList || []).map((app) => (
                    <tr key={app.id} className="hover:bg-bg-base">
                      <td className="py-2.5 px-3 font-mono font-bold text-primary-900">{app.prn}</td>
                      <td className="py-2.5 px-3 font-semibold">{app.name}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{app.branch}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-primary-700">{app.cgpa}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => updateStatusMutation.mutate({ appId: app.id, status: 'Shortlisted' })}
                          className="px-2 py-1 bg-warning-100 text-warning-600 rounded font-semibold text-[10px] hover:bg-warning-600 hover:text-white"
                        >
                          Shortlist
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatusMutation.mutate({ appId: app.id, status: 'Selected' })}
                          className="px-2 py-1 bg-success-100 text-success-600 rounded font-semibold text-[10px] hover:bg-success-600 hover:text-white"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rounds & Results Tab */}
        {!isStudent && activeTab === 'rounds' && (
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider">
              Recruitment Progress & Final Selections
            </h3>
            <EmptyState
              title="Round evaluation active"
              description="Candidate selections and interview scores are managed round-by-round."
              icon={Calendar}
            />
          </div>
        )}
      </div>
    </div>
  );
}
