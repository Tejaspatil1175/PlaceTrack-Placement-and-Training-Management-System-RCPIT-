import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Mail, Building2, CheckCircle2 } from 'lucide-react';

export function CoordinatorsPage() {
  const coordinatorsList = [
    { id: 1, name: 'Prof. Aniket Joshi', email: 'aniket.joshi@rcpit.ac.in', department: 'Computer Engineering', status: 'Active', studentsManaged: 140 },
    { id: 2, name: 'Prof. Sunita Patil', email: 'sunita.patil@rcpit.ac.in', department: 'Information Technology', status: 'Active', studentsManaged: 110 },
    { id: 3, name: 'Prof. Rajesh Kulkarni', email: 'rajesh.kulkarni@rcpit.ac.in', department: 'AI & Data Science', status: 'Active', studentsManaged: 90 },
    { id: 4, name: 'Prof. Mahesh Chaudhari', email: 'mahesh.c@rcpit.ac.in', department: 'Electronics & Telecommunication', status: 'Active', studentsManaged: 100 },
    { id: 5, name: 'Prof. Pravin Marathe', email: 'pravin.m@rcpit.ac.in', department: 'Mechanical Engineering', status: 'Active', studentsManaged: 60 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Department Placement Coordinators
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Provision and manage department coordinator accounts across engineering disciplines.
            </p>
          </div>
        </div>

        <Link
          to="/coordinators/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-900 hover:bg-primary-700 text-white font-heading font-medium text-xs rounded-lg shadow-sm transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Coordinator</span>
        </Link>
      </div>

      {/* Coordinators Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Coordinator Name</th>
                <th className="py-3 px-4">Department Assigned</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Students Managed</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-primary">
              {coordinatorsList.map((coord) => (
                <tr key={coord.id} className="hover:bg-bg-base transition-colors">
                  <td className="py-3.5 px-4 font-bold text-primary-900">{coord.name}</td>
                  <td className="py-3.5 px-4 font-semibold text-text-primary">{coord.department}</td>
                  <td className="py-3.5 px-4 text-text-secondary font-mono">{coord.email}</td>
                  <td className="py-3.5 px-4 font-bold text-primary-700">{coord.studentsManaged} Students</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-success-100 text-success-600">
                      {coord.status}
                    </span>
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
