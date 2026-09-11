import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, GraduationCap, Briefcase, ArrowRight, Info } from 'lucide-react';

export function DepartmentsPage() {
  const departments = [
    {
      id: 1,
      name: 'Computer Engineering',
      code: 'COMP',
      coordinator: 'Prof. Aniket Joshi',
      studentCount: 140,
      placedCount: 82,
      activeDrives: 18,
    },
    {
      id: 2,
      name: 'Information Technology',
      code: 'IT',
      coordinator: 'Prof. Sunita Patil',
      studentCount: 110,
      placedCount: 64,
      activeDrives: 16,
    },
    {
      id: 3,
      name: 'AI & Data Science',
      code: 'AI&DS',
      coordinator: 'Prof. Rajesh Kulkarni',
      studentCount: 90,
      placedCount: 50,
      activeDrives: 14,
    },
    {
      id: 4,
      name: 'Electronics & Telecommunication',
      code: 'ENTC',
      coordinator: 'Prof. Mahesh Chaudhari',
      studentCount: 100,
      placedCount: 42,
      activeDrives: 12,
    },
    {
      id: 5,
      name: 'Mechanical Engineering',
      code: 'MECH',
      coordinator: 'Prof. Pravin Marathe',
      studentCount: 60,
      placedCount: 22,
      activeDrives: 8,
    },
    {
      id: 6,
      name: 'Civil Engineering',
      code: 'CIVIL',
      coordinator: 'Unassigned',
      studentCount: 40,
      placedCount: 12,
      activeDrives: 5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Departments Management
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Overview of RCPIT engineering departments, assigned coordinators, & placement participation.
            </p>
          </div>
        </div>
      </div>

      {/* Contract Gap Callout Banner */}
      <div className="p-4 bg-info-100 border border-info-600/30 rounded-xl flex items-center space-x-3 text-xs text-text-primary">
        <Info className="w-4 h-4 text-info-600 shrink-0" />
        <span>
          Department master data is populated via seed scripts. Inline department creation is omitted per the backend contract specification.
        </span>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-900">
                    {dept.code}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-primary-900 mt-1">
                    {dept.name}
                  </h3>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-bg-base rounded border border-border-subtle">
                  <span className="text-text-muted font-medium">Assigned Coordinator</span>
                  <span className="font-semibold text-text-primary">{dept.coordinator}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-bg-base rounded border border-border-subtle">
                    <span className="block text-[10px] text-text-muted font-semibold uppercase">Total Students</span>
                    <span className="font-heading font-bold text-sm text-primary-700">{dept.studentCount}</span>
                  </div>
                  <div className="p-2 bg-bg-base rounded border border-border-subtle">
                    <span className="block text-[10px] text-text-muted font-semibold uppercase">Active Drives</span>
                    <span className="font-heading font-bold text-sm text-accent-500">{dept.activeDrives}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-semibold">
              <Link to="/students" className="text-primary-500 hover:text-primary-700 inline-flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>View Students</span>
              </Link>
              <Link to="/drives" className="text-primary-500 hover:text-primary-700 inline-flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>View Drives</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
