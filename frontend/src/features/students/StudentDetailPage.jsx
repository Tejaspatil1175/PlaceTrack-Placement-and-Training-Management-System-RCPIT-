import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudentByIdApi } from '../../api/students';
import { StatusBadge } from './StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ArrowLeft,
  User,
  BookOpen,
  FileCheck,
  FileText,
  Download,
  Award,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const { data, isLoading } = useQuery({
    queryKey: ['studentDetail', id],
    queryFn: async () => {
      try {
        return await getStudentByIdApi(id);
      } catch (err) {
        return null;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // Fallback student details if offline/demo
  const student = data || {
    id: id || 1,
    prn: '2021012345',
    name: 'Rahul Ramesh Sharma',
    email: 'rahul.sharma@rcpit.ac.in',
    phone: '9876543210',
    dob: '2003-05-15',
    gender: 'Male',
    category: 'OPEN',
    placementStatus: 'Shortlisted',
    studentProfile: {
      branch: 'Computer Engineering',
      division: 'A',
      admissionYear: 2021,
      currentSemester: 7,
      cgpa: '8.75',
      activeBacklogs: 0,
      skills: ['JavaScript', 'React.js', 'Node.js', 'MySQL', 'Python'],
      address: 'Shirpur, Dhule District, Maharashtra 425405',
      resumeUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample_resume.pdf',
    },
    semesterRecords: [
      { semesterNumber: 1, sgpa: '8.40', credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { semesterNumber: 2, sgpa: '8.60', credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { semesterNumber: 3, sgpa: '8.80', credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { semesterNumber: 4, sgpa: '8.90', credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
      { semesterNumber: 5, sgpa: '9.00', credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
      { semesterNumber: 6, sgpa: '8.80', credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
    ],
    applications: [
      { id: 1, company: 'Tata Consultancy Services', role: 'Software Developer', ctc: '7.0 LPA', status: 'Shortlisted', date: '2026-09-12' },
      { id: 2, company: 'Infosys Limited', role: 'System Engineer', ctc: '6.5 LPA', status: 'Applied', date: '2026-09-14' },
      { id: 3, company: 'Capgemini', role: 'Analyst', ctc: '5.5 LPA', status: 'Rejected', date: '2026-08-20' },
    ],
  };

  const profile = student.studentProfile || {};

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-primary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Directory</span>
        </button>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-primary-900 text-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-primary-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-primary-700 text-accent-500">
                PRN: {student.prn}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-success-600/30 text-success-100 border border-success-600/40">
                Semester {profile.currentSemester}
              </span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">
              {student.name}
            </h1>
            <p className="text-xs text-primary-100/80 mt-1">
              {profile.branch} • Division {profile.division} • Batch {profile.admissionYear}
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-primary-700/80 p-4 rounded-xl border border-primary-500">
            <div className="text-right">
              <span className="block text-[10px] text-primary-100/70 font-semibold uppercase">Computed CGPA</span>
              <span className="font-heading font-bold text-xl text-accent-500">{profile.cgpa}</span>
            </div>
            <div className="h-8 w-px bg-primary-500"></div>
            <div>
              <span className="block text-[10px] text-primary-100/70 font-semibold uppercase">Active Backlogs</span>
              <span className="font-heading font-bold text-xl text-white">{profile.activeBacklogs}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-primary-700 bg-primary-900 px-6">
          {[
            { id: 'profile', label: 'Profile Details', icon: User },
            { id: 'academics', label: 'Academic History', icon: BookOpen },
            { id: 'applications', label: 'Applications', icon: FileCheck },
            { id: 'resume', label: 'Resume', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent-500 text-white font-bold'
                    : 'border-transparent text-primary-100/60 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="font-heading text-sm font-semibold text-text-primary uppercase tracking-wider">
              Student Personal & Academic Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-bg-base rounded-lg border border-border-subtle">
                <span className="block text-text-muted font-medium mb-1">Email Address</span>
                <span className="font-semibold text-text-primary flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary-500" />
                  <span>{student.email}</span>
                </span>
              </div>

              <div className="p-3 bg-bg-base rounded-lg border border-border-subtle">
                <span className="block text-text-muted font-medium mb-1">Phone Number</span>
                <span className="font-semibold text-text-primary flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-success-600" />
                  <span>{student.phone}</span>
                </span>
              </div>

              <div className="p-3 bg-bg-base rounded-lg border border-border-subtle">
                <span className="block text-text-muted font-medium mb-1">Date of Birth</span>
                <span className="font-semibold text-text-primary">{student.dob}</span>
              </div>

              <div className="p-3 bg-bg-base rounded-lg border border-border-subtle">
                <span className="block text-text-muted font-medium mb-1">Category & Gender</span>
                <span className="font-semibold text-text-primary">{student.category} • {student.gender}</span>
              </div>
            </div>

            <div>
              <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                Technical Skills & Tools
              </h4>
              <div className="flex flex-wrap gap-2">
                {(profile.skills || []).map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-primary-100 text-primary-900 text-xs font-semibold rounded-md border border-primary-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                Permanent Address
              </h4>
              <p className="text-xs text-text-secondary p-3 bg-bg-base rounded-lg border border-border-subtle">
                {profile.address}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'academics' && (
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-text-primary uppercase tracking-wider">
              Normalized Semester Performance Records
            </h3>
            <div className="overflow-x-auto border border-border-subtle rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase">
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">SGPA</th>
                    <th className="py-3 px-4">Earned Credits</th>
                    <th className="py-3 px-4">New Backlogs</th>
                    <th className="py-3 px-4">Cleared Backlogs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {(student.semesterRecords || []).map((sem) => (
                    <tr key={sem.semesterNumber} className="hover:bg-bg-base">
                      <td className="py-3 px-4 font-semibold">Semester {sem.semesterNumber}</td>
                      <td className="py-3 px-4 font-mono font-bold text-primary-700">{sem.sgpa}</td>
                      <td className="py-3 px-4 text-text-secondary">{sem.credits}</td>
                      <td className="py-3 px-4 text-error-600 font-semibold">{sem.newBacklogs}</td>
                      <td className="py-3 px-4 text-success-600 font-semibold">{sem.clearedBacklogs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-3">
            <h3 className="font-heading text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
              Placement Drive Applications
            </h3>
            {(student.applications || []).map((app) => (
              <div key={app.id} className="p-4 bg-bg-base border border-border-subtle rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-xs font-bold text-primary-900">{app.company}</h4>
                  <p className="text-xs text-text-secondary mt-0.5">{app.role} • <span className="font-mono text-accent-500 font-semibold">{app.ctc}</span></p>
                  <span className="text-[10px] text-text-muted mt-1 block">Submitted on: {app.date}</span>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
              Uploaded Resume Document
            </h3>
            <div className="p-5 bg-bg-base border border-border-subtle rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-primary-700" />
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Cloudinary Resume PDF</h4>
                  <p className="text-xs text-text-muted">Verified student document for recruiting drives</p>
                </div>
              </div>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary-900 text-white font-heading text-xs font-semibold rounded-lg hover:bg-primary-700 inline-flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
