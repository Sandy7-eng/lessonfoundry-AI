'use client';

import React from 'react';
import type { QualityWarning, Asset } from '@/types';
import {
  IconAlertTriangle,
  IconAlertCircle,
  IconInfo,
  IconCheckCircle,
  IconCheck,
  IconEye,
  IconShieldCheck,
} from '../icons/Icons';

interface QualityTabProps {
  warnings: QualityWarning[];
  assets: Asset[];
  onDismissWarning: (warningId: string) => void;
  onApplyFix: (warning: QualityWarning) => void;
  onViewAssetById: (assetId: string) => void;
}

export function QualityTab({
  warnings,
  assets,
  onDismissWarning,
  onApplyFix,
  onViewAssetById,
}: QualityTabProps) {
  const errors = warnings.filter((w) => w.severity === 'Error');
  const warningList = warnings.filter((w) => w.severity === 'Warning');
  const infos = warnings.filter((w) => w.severity === 'Info');

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div
        className="card p-4 flex items-center justify-between flex-wrap gap-4"
        style={{ backgroundColor: 'var(--color-white)' }}
      >
        <div>
          <div className="font-semibold text-sm flex items-center gap-2">
            <IconShieldCheck size={18} style={{ color: 'var(--color-brand-600)' }} />
            <span>Automated Pedagogical Quality Guard</span>
          </div>
          <p className="text-xs text-secondary mt-1">
            LessonFoundry continuously scans all {assets.length} generated lesson assets for answer key leakage, objective misalignment, vocabulary dissonance, and source hallucinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {errors.length > 0 && (
            <span className="badge badge-revision">{errors.length} Critical Issues</span>
          )}
          {warningList.length > 0 && (
            <span className="badge badge-review">{warningList.length} Warnings</span>
          )}
          {infos.length > 0 && (
            <span className="badge badge-neutral">{infos.length} Suggestions</span>
          )}
        </div>
      </div>

      {/* Warnings List */}
      {warnings.length === 0 ? (
        <div className="card empty-state" style={{ padding: 'var(--space-12) var(--space-8)' }}>
          <IconCheckCircle
            size={48}
            style={{ color: 'var(--color-success-600)', marginBottom: 'var(--space-2)' }}
          />
          <div className="empty-state-title">All Pedagogical Checks Passed</div>
          <p className="empty-state-desc">
            No answer leakage risks, unaligned objectives, or terminology errors detected in this learning unit.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {warnings.map((warn) => {
            const isError = warn.severity === 'Error';
            const isWarn = warn.severity === 'Warning';

            return (
              <div
                key={warn.id}
                className={`quality-warning severity-${warn.severity.toLowerCase()}`}
                style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {isError ? (
                    <IconAlertCircle
                      size={20}
                      style={{ color: 'var(--color-error-600)' }}
                    />
                  ) : isWarn ? (
                    <IconAlertTriangle
                      size={20}
                      style={{ color: 'var(--color-warning-600)' }}
                    />
                  ) : (
                    <IconInfo
                      size={20}
                      style={{ color: 'var(--color-brand-600)' }}
                    />
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
                        {warn.severity}: {warn.type}
                      </span>
                      <span className="text-xs text-secondary font-medium">
                        Target Asset: <strong>{warn.affectedAssetTitle}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onViewAssetById(warn.affectedAssetId)}
                      >
                        <IconEye size={14} /> Open Asset
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => onDismissWarning(warn.id)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  <h4 className="font-semibold text-sm mt-2 mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {warn.problem}
                  </h4>

                  <p className="text-xs text-secondary mb-3" style={{ lineHeight: '1.5' }}>
                    {warn.explanation}
                  </p>

                  <div
                    className="p-3 border rounded flex items-center justify-between flex-wrap gap-2 text-xs"
                    style={{
                      backgroundColor: 'var(--color-white)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div>
                      <strong>Recommended Action:</strong> {warn.suggestedAction}
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm text-xs"
                      onClick={() => onApplyFix(warn)}
                    >
                      <IconCheck size={14} /> Apply Remedy
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
