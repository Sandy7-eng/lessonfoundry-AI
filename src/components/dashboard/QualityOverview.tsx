'use client';

import React from 'react';
import type { LearningUnit } from '@/types';
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconInfo,
  IconCheckCircle,
  IconEye,
} from '../icons/Icons';

interface QualityOverviewProps {
  units: LearningUnit[];
  onSelectUnit: (unitId: string) => void;
}

export function QualityOverview({ units, onSelectUnit }: QualityOverviewProps) {
  // Aggregate all warnings across units
  const allWarnings = units.flatMap((u) =>
    (u.qualityWarnings || []).map((w) => ({
      ...w,
      unitId: u.id,
      unitTitle: u.title,
      subject: u.subject,
    }))
  );

  const errorCount = allWarnings.filter((w) => w.severity === 'Error').length;
  const warningCount = allWarnings.filter((w) => w.severity === 'Warning').length;
  const infoCount = allWarnings.filter((w) => w.severity === 'Info').length;

  return (
    <div className="content-area-wide">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Pedagogical Quality Audit</h1>
            <p className="page-subtitle">
              Centralized inspection of answer leakage risks, unaligned objectives, and syllabus coverage across all units.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-8)' }}>
        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase">Total Warnings</div>
          <div className="font-bold text-2xl mt-1">{allWarnings.length}</div>
          <div className="text-xs text-secondary mt-1">Across {units.length} learning units</div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-medium uppercase" style={{ color: 'var(--color-error-700)' }}>
            Critical / Leakage
          </div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-error-700)' }}>
            {errorCount}
          </div>
          <div className="text-xs text-secondary mt-1">Answer reveal risks</div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-medium uppercase" style={{ color: 'var(--color-warning-700)' }}>
            Alignment Warnings
          </div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-warning-700)' }}>
            {warningCount}
          </div>
          <div className="text-xs text-secondary mt-1">Partial LO coverage</div>
        </div>

        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase">Pedagogical Suggestions</div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-brand-600)' }}>
            {infoCount}
          </div>
          <div className="text-xs text-secondary mt-1">Difficulty &amp; vocabulary notes</div>
        </div>
      </div>

      {/* All Warnings Feed */}
      {allWarnings.length === 0 ? (
        <div className="card empty-state">
          <IconCheckCircle size={48} style={{ color: 'var(--color-success-600)' }} />
          <div className="empty-state-title">Audit Clear: Zero Pedagogical Defects</div>
          <p className="empty-state-desc">
            All curriculum units have satisfied source-grounding, objective alignment, and reveal policy criteria.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {allWarnings.map((w) => {
            const isError = w.severity === 'Error';
            const isWarn = w.severity === 'Warning';

            return (
              <div
                key={w.id}
                className={`quality-warning severity-${w.severity.toLowerCase()}`}
                style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {isError ? (
                    <IconAlertCircle size={20} style={{ color: 'var(--color-error-600)' }} />
                  ) : isWarn ? (
                    <IconAlertTriangle size={20} style={{ color: 'var(--color-warning-600)' }} />
                  ) : (
                    <IconInfo size={20} style={{ color: 'var(--color-brand-600)' }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          isError
                            ? 'badge-revision'
                            : isWarn
                            ? 'badge-review'
                            : 'badge-brand'
                        }`}
                      >
                        {w.severity}: {w.type}
                      </span>
                      <span className="badge badge-brand">{w.subject}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-brand-900)' }}>
                        Unit: {w.unitTitle}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectUnit(w.unitId)}
                    >
                      <IconEye size={14} /> Open Unit Workspace
                    </button>
                  </div>

                  <h4 className="font-semibold text-sm mt-2 mb-1">
                    {w.problem}
                  </h4>
                  <p className="text-xs text-secondary mb-2" style={{ lineHeight: '1.5' }}>
                    {w.explanation}
                  </p>
                  <div className="text-xs p-2 rounded border" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-border)' }}>
                    <strong>Remedy:</strong> {w.suggestedAction}
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
