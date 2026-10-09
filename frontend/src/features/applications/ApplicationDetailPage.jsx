import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '../students/StatusBadge';
import { ApplicationTimeline } from './ApplicationTimeline';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ArrowLeft,
  FileCheck,
  Building2,
  Calendar,
  MessageSquare,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { getApplicationByIdApi } from '../../api/applications';

export function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ['applicationDetail', id],
    queryFn: () => getApplicationByIdApi(id),
    enabled: Boolean(id),
  });

  const application = responseData?.data || null;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/applications')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-primary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </button>
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 text-center">
          <h3 className="font-heading text-lg font-bold text-text-primary">Application Not Found</h3>
          <p className="text-xs text-text-secondary mt-1">
            The requested placement application could not be retrieved from the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <div>
        <button
          onClick={() => navigate('/applications')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-primary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </button>
      </div>

      {/* Main Card Header */}
      <div className="bg-primary-900 text-white p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-700 text-accent-500">
                Application #{application.id}
              </span>
              <StatusBadge status={application.status} />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">
              {application.companyName}
            </h1>
            <p className="text-xs text-primary-100/80 font-medium mt-0.5">
              {application.jobTitle} • CTC: <span className="font-mono text-accent-500 font-bold">{application.ctc}</span>
            </p>
          </div>

          <div className="text-right text-xs text-primary-100/80">
            <span className="block font-medium">Applied on: {application.appliedAt}</span>
            <span className="block text-[10px] text-primary-100/60 mt-0.5">Last updated: {application.updatedAt}</span>
          </div>
        </div>

        {/* Timeline Component Embedded */}
        <div className="pt-4 border-t border-primary-700 bg-primary-900/50 p-4 rounded-lg">
          <ApplicationTimeline currentStatus={application.status} />
        </div>
      </div>

      {/* T&P Cell Remarks & Notes */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-border-subtle">
          <MessageSquare className="w-4 h-4 text-accent-500" />
          <h3 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider">
            T&P Cell Remarks & Instructions
          </h3>
        </div>

        <div className="p-4 bg-primary-100/50 border border-primary-500/20 rounded-lg text-xs text-primary-900 leading-relaxed font-medium">
          {application.remarks}
        </div>

        {/* Detailed Round Progress */}
        <div className="pt-2">
          <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
            Round Progress Breakdown
          </h4>
          <div className="space-y-2.5">
            {[
              {
                name: 'Application Submission',
                status: 'Completed',
                date: application.appliedAt || 'Submitted',
                passed: true
              },
              {
                name: 'Eligibility Screening',
                status: application.cgpa ? `Passed (CGPA: ${application.cgpa})` : 'Criteria Verified',
                date: application.appliedAt || 'Verified',
                passed: true
              },
              {
                name: 'Technical Shortlist & Assessment',
                status: ['SHORTLISTED', 'ACCEPTED', 'SELECTED'].includes(application.status?.toUpperCase())
                  ? 'Shortlisted'
                  : application.status?.toUpperCase() === 'REJECTED'
                  ? 'Not Shortlisted'
                  : 'In Progress / Review',
                date: application.updatedAt || 'T&P Review',
                passed: ['SHORTLISTED', 'ACCEPTED', 'SELECTED'].includes(application.status?.toUpperCase())
              },
              {
                name: 'Interview & Selection Decision',
                status: ['ACCEPTED', 'SELECTED'].includes(application.status?.toUpperCase())
                  ? 'Selected / Offer Released'
                  : application.status?.toUpperCase() === 'SHORTLISTED'
                  ? 'Interview Call Active'
                  : application.status?.toUpperCase() === 'REJECTED'
                  ? 'Rejected'
                  : 'Pending Shortlisting',
                date: ['ACCEPTED', 'SELECTED'].includes(application.status?.toUpperCase()) ? 'Offer Confirmed' : 'TBD',
                passed: ['ACCEPTED', 'SELECTED'].includes(application.status?.toUpperCase())
              }
            ].map((r, i) => (
              <div key={i} className="p-3 bg-bg-base border border-border-subtle rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className={`w-4 h-4 ${r.passed ? 'text-success-600' : 'text-text-muted'}`} />
                  <span className="font-semibold text-text-primary">{r.name}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-primary-900">{r.status}</span>
                  <span className="block text-[10px] text-text-muted">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
