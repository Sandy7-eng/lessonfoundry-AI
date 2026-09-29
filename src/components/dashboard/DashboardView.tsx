'use client';

import React, { useState, useMemo } from 'react';
import type { LearningUnit } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconBook,
  IconFileText,
  IconCheckCircle,
  IconAlertTriangle,
  IconEye,
  IconTrash,
  IconCopy,
} from '../icons/Icons';

interface DashboardViewProps {
  units: LearningUnit[];
  onSelectUnit: (unitId: string) => void;
  onOpenNewUnit: () => void;
  onOpenStudentMode: (unitId: string) => void;
  onDeleteUnit: (unitId: string) => void;
  onDuplicateUnit: (unitId: string) => void;
}

export function DashboardView({
  units,
  onSelectUnit,
  onOpenNewUnit,
  onOpenStudentMode,
  onDeleteUnit,
  onDuplicateUnit,
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Subjects derived from current units
  const availableSubjects = useMemo(() => {
    const subs = new Set(units.map((u) => u.subject));
    return ['All', ...Array.from(subs)];
  }, [units]);

  // Filtered units
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        unit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.targetLevel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject =
        selectedSubject === 'All' || unit.subject === selectedSubject;
      const matchesStatus =
        selectedStatus === 'All' || unit.status === selectedStatus;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [units, searchQuery, selectedSubject, selectedStatus]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = units.length;
    const needsReview = units.filter((u) => u.status === 'Needs Review').length;
    const approved = units.filter((u) => u.status === 'Approved').length;
    const totalSources = units.reduce((acc, u) => acc + (u.sources?.length || 0), 0);
    return { total, needsReview, approved, totalSources };
  }, [units]);

  return (
    <div className="content-area-wide">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Curriculum Units</h1>
            <p className="page-subtitle">
              Verified, source-grounded learning packs for secondary and further education.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenNewUnit}
          >
            <IconPlus size={18} />
            <span>Create New Unit</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-8)' }}>
        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase" style={{ letterSpacing: '0.05em' }}>
            Total Units
          </div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-brand-900)' }}>
            {stats.total}
          </div>
          <div className="text-xs text-secondary mt-1">Across all departments</div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-medium uppercase" style={{ color: 'var(--color-warning-700)', letterSpacing: '0.05em' }}>
            Needs Review
          </div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-warning-700)' }}>
            {stats.needsReview}
          </div>
          <div className="text-xs text-secondary mt-1">Awaiting teacher sign-off</div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-medium uppercase" style={{ color: 'var(--color-success-700)', letterSpacing: '0.05em' }}>
            Approved
          </div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-success-700)' }}>
            {stats.approved}
          </div>
          <div className="text-xs text-secondary mt-1">Ready for classroom release</div>
        </div>

        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase" style={{ letterSpacing: '0.05em' }}>
            Source Documents
          </div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-brand-600)' }}>
            {stats.totalSources}
          </div>
          <div className="text-xs text-secondary mt-1">Verified references</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card p-4 mb-6 flex items-center gap-4 flex-wrap"
        style={{ backgroundColor: 'var(--color-white)' }}
      >
        <div className="input-group flex-1" style={{ minWidth: '220px' }}>
          <span className="input-addon-left">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            className="input input-has-left"
            placeholder="Search by topic, subject, or level..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-subject" className="text-xs font-medium text-secondary flex items-center gap-1">
            <IconFilter size={14} /> Subject:
          </label>
          <select
            id="filter-subject"
            className="select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-status" className="text-xs font-medium text-secondary">
            Status:
          </label>
          <select
            id="filter-status"
            className="select"
            style={{ width: 'auto', minWidth: '130px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Generating">Generating</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        {(searchQuery || selectedSubject !== 'All' || selectedStatus !== 'All') && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedSubject('All');
              setSelectedStatus('All');
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <div className="card empty-state">
          <IconBook className="empty-state-icon" />
          <div className="empty-state-title">No matching units found</div>
          <p className="empty-state-desc">
            {units.length === 0
              ? 'Get started by creating your first learning unit from syllabus documents.'
              : 'Try adjusting your search criteria or filters.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenNewUnit}
          >
            <IconPlus size={16} />
            <span>Create Unit</span>
          </button>
        </div>
      ) : (
        <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
          {filteredUnits.map((unit) => {
            const hasWarnings = (unit.qualityWarnings?.length || 0) > 0;
            const statusClass =
              unit.status === 'Approved'
                ? 'badge-approved'
                : unit.status === 'Needs Review'
                ? 'badge-review'
                : unit.status === 'Generating'
                ? 'badge-generating'
                : 'badge-draft';

            return (
              <div
                key={unit.id}
                className="card card-hover flex flex-col"
                onClick={() => onSelectUnit(unit.id)}
              >
                <div className="card-header flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-brand">{unit.subject}</span>
                      <span className="badge badge-neutral">{unit.targetLevel}</span>
                    </div>
                    <h3
                      className="font-semibold text-lg"
                      style={{ color: 'var(--color-brand-900)', marginTop: '4px' }}
                    >
                      {unit.title}
                    </h3>
                  </div>
                  <span className={`badge ${statusClass}`}>{unit.status}</span>
                </div>

                <div className="card-body flex-1">
                  {/* Status indicators */}
                  <div
                    className="flex items-center gap-4 flex-wrap text-xs text-secondary"
                    style={{ marginBottom: 'var(--space-4)' }}
                  >
                    <span className="flex items-center gap-1">
                      <IconFileText size={14} />
                      <strong>{unit.sources?.length || 0}</strong> Sources
                    </span>
                    <span className="flex items-center gap-1">
                      <IconBook size={14} />
                      <strong>{unit.objectives?.length || 0}</strong> Objectives
                    </span>
                    <span className="flex items-center gap-1">
                      <IconCheckCircle size={14} />
                      <strong>{unit.assets?.length || 0}</strong> Pack Assets
                    </span>
                  </div>

                  {/* Warning summary if any */}
                  {hasWarnings && (
                    <div
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius)',
                        backgroundColor: 'var(--status-review-bg)',
                        border: '1px solid var(--status-review-border)',
                        color: 'var(--status-review-text)',
                        fontSize: 'var(--text-xs)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                      }}
                    >
                      <IconAlertTriangle size={14} />
                      <span>
                        {unit.qualityWarnings.length} pedagogical quality alert
                        {unit.qualityWarnings.length > 1 ? 's' : ''} detected
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="card-footer flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs text-secondary">
                    Updated {formatDate(unit.updatedAt)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenStudentMode(unit.id)}
                      title="Preview Student Mode"
                    >
                      <IconEye size={14} />
                      <span>Student View</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectUnit(unit.id)}
                    >
                      <span>Open Workspace</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => onDuplicateUnit(unit.id)}
                      title="Duplicate Unit"
                    >
                      <IconCopy size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => {
                        if (confirm(`Delete unit "${unit.title}"?`)) {
                          onDeleteUnit(unit.id);
                        }
                      }}
                      title="Delete Unit"
                      style={{ color: 'var(--color-error-600)' }}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
