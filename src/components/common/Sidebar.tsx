'use client';

import React from 'react';
import type { LearningUnit, User } from '@/types';
import {
  IconBook,
  IconPlus,
  IconAlertTriangle,
  IconShieldCheck,
  IconX,
} from '../icons/Icons';

interface SidebarProps {
  units: LearningUnit[];
  activeUnitId: string | null;
  onSelectUnit: (unitId: string) => void;
  onGoToDashboard: () => void;
  onOpenNewUnit: () => void;
  onOpenQualityOverview: () => void;
  currentUser: User;
  onOpenAuth: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentView: 'dashboard' | 'workspace' | 'quality-overview';
}

export function Sidebar({
  units,
  activeUnitId,
  onSelectUnit,
  onGoToDashboard,
  onOpenNewUnit,
  onOpenQualityOverview,
  currentUser,
  onOpenAuth,
  isMobileOpen,
  onCloseMobile,
  currentView,
}: SidebarProps) {
  const totalWarnings = units.reduce(
    (acc, u) => acc + (u.qualityWarnings?.length || 0),
    0
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isMobileOpen ? 'visible' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">LF</div>
          <div className="flex-1 min-w-0">
            <div className="sidebar-brand-name">LessonFoundry</div>
            <div className="sidebar-brand-sub">Curriculum Copilot</div>
          </div>
          {isMobileOpen && (
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-icon"
              onClick={onCloseMobile}
              aria-label="Close menu"
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-label">Navigation</div>
            <button
              type="button"
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                onGoToDashboard();
                onCloseMobile();
              }}
            >
              <IconBook className="nav-icon" />
              <span>All Units</span>
              <span className="nav-badge">{units.length}</span>
            </button>

            <button
              type="button"
              className="nav-item"
              onClick={() => {
                onOpenNewUnit();
                onCloseMobile();
              }}
            >
              <IconPlus className="nav-icon" />
              <span>New Unit</span>
            </button>

            <button
              type="button"
              className={`nav-item ${currentView === 'quality-overview' ? 'active' : ''}`}
              onClick={() => {
                onOpenQualityOverview();
                onCloseMobile();
              }}
            >
              <IconAlertTriangle className="nav-icon" />
              <span>Quality Audit</span>
              {totalWarnings > 0 && (
                <span
                  className="nav-badge"
                  style={{
                    backgroundColor: 'var(--status-review-bg)',
                    color: 'var(--status-review-text)',
                    border: '1px solid var(--status-review-border)',
                  }}
                >
                  {totalWarnings}
                </span>
              )}
            </button>
          </div>

          <div className="sidebar-section" style={{ marginTop: 'var(--space-4)' }}>
            <div className="sidebar-section-label">Learning Units</div>
            {units.map((unit) => {
              const isSelected = currentView === 'workspace' && activeUnitId === unit.id;

              return (
                <button
                  key={unit.id}
                  type="button"
                  className={`nav-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    onSelectUnit(unit.id);
                    onCloseMobile();
                  }}
                  title={unit.title}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor:
                        unit.status === 'Approved'
                          ? 'var(--color-success-600)'
                          : unit.status === 'Needs Review'
                          ? 'var(--color-warning-500)'
                          : unit.status === 'Generating'
                          ? 'var(--color-brand-500)'
                          : 'var(--color-neutral-400)',
                      flexShrink: 0,
                    }}
                  />
                  <span className="truncate" style={{ fontSize: 'var(--text-xs)' }}>
                    {unit.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sidebar-section" style={{ marginTop: 'var(--space-6)', padding: '0 var(--space-4)' }}>
            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--color-brand-50)',
                border: '1px solid var(--color-brand-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-brand-900)',
              }}
            >
              <div className="flex items-center gap-1 font-semibold" style={{ marginBottom: '2px' }}>
                <IconShieldCheck size={14} style={{ color: 'var(--color-brand-600)' }} />
                <span>Pedagogical Guard</span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-brand-700)', lineHeight: '1.4' }}>
                All generated materials are strictly referenced to trusted source documents.
              </p>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer / Teacher Profile */}
        <div className="sidebar-footer">
          <div
            className="user-info"
            onClick={onOpenAuth}
            role="button"
            tabIndex={0}
            title="Account settings & switch user"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenAuth();
            }}
          >
            <div className="user-avatar">{currentUser.avatarInitials}</div>
            <div className="user-details truncate">
              <div className="user-name truncate">{currentUser.name}</div>
              <div className="user-email truncate">
                {currentUser.role === 'teacher' ? 'Teacher' : 'Admin'} • {currentUser.email}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
