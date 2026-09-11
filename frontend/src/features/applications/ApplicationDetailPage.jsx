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

export function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock application detail
  const application = {
    id: id || 1,
    companyName: 'Tata Consultancy Services',
    jobTitle: 'Software Engineer (Ninja / Digital)',
    ctc: '7.0 LPA',
    appliedAt: '2026-09-12',
    updatedAt: '2026-09-14',
    status: 'Shortlisted',
    remarks: 'Selected for Round 1 Technical & Coding Interview on Sept 28. Please carry your college ID and updated resume.',
    rounds: [
      { name: 'Application Submission', status: 'Completed', date: '12 Sept 2026' },
      { name: 'Eligibility Screening', status: 'Passed (CGPA 8.75 ≥ 6.5)', date: '13 Sept 2026' },
      { name: 'Technical Shortlist', status: 'Shortlisted', date: '14 Sept 2026' },
      { name: 'Technical Interview', status: 'Scheduled (28 Sept 2026)', date: 'Upcoming' },
      { name: 'Final HR Discussion', status: 'Pending', date: 'TBD' },
    ],
  };

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
            {application.rounds.map((r, i) => (
              <div key={i} className="p-3 bg-bg-base border border-border-subtle rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className={`w-4 h-4 ${r.status.includes('Passed') || r.status.includes('Completed') || r.status.includes('Shortlisted') ? 'text-success-600' : 'text-text-muted'}`} />
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
