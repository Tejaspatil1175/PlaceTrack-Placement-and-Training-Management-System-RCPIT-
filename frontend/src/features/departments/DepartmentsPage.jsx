import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDepartmentsApi, createDepartmentApi } from '../../api/departments';
import { useToast } from '../../components/ui/Toast';
import { Building2, Users, GraduationCap, Briefcase, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export function DepartmentsPage() {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await getDepartmentsApi();
      const list = res.data || res || [];
      setDepartments(list);
    } catch (err) {
      console.warn('Could not load departments from API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    setIsSubmitting(true);
    try {
      await createDepartmentApi({ name: deptName.trim() });
      addToast(`Department '${deptName.trim()}' created successfully!`, 'success');
      setDeptName('');
      setShowAddModal(false);
      fetchDepartments();
    } catch (err) {
      console.error('Error creating department:', err);
      addToast(err?.response?.data?.message || 'Failed to create department', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Overview of RCPIT engineering departments, assigned coordinators, & student rosters.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-900 hover:bg-primary-700 text-white font-heading font-medium text-xs rounded-lg shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-border-subtle">
            <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
              Create New Department
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Enter the official branch / discipline name as registered at RCPIT.
            </p>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrical Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border-subtle bg-bg-base focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-xs font-semibold text-text-secondary hover:bg-bg-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !deptName.trim()}
                  className="px-4 py-2 bg-primary-900 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold disabled:opacity-60"
                >
                  {isSubmitting ? 'Creating...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Cards Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-text-muted bg-white rounded-xl border border-border-subtle">
          Loading departments from database...
        </div>
      ) : departments.length === 0 ? (
        <div className="p-8 text-center text-xs text-text-muted bg-white rounded-xl border border-border-subtle">
          No departments registered yet. Click "Add Department" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const coordinators = dept.users || [];
            return (
              <div
                key={dept.id}
                className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-primary-100 text-primary-900">
                        DEPT #{dept.id}
                      </span>
                      <h3 className="font-heading text-lg font-bold text-primary-900 mt-1">
                        {dept.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2.5 bg-bg-base rounded-lg border border-border-subtle">
                      <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                        Assigned Coordinator(s)
                      </span>
                      {coordinators.length > 0 ? (
                        <div className="space-y-1">
                          {coordinators.map((c) => (
                            <div key={c.id} className="font-semibold text-text-primary">
                              {c.name}{' '}
                              <span className="text-text-muted font-normal text-[11px]">
                                ({c.email})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-text-muted italic">No coordinator assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-semibold">
                  <Link
                    to="/students"
                    className="text-primary-600 hover:text-primary-800 inline-flex items-center space-x-1"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>View Students</span>
                  </Link>
                  <Link
                    to="/coordinators"
                    className="text-primary-600 hover:text-primary-800 inline-flex items-center space-x-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Manage Coordinator</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
