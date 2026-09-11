import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export function StudentFilterBar({
  filters,
  onFilterChange,
  onReset,
  isTpo = false,
}) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 shadow-2xs space-y-3">
      {/* Search Input & Reset Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by student name or PRN..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-base border border-border-subtle rounded-lg transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Select Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {/* Department Filter (Officer Only) */}
        {isTpo && (
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={filters.department || ''}
              onChange={(e) => onFilterChange('department', e.target.value)}
              className="w-full py-1.5 px-2.5 bg-bg-base border border-border-subtle rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Departments</option>
              <option value="Computer">Computer</option>
              <option value="IT">IT</option>
              <option value="AI&DS">AI & DS</option>
              <option value="ENTC">ENTC</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>
        )}

        {/* Branch Filter */}
        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
            Branch
          </label>
          <select
            value={filters.branch || ''}
            onChange={(e) => onFilterChange('branch', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-bg-base border border-border-subtle rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Branches</option>
            <option value="Computer">Computer</option>
            <option value="IT">IT</option>
            <option value="AI&DS">AI & DS</option>
            <option value="ENTC">ENTC</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>
        </div>

        {/* Admission Year Filter */}
        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
            Admission Year
          </label>
          <select
            value={filters.admissionYear || ''}
            onChange={(e) => onFilterChange('admissionYear', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-bg-base border border-border-subtle rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Years</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
        </div>

        {/* CGPA Range Filter */}
        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
            CGPA Min
          </label>
          <select
            value={filters.cgpaMin || ''}
            onChange={(e) => onFilterChange('cgpaMin', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-bg-base border border-border-subtle rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All CGPAs</option>
            <option value="8.0">≥ 8.0 CGPA</option>
            <option value="7.0">≥ 7.0 CGPA</option>
            <option value="6.0">≥ 6.0 CGPA</option>
            <option value="5.0">≥ 5.0 CGPA</option>
          </select>
        </div>

        {/* Backlog Status Filter */}
        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
            Active Backlogs
          </label>
          <select
            value={filters.backlogStatus || ''}
            onChange={(e) => onFilterChange('backlogStatus', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-bg-base border border-border-subtle rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Backlog Status</option>
            <option value="0">0 Active Backlogs (Clean)</option>
            <option value="1">Max 1 Backlog</option>
            <option value="2">Max 2 Backlogs</option>
          </select>
        </div>

        {/* Placement Status Filter */}
        <div>
          <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
            Placement Status
          </label>
          <select
            value={filters.placementStatus || ''}
            onChange={(e) => onFilterChange('placementStatus', e.target.value)}
            className="w-full py-1.5 px-2.5 bg-bg-base border border-border-subtle rounded-md text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Unplaced">Unplaced</option>
            <option value="Shortlisted">Shortlisted</option>
          </select>
        </div>
      </div>
    </div>
  );
}
