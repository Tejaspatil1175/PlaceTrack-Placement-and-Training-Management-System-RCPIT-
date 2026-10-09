import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCoordinatorsApi, deleteCoordinatorApi } from '../../api/coordinators';
import { useToast } from '../../components/ui/Toast';
import { Users, UserPlus, Mail, Building2, CheckCircle2, Trash2, Phone, AlertCircle } from 'lucide-react';

export function CoordinatorsPage() {
  const { addToast } = useToast();
  const [coordinators, setCoordinators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchCoordinators = async () => {
    setIsLoading(true);
    try {
      const res = await getCoordinatorsApi();
      const list = res.data || res || [];
      setCoordinators(list);
    } catch (err) {
      console.warn('Could not fetch coordinators from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove coordinator "${name}"?`)) {
      return;
    }
    setIsDeleting(id);
    try {
      await deleteCoordinatorApi(id);
      addToast(`Coordinator "${name}" removed successfully.`, 'success');
      setCoordinators((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Delete coordinator error:', err);
      addToast(err?.response?.data?.message || 'Failed to remove coordinator', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

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
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    Loading coordinators from database...
                  </td>
                </tr>
              ) : coordinators.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No coordinators provisioned yet. Click "Add New Coordinator" above to create one.
                  </td>
                </tr>
              ) : (
                coordinators.map((coord) => (
                  <tr key={coord.id} className="hover:bg-bg-base transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary-900">{coord.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      {coord.department?.name || coord.department || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary font-mono">{coord.email}</td>
                    <td className="py-3.5 px-4 text-text-muted">{coord.phone || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(coord.id, coord.name)}
                        disabled={isDeleting === coord.id}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove Coordinator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
