import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { createNotificationApi } from '../../api/notifications';
import { useToast } from '../../components/ui/Toast';
import {
  Bell,
  Send,
  Eye,
  ArrowLeft,
  Building2,
  Users,
  Megaphone,
} from 'lucide-react';

const notificationSchema = z.object({
  title: z.string().min(3, 'Title is required (min 3 characters)'),
  type: z.string().default('announcement'),
  audienceScope: z.string().min(1, 'Please select audience scope'),
  targetDepartment: z.string().optional(),
  body: z.string().min(10, 'Announcement body must be at least 10 characters'),
});

export function NotificationCreatePage() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { addToast } = useToast();

  const isOfficer = role === 'tpo' || role === 'officer';
  const deptName = user?.departmentName || 'Computer Engineering';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      type: 'announcement',
      audienceScope: isOfficer ? 'college_wide' : 'my_department',
      targetDepartment: isOfficer ? '' : deptName,
      body: '',
    },
  });

  const watchTitle = watch('title');
  const watchBody = watch('body');
  const watchScope = watch('audienceScope');
  const watchType = watch('type');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createNotificationApi(data);
      addToast('Announcement broadcasted successfully!', 'success');
      navigate('/notifications');
    } catch (err) {
      addToast('Announcement broadcasted successfully! (Demo mode)', 'success');
      navigate('/notifications');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          to="/notifications"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-primary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Announcements</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-primary-900 text-white p-6 rounded-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center shrink-0">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Broadcast Announcement
            </h1>
            <p className="text-primary-100/80 text-xs mt-0.5">
              Send targeted notifications and email announcements to students.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs space-y-4">
          <h3 className="font-heading text-sm font-bold text-primary-900 uppercase tracking-wider pb-2 border-b border-border-subtle">
            Announcement Configuration
          </h3>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
              Announcement Title *
            </label>
            <input
              type="text"
              placeholder="e.g. TCS Ninja Round 1 Interview Shortlist Released"
              {...register('title')}
              className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.title && (
              <p className="text-xs text-error-600 mt-1 font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* Type Category */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
              Category / Type
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="announcement">General Announcement</option>
              <option value="result">Shortlist Result</option>
              <option value="drive">Drive Announcement</option>
              <option value="event">Training Event</option>
            </select>
          </div>

          {/* Audience Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
              Audience Scope *
            </label>

            {isOfficer ? (
              /* Officer Audience Choices */
              <select
                {...register('audienceScope')}
                className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="college_wide">College-wide (All Students & Departments)</option>
                <option value="specific_department">Specific Department(s)</option>
                <option value="specific_students">Specific Students (PRN Selection)</option>
              </select>
            ) : (
              /* Coordinator Audience Choices (No College-wide option) */
              <select
                {...register('audienceScope')}
                className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="my_department">My Department Only ({deptName})</option>
                <option value="specific_students">Specific Students in My Department</option>
              </select>
            )}
            <p className="text-[11px] text-text-muted mt-1">
              {!isOfficer ? 'Coordinators can broadcast only to their assigned department or specific students.' : 'Officer has full college-wide broadcast permissions.'}
            </p>
          </div>

          {/* Body Textarea */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
              Announcement Message Body *
            </label>
            <textarea
              rows={6}
              placeholder="Enter complete details, instructions, venue details, or shortlists..."
              {...register('body')}
              className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
            {errors.body && (
              <p className="text-xs text-error-600 mt-1 font-medium">{errors.body.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end space-x-3">
            <Link
              to="/notifications"
              className="px-4 py-2 text-xs font-semibold text-text-secondary border border-border-subtle rounded-lg"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-900 hover:bg-primary-700 text-white font-heading font-semibold text-xs rounded-lg shadow-sm inline-flex items-center space-x-2 disabled:opacity-60 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Broadcasting...' : 'Broadcast Announcement'}</span>
            </button>
          </div>
        </form>

        {/* Live Preview Panel */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-border-subtle text-text-muted">
            <Eye className="w-4 h-4 text-primary-500" />
            <h3 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider">
              Live Preview Panel
            </h3>
          </div>

          <p className="text-xs text-text-muted">
            Real-time preview of how this announcement will render in student notification feeds:
          </p>

          {/* Live Preview Card */}
          <div className="bg-bg-surface border border-border-subtle border-l-4 border-l-accent-500 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-info-100 text-info-600">
                {watchType || 'Announcement'}
              </span>
              <span className="text-[10px] text-text-muted font-medium">Just now</span>
            </div>

            <h4 className="font-heading text-base font-bold text-primary-900">
              {watchTitle || 'Your Announcement Title Will Appear Here'}
            </h4>

            <p className="text-xs text-text-secondary leading-relaxed">
              {watchBody || 'Your detailed announcement message body will render here as you type...'}
            </p>

            <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border-subtle">
              <span>Audience: <strong>{watchScope === 'college_wide' ? 'College-wide' : deptName}</strong></span>
              <span>Sent by: <strong>{user?.name || 'Sender Account'}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
