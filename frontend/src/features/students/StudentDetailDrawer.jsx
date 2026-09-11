import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import {
  X,
  User,
  BookOpen,
  FileCheck,
  FileText,
  ExternalLink,
  Download,
  Award,
  AlertCircle,
  Building2,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';

export function StudentDetailDrawer({ student, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');

  if (!student) return null;

  const profile = student.studentProfile || {};
  const semesterRecords = student.semesterRecords || [
    { semesterNumber: 1, sgpa: '8.40', credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
    { semesterNumber: 2, sgpa: '8.60', credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
    { semesterNumber: 3, sgpa: '8.80', credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
    { semesterNumber: 4, sgpa: '8.90', credits: 24, newBacklogs: 0, clearedBacklogs: 0 },
    { semesterNumber: 5, sgpa: '9.00', credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
    { semesterNumber: 6, sgpa: '8.80', credits: 22, newBacklogs: 0, clearedBacklogs: 0 },
  ];

  const applications = student.applications || [
    { id: 1, company: 'Tata Consultancy Services', role: 'Software Developer', ctc: '7.0 LPA', status: 'Shortlisted', date: '2026-09-12' },
    { id: 2, company: 'Infosys Limited', role: 'System Engineer', ctc: '6.5 LPA', status: 'Applied', date: '2026-09-14' },
    { id: 3, company: 'Capgemini', role: 'Analyst', ctc: '5.5 LPA', status: 'Rejected', date: '2026-08-20' },
  ];

  const resumeUrl = profile.resumeUrl || 'https://res.cloudinary.com/demo/image/upload/v1/sample_resume.pdf';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer Card */}
      <div className="relative w-full max-w-2xl bg-bg-surface h-full shadow-2xl flex flex-col z-10 overflow-hidden border-l border-border-subtle">
        {/* Header */}
        <div className="p-6 bg-primary-900 text-white flex items-start justify-between border-b border-primary-700">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-700 text-accent-500">
                PRN: {student.prn || '2021012345'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success-600/30 text-success-100 border border-success-600/40">
                Sem {profile.currentSemester || 7}
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold text-white mt-1">
              {student.name}
            </h2>
            <p className="text-xs text-primary-100/80 mt-0.5">
              {profile.branch || 'Computer Engineering'} • Division {profile.division || 'A'} • Batch {profile.admissionYear || 2021}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-primary-700/60 text-primary-100 hover:text-white hover:bg-primary-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregate Academic Pill */}
        <div className="bg-primary-700 px-6 py-3 border-b border-primary-500 flex items-center justify-between text-white text-xs">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-accent-500" />
            <span>Credit-Weighted CGPA: <strong className="text-white font-mono text-sm">{profile.cgpa || '8.75'}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-success-100" />
            <span>Active Backlogs: <strong className="text-white font-mono">{profile.activeBacklogs || 0}</strong></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-subtle bg-bg-base px-6">
          {[
            { id: 'profile', label: 'Profile Info', icon: User },
            { id: 'academics', label: 'Academic History', icon: BookOpen },
            { id: 'applications', label: 'Applications', icon: FileCheck },
            { id: 'resume', label: 'Resume Document', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-900 bg-white font-bold'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* 1. Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-bg-base rounded-lg border border-border-subtle">
                  <span className="block text-text-muted font-medium mb-1">Email Address</span>
                  <span className="font-semibold text-text-primary flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary-500" />
                    <span>{student.email}</span>
                  </span>
                </div>

                <div className="p-3 bg-bg-base rounded-lg border border-border-subtle">
                  <span className="block text-text-muted font-medium mb-1">Phone Contact</span>
                  <span className="font-semibold text-text-primary flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-success-600" />
                    <span>{student.phone || '9876543210'}</span>
                  </span>
                </div>

                <div className="p-3 bg-bg-base rounded-lg border border-border-subtle">
                  <span className="block text-text-muted font-medium mb-1">Date of Birth</span>
                  <span className="font-semibold text-text-primary">{student.dob || '2003-05-15'}</span>
                </div>

                <div className="p-3 bg-bg-base rounded-lg border border-border-subtle">
                  <span className="block text-text-muted font-medium mb-1">Gender / Category</span>
                  <span className="font-semibold text-text-primary">{student.gender || 'Male'} ({student.category || 'OPEN'})</span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Technical Skills & Certifications
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(profile.skills || ['JavaScript', 'React.js', 'Node.js', 'MySQL', 'Python']).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-primary-100/70 text-primary-900 text-xs font-semibold rounded border border-primary-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Permanent Address
                </h4>
                <p className="text-xs text-text-secondary p-3 bg-bg-base rounded-lg border border-border-subtle">
                  {profile.address || 'Shirpur, Dhule District, Maharashtra 425405'}
                </p>
              </div>
            </div>
          )}

          {/* 2. Academic History Tab */}
          {activeTab === 'academics' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-border-subtle rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase">
                      <th className="py-2.5 px-3">Semester</th>
                      <th className="py-2.5 px-3">SGPA</th>
                      <th className="py-2.5 px-3">Earned Credits</th>
                      <th className="py-2.5 px-3">New Backlogs</th>
                      <th className="py-2.5 px-3">Cleared Backlogs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-text-primary">
                    {semesterRecords.map((sem) => (
                      <tr key={sem.semesterNumber} className="hover:bg-bg-base">
                        <td className="py-2.5 px-3 font-semibold">Semester {sem.semesterNumber}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-primary-700">{sem.sgpa}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{sem.credits}</td>
                        <td className="py-2.5 px-3 text-error-600 font-semibold">{sem.newBacklogs}</td>
                        <td className="py-2.5 px-3 text-success-600 font-semibold">{sem.clearedBacklogs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-3.5 bg-bg-base border border-border-subtle rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-heading text-xs font-bold text-primary-900">{app.company}</h4>
                    <p className="text-[11px] text-text-secondary mt-0.5">{app.role} • <span className="font-mono text-accent-500">{app.ctc}</span></p>
                    <span className="text-[10px] text-text-muted mt-1 block">Applied: {app.date}</span>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}

          {/* 4. Resume Tab */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="p-4 bg-bg-base border border-border-subtle rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-primary-700" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Student Resume PDF</h4>
                    <p className="text-[11px] text-text-muted">Cloudinary verified file</p>
                  </div>
                </div>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-primary-900 text-white font-heading text-xs font-semibold rounded hover:bg-primary-700 inline-flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
