import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { getNotificationsApi } from '../../api/notifications';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Bell,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Calendar,
  Building2,
  Users,
  Search,
} from 'lucide-react';

export function NotificationsPage() {
  const { user, role } = useAuth();
  const isStudent = role === 'student';
  const isOfficer = role === 'tpo' || role === 'officer';

  const [studentFilter, setStudentFilter] = useState('all'); // 'all' | 'result' | 'drive' | 'event'
  const [searchTerm, setSearchTerm] = useState('');

  // TanStack Query to fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notificationsList', role, studentFilter],
    queryFn: async () => {
      try {
        return await getNotificationsApi({ filter: studentFilter });
      } catch (err) {
        return null;
      }
    },
  });

  // Mock Notifications fallback for dev preview
  const fallbackNotifications = [
    {
      id: 1,
      title: 'TCS Ninja Round 1 Interview Shortlist Released',
      body: 'The list of shortlisted candidates for TCS Ninja Round 1 Technical Interview is now available. Shortlisted students are requested to report to T&P Lab 3.',
      type: 'result', // 'result' | 'drive' | 'event'
      audience: 'Computer & IT Departments',
      sentBy: 'Prof. T&P Officer',
      sentAt: '2 hours ago',
      isUnread: true,
    },
    {
      id: 2,
      title: 'Infosys Specialist Placement Drive Announced',
      body: 'Infosys Limited is visiting RCPIT for Specialist Programmer (9.5 LPA) roles. Application deadline is Sept 28, 2026. Check eligibility and apply on the Drives portal.',
      type: 'drive',
      audience: 'College-wide (Sem 7)',
      sentBy: 'Main T&P Cell',
      sentAt: '1 day ago',
      isUnread: true,
    },
    {
      id: 3,
      title: 'System Design & Full-Stack Development Workshop',
      body: 'An interactive workshop on System Design and Microservices architecture by industry experts from Persistent Systems will be held on Sept 22 at Main Auditorium.',
      type: 'event',
      audience: 'Computer Department',
      sentBy: 'Computer Dept. Coordinator',
      sentAt: '2 days ago',
      isUnread: false,
    },
    {
      id: 4,
      title: 'Mock Aptitude Test Mandatory Announcement',
      body: 'All 7th semester students must attempt the online mock aptitude assessment scheduled for Saturday 10:00 AM.',
      type: 'drive',
      audience: 'College-wide',
      sentBy: 'Prof. T&P Officer',
      sentAt: '3 days ago',
      isUnread: false,
    },
  ];

  const notifications = data?.notifications || fallbackNotifications;

  // Filter
  const filtered = notifications.filter((n) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchBody = n.body?.toLowerCase().includes(q);
      if (!matchTitle && !matchBody) return false;
    }
    if (isStudent && studentFilter !== 'all') {
      if (studentFilter === 'result' && n.type !== 'result') return false;
      if (studentFilter === 'drive' && n.type !== 'drive') return false;
      if (studentFilter === 'event' && n.type !== 'event') return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-500 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Announcements & Notifications
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              {isStudent
                ? 'Stay updated on interview shortlists, placement announcements, & training events.'
                : 'Manage and broadcast targeted announcements across college departments and student batches.'}
            </p>
          </div>
        </div>

        {/* Officer/Coordinator Action Button */}
        {!isStudent && (
          <Link
            to="/notifications/new"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-900 hover:bg-primary-700 text-white font-heading font-medium text-xs rounded-lg shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Broadcast Announcement</span>
          </Link>
        )}
      </div>

      {/* Student View Filter Bar */}
      {isStudent && (
        <div className="flex border-b border-border-subtle bg-bg-surface rounded-xl p-1.5 shadow-2xs">
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'result', label: 'Results & Shortlists' },
            { id: 'drive', label: 'Drive Updates' },
            { id: 'event', label: 'Training & Events' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStudentFilter(tab.id)}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                studentFilter === tab.id
                  ? 'bg-primary-900 text-white font-bold shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-base'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="bg-bg-surface p-4 border border-border-subtle rounded-xl shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search announcements by title or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Content Feed */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No announcements found"
          description="There are currently no announcements matching your filter criteria."
          icon={Bell}
        />
      ) : isStudent ? (
        /* Student Feed Cards with Unread Left Accent Bar */
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs relative overflow-hidden transition-all ${
                item.isUnread ? 'border-l-4 border-l-accent-500 bg-primary-100/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'result'
                        ? 'bg-success-100 text-success-600'
                        : item.type === 'drive'
                        ? 'bg-info-100 text-info-600'
                        : 'bg-warning-100 text-warning-600'
                    }`}
                  >
                    {item.type === 'result' ? 'Shortlist Result' : item.type === 'drive' ? 'Drive Announcement' : 'Event'}
                  </span>
                  {item.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
                  )}
                </div>
                <span className="text-[11px] text-text-muted font-medium">{item.sentAt}</span>
              </div>

              <h3 className="font-heading text-base font-bold text-primary-900 mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                {item.body}
              </p>

              <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border-subtle">
                <span>Audience: <strong>{item.audience}</strong></span>
                <span>Sent by: <strong>{item.sentBy}</strong></span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Officer & Coordinator Sent Announcements Table */
        <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Announcement Title</th>
                  <th className="py-3 px-4">Audience Scope</th>
                  <th className="py-3 px-4">Sent By</th>
                  <th className="py-3 px-4">Sent Date</th>
                  <th className="py-3 px-4 text-right">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-primary">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-bg-base transition-colors">
                    <td className="py-3.5 px-4 max-w-md">
                      <span className="font-bold text-primary-900 block">{item.title}</span>
                      <span className="text-[11px] text-text-muted line-clamp-1">{item.body}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-text-secondary">{item.audience}</td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">{item.sentBy}</td>
                    <td className="py-3.5 px-4 text-text-muted">{item.sentAt}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-primary-100 text-primary-900">
                        {item.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
