import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { createCoordinatorApi } from '../../api/coordinators';
import { getDepartmentsApi } from '../../api/departments';
import { UserPlus, ArrowLeft, Building2, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';

const coordinatorSchema = z.object({
  name: z.string().min(3, 'Coordinator name required'),
  email: z.string().email('Valid institutional email required'),
  phone: z.string().optional(),
  departmentId: z.preprocess((val) => Number(val), z.number().min(1, 'Select assigned department')),
  sendCredentials: z.boolean().default(true),
});

export function CoordinatorCreatePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(coordinatorSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      departmentId: 1,
      sendCredentials: true,
    },
  });

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await getDepartmentsApi();
        const list = res.data || res || [];
        setDepartments(list);
        if (list.length > 0) {
          setValue('departmentId', list[0].id);
        }
      } catch (err) {
        console.warn('Could not load departments from API:', err);
      }
    };
    loadDepartments();
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      await createCoordinatorApi({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        departmentId: Number(data.departmentId),
      });

      addToast(`Coordinator account created for ${data.name}! Credentials sent to ${data.email}.`, 'success');
      navigate('/coordinators');
    } catch (err) {
      console.error('Coordinator creation error:', err);
      const msg = err?.response?.data?.message || 'Failed to create coordinator. Please try again.';
      setServerError(msg);
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
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

      {serverError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-text-primary mb-1">
            Coordinator Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Prof. Aniket S. Joshi"
            {...register('name')}
            className="w-full text-xs p-2.5 rounded-lg border border-border-subtle bg-bg-base focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {errors.name && <p className="text-critical text-[11px] mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-text-primary mb-1">
            Institutional Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <input
              type="email"
              placeholder="aniket.joshi@rcpit.ac.in"
              {...register('email')}
              className="w-full text-xs pl-9 p-2.5 rounded-lg border border-border-subtle bg-bg-base focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          {errors.email && <p className="text-critical text-[11px] mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-text-primary mb-1">
            Contact Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <input
              type="tel"
              placeholder="+91 98234 56789"
              {...register('phone')}
              className="w-full text-xs pl-9 p-2.5 rounded-lg border border-border-subtle bg-bg-base focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-primary mb-1">
            Assigned Engineering Department *
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <select
              {...register('departmentId')}
              className="w-full text-xs pl-9 p-2.5 rounded-lg border border-border-subtle bg-bg-base focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))
              ) : (
                <>
                  <option value={1}>Computer Engineering</option>
                  <option value={2}>Information Technology</option>
                  <option value={3}>Artificial Intelligence and Data Science</option>
                  <option value={4}>Electronics and Telecommunication Engineering</option>
                  <option value={5}>Mechanical Engineering</option>
                  <option value={6}>Civil Engineering</option>
                  <option value={7}>Electrical Engineering</option>
                </>
              )}
            </select>
          </div>
          {errors.departmentId && <p className="text-critical text-[11px] mt-1">{errors.departmentId.message}</p>}
        </div>

        <div className="pt-2">
          <label className="flex items-center space-x-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              {...register('sendCredentials')}
              className="rounded border-border-subtle text-primary-900 focus:ring-primary-500"
            />
            <span>Send default login credentials to coordinator email address</span>
          </label>
        </div>

        <div className="pt-4 border-t border-border-subtle flex items-center justify-end space-x-3">
          <Link
            to="/coordinators"
            className="px-4 py-2 border border-border-subtle text-xs font-semibold text-text-secondary hover:bg-bg-base rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-900 hover:bg-primary-700 text-white font-heading font-medium text-xs rounded-lg shadow-sm transition-all flex items-center space-x-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <span>Provisioning Account...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Create Coordinator Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
