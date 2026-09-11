import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { UserPlus, ArrowLeft, Building2, Mail, CheckCircle } from 'lucide-react';

const coordinatorSchema = z.object({
  name: z.string().min(3, 'Coordinator name required'),
  email: z.string().email('Valid institutional email required'),
  department: z.string().min(1, 'Select assigned department'),
  sendCredentials: z.boolean().default(true),
});

export function CoordinatorCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(coordinatorSchema),
    defaultValues: {
      name: '',
      email: '',
      department: 'Computer Engineering',
      sendCredentials: true,
    },
  });

  const onSubmit = (data) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast(`Coordinator account created for ${data.name}! Credentials sent to ${data.email}.`, 'success');
      navigate('/coordinators');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link
          to="/coordinators"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-text-secondary hover:text-primary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Coordinators List</span>
        </Link>
      </div>

      <div className="bg-primary-900 text-white p-6 rounded-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Provision Department Coordinator
            </h1>
            <p className="text-primary-100/80 text-xs mt-0.5">
              Create coordinator login credentials scoped to a specific department.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Prof. Aniket Joshi"
            {...register('name')}
            className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.name && <p className="text-xs text-error-600 mt-1 font-medium">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
            Institutional Email Address *
          </label>
          <input
            type="email"
            placeholder="e.g. aniket.joshi@rcpit.ac.in"
            {...register('email')}
            className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.email && <p className="text-xs text-error-600 mt-1 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
            Assigned Department *
          </label>
          <select
            {...register('department')}
            className="w-full px-3 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
          >
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="AI & Data Science">AI & Data Science</option>
            <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="sendCredentials"
            {...register('sendCredentials')}
            className="w-4 h-4 text-primary-500 border-border-subtle rounded focus:ring-primary-500"
          />
          <label htmlFor="sendCredentials" className="text-xs text-text-primary font-medium">
            Send auto-generated login credentials via email immediately
          </label>
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t border-border-subtle">
          <Link to="/coordinators" className="px-4 py-2 text-xs font-semibold text-text-secondary border border-border-subtle rounded-lg">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-900 hover:bg-primary-700 text-white font-heading font-semibold text-xs rounded-lg shadow-sm disabled:opacity-60 transition-all"
          >
            {isSubmitting ? 'Creating...' : 'Provision Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
