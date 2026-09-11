import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { getEventsApi } from '../../api/events';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Calendar as CalendarIcon,
  Plus,
  LayoutGrid,
  List,
  MapPin,
  Clock,
  Download,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';

export function EventsPage() {
  const { user, role } = useAuth();
  const isStudent = role === 'student';
  const isOfficer = role === 'tpo' || role === 'officer';

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  // TanStack Query to fetch events
  const { data, isLoading } = useQuery({
    queryKey: ['eventsList', role],
    queryFn: async () => {
      try {
        return await getEventsApi();
      } catch (err) {
        return null;
      }
    },
  });

  // Mock Events fallback for dev testing
  const fallbackEvents = [
    {
      id: 1,
      title: 'System Design & Microservices Architecture Masterclass',
      type: 'Workshop', // 'Workshop' | 'Industry Talk' | 'Mock Interview' | 'Aptitude Training'
      date: '2026-09-22',
      time: '02:00 PM - 05:00 PM',
      location: 'Seminar Hall B, Academic Block',
      audience: 'Computer & IT Departments',
      description: 'Hands-on training session on distributed systems, load balancing, and cloud architecture conducted by senior architects from Persistent Systems.',
      organizer: 'T&P Cell & Computer Dept',
    },
    {
      id: 2,
      title: 'Mock Technical Interview & Resume Feedback Session',
      type: 'Mock Interview',
      date: '2026-09-26',
      time: '10:00 AM - 04:00 PM',
      location: 'T&P Lab 3 & Conference Room',
      audience: 'All Registered 7th Semester Students',
      description: 'One-on-one mock interview simulation with alumni and industry HRs. Personalized resume optimization and body language feedback.',
      organizer: 'Main T&P Cell',
    },
    {
      id: 3,
      title: 'Industry Guest Lecture: Generative AI in Corporate Enterprise',
      type: 'Industry Talk',
      date: '2026-10-01',
      time: '11:30 AM - 01:00 PM',
      location: 'Main Auditorium, RCPIT Shirpur',
      audience: 'College-wide',
      description: 'Keynote talk by Vice President of Engineering at TCS on real-world applications of LLMs, Prompt Engineering, and enterprise AI transformation.',
      organizer: 'Training & Placement Cell',
    },
  ];

  const eventsList = data?.events || fallbackEvents;

  // Generate downloadable .ics iCalendar file client-side
  const handleDownloadIcs = (event) => {
    const icsContent =
      `BEGIN:VCALENDAR\n` +
      `VERSION:2.0\n` +
      `PRODID:-//PlaceTrack RCPIT//Training Event//EN\n` +
      `BEGIN:VEVENT\n` +
      `SUMMARY:${event.title}\n` +
      `DESCRIPTION:${event.description || ''}\n` +
      `LOCATION:${event.location || 'RCPIT Shirpur'}\n` +
      `END:VEVENT\n` +
      `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Training Sessions & Events
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Industry workshops, guest lectures, mock interview drives, & skill development sessions.
            </p>
          </div>
        </div>

        {!isStudent && (
          <Link
            to="/events/new"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-900 hover:bg-primary-700 text-white font-heading font-medium text-xs rounded-lg shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Event</span>
          </Link>
        )}
      </div>

      {/* View Toggle Bar */}
      <div className="flex items-center justify-between bg-bg-surface p-4 border border-border-subtle rounded-xl shadow-2xs">
        <div className="text-xs font-semibold text-text-secondary">
          <span>Total Scheduled Events: <strong>{eventsList.length}</strong></span>
        </div>

        <div className="flex items-center space-x-1 border border-border-subtle rounded-lg p-1 bg-bg-base">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded text-xs font-medium flex items-center space-x-1 ${
              viewMode === 'list' ? 'bg-white shadow-xs text-primary-900 font-bold' : 'text-text-muted'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-1.5 rounded text-xs font-medium flex items-center space-x-1 ${
              viewMode === 'calendar' ? 'bg-white shadow-xs text-primary-900 font-bold' : 'text-text-muted'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendar View</span>
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      ) : eventsList.length === 0 ? (
        <EmptyState
          title="No upcoming training events"
          description="There are currently no training workshops or mock interview drives scheduled."
          icon={CalendarIcon}
        />
      ) : viewMode === 'calendar' ? (
        /* Calendar Grid View Representation */
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs space-y-4">
          <h3 className="font-heading text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
            Monthly Event Schedule View
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eventsList.map((event) => (
              <div key={event.id} className="p-4 bg-bg-base border border-border-subtle rounded-xl space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-500/10 text-accent-500">
                  {event.date}
                </span>
                <h4 className="font-heading text-xs font-bold text-primary-900">{event.title}</h4>
                <p className="text-[11px] text-text-muted">{event.time} • {event.location}</p>
                {isStudent && (
                  <button
                    onClick={() => handleDownloadIcs(event)}
                    className="w-full py-1 px-2 mt-2 bg-white border border-border-subtle rounded text-[11px] font-semibold text-primary-700 hover:bg-primary-100 inline-flex items-center justify-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Add to Calendar (.ics)</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View (Default) */
        <div className="space-y-4">
          {eventsList.map((event) => (
            <div key={event.id} className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs space-y-4 hover:shadow-xs transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        event.type === 'Workshop'
                          ? 'bg-primary-100 text-primary-900'
                          : event.type === 'Industry Talk'
                          ? 'bg-accent-500/10 text-accent-500'
                          : 'bg-warning-100 text-warning-600'
                      }`}
                    >
                      {event.type}
                    </span>
                    <span className="text-[11px] text-text-muted">Target: <strong>{event.audience}</strong></span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-primary-900">
                    {event.title}
                  </h3>
                </div>

                {/* Student Download .ics Action Button */}
                {isStudent && (
                  <button
                    type="button"
                    onClick={() => handleDownloadIcs(event)}
                    className="px-3.5 py-2 bg-primary-100 hover:bg-primary-900 hover:text-white text-primary-900 font-heading font-semibold text-xs rounded-lg border border-primary-500/20 shadow-2xs inline-flex items-center space-x-1.5 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Add to Calendar (.ics)</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-text-secondary leading-relaxed p-3 bg-bg-base rounded-lg border border-border-subtle">
                {event.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted pt-2 border-t border-border-subtle font-medium">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1.5 text-primary-700 font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>{event.date} • {event.time}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-accent-500" />
                    <span>{event.location}</span>
                  </span>
                </div>
                <span>Organizer: <strong>{event.organizer}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
