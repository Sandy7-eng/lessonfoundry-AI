'use client';

import React from 'react';
import type { LearningUnit } from '@/types';
import {
  IconMenu,
  IconEye,
  IconPlus,
  IconBook,
  IconChevronRight,
} from '../icons/Icons';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  activeUnit?: LearningUnit | null;
  currentView: 'dashboard' | 'workspace' | 'quality-overview';
  onGoToDashboard: () => void;
  onOpenNewUnit: () => void;
  onOpenStudentMode: () => void;
  onOpenQualityOverview: () => void;
}

export function Header({
  onToggleMobileMenu,
  activeUnit,
  currentView,
  onGoToDashboard,
  onOpenNewUnit,
  onOpenStudentMode,
  onOpenQualityOverview,
}: HeaderProps) {
  return (
    <header className="app-header">
      {/* Mobile Hamburger */}
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-icon"
        onClick={onToggleMobileMenu}
        aria-label="Open navigation menu"
        style={{ display: 'none' }}
        id="mobile-menu-trigger"
      >
        <IconMenu size={20} />
      </button>

      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onGoToDashboard}
          style={{ padding: 'var(--space-1) var(--space-2)' }}
        >
          <IconBook size={16} />
          <span>Units</span>
        </button>

        {currentView === 'workspace' && activeUnit && (
          <>
            <IconChevronRight size={14} className="text-tertiary" />
            <span className="truncate font-semibold text-sm">
              {activeUnit.title}
            </span>
            <span
              className={`badge badge-${
                activeUnit.status === 'Approved'
                  ? 'approved'
                  : activeUnit.status === 'Needs Review'
                  ? 'review'
                  : activeUnit.status === 'Generating'
                  ? 'generating'
                  : 'draft'
              }`}
              style={{ marginLeft: 'var(--space-2)' }}
            >
              {activeUnit.status}
            </span>
          </>
        )}

        {currentView === 'quality-overview' && (
          <>
            <IconChevronRight size={14} className="text-tertiary" />
            <span className="font-semibold text-sm">Quality Audit</span>
          </>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {currentView === 'workspace' && activeUnit && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenStudentMode}
            title="Preview how students view this learning pack"
          >
            <IconEye size={16} />
            <span className="hide-sm">Student View</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onOpenQualityOverview}
          title="View pedagogical quality audit across units"
        >
          <span>Quality Audit</span>
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenNewUnit}
        >
          <IconPlus size={16} />
          <span>New Unit</span>
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          #mobile-menu-trigger {
            display: inline-flex !important;
          }
          .hide-sm {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
