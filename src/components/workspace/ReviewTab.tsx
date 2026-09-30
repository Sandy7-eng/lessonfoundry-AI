'use client';

import React, { useState } from 'react';
import type { LearningUnit, UnitStatus } from '@/types';
import {
  IconCheckCircle,
  IconCheck,
  IconAlertTriangle,
  IconDownload,
  IconPrinter,
  IconCopy,
  IconEye,
  IconShieldCheck,
} from '../icons/Icons';

interface ReviewTabProps {
  unit: LearningUnit;
  onUpdateUnitStatus: (status: UnitStatus) => void;
  onApproveAllAssets: () => void;
  onOpenStudentMode: () => void;
  onViewAssetById: (assetId: string) => void;
}

export function ReviewTab({
  unit,
  onUpdateUnitStatus,
  onApproveAllAssets,
  onOpenStudentMode,
  onViewAssetById,
}: ReviewTabProps) {
  const [copied, setCopied] = useState(false);

  const approvedAssets = unit.assets.filter((asset) => asset.status === 'Approved');
  const approvedAssetsCount = unit.assets.filter((a) => a.status === 'Approved').length;
  const allAssetsApproved = approvedAssetsCount === unit.assets.length;
  const errorWarnings = unit.qualityWarnings.filter((w) => w.severity === 'Error');
  const hasErrors = errorWarnings.length > 0;

  const handleCopyPack = () => {
    const text = `# ${unit.title} — Learning Pack
Subject: ${unit.subject} | Level: ${unit.targetLevel}

${approvedAssets.map((a) => `\n---\n## ${a.type}: ${a.title}\n\n${a.content}`).join('\n\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const text = `# ${unit.title} — Learning Pack
Subject: ${unit.subject} | Level: ${unit.targetLevel}

${approvedAssets.map((a) => `\n---\n## ${a.type}: ${a.title}\n\n${a.content}`).join('\n\n')}
`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${unit.title.replace(/\s+/g, '_')}_Learning_Pack.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sign-off Banner */}
      <div className="card p-6" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`badge badge-${
                  unit.status === 'Approved'
                    ? 'approved'
                    : unit.status === 'Needs Review'
                    ? 'review'
                    : 'draft'
                }`}
              >
                Unit Status: {unit.status}
              </span>
              <span className="badge badge-brand">{unit.subject}</span>
              <span className="badge badge-neutral">{unit.targetLevel}</span>
            </div>
            <h3 className="font-bold text-xl mt-1" style={{ color: 'var(--color-brand-900)' }}>
              Teacher Sign-Off & Release
            </h3>
            <p className="text-xs text-secondary mt-1">
              Verify compliance checklist before publishing this unit for classroom distribution or student assignment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unit.status !== 'Approved' ? (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  onApproveAllAssets();
                }}
              >
                <IconCheck size={18} /> Approve Entire Unit
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onUpdateUnitStatus('Needs Review')}
              >
                Revert to Needs Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Readiness Checklist */}
      <div className="card p-6">
        <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
          <IconShieldCheck size={18} style={{ color: 'var(--color-brand-600)' }} />
          <span>Release Readiness Checklist</span>
        </h4>

        <div className="flex flex-col gap-3">
          {/* Check 1: Sources */}
          <div
            className="flex items-center justify-between p-3 border rounded"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: unit.sources.length > 0 ? 'var(--status-approved-bg)' : 'var(--color-neutral-50)',
            }}
          >
            <div className="flex items-center gap-3">
              <IconCheckCircle
                size={18}
                style={{
                  color: unit.sources.length > 0 ? 'var(--color-success-600)' : 'var(--color-neutral-400)',
                }}
              />
              <div>
                <div className="font-medium text-sm">Grounded Sources Verified</div>
                <div className="text-xs text-secondary">
                  {unit.sources.length} document{unit.sources.length > 1 ? 's' : ''} attached and cross-referenced.
                </div>
              </div>
            </div>
            <span className="badge badge-success">Passed</span>
          </div>

          {/* Check 2: Quality Warnings */}
          <div
            className="flex items-center justify-between p-3 border rounded"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: hasErrors ? 'var(--status-revision-bg)' : 'var(--status-approved-bg)',
            }}
          >
            <div className="flex items-center gap-3">
              {hasErrors ? (
                <IconAlertTriangle size={18} style={{ color: 'var(--color-error-600)' }} />
              ) : (
                <IconCheckCircle size={18} style={{ color: 'var(--color-success-600)' }} />
              )}
              <div>
                <div className="font-medium text-sm">Pedagogical Guard Checks</div>
                <div className="text-xs text-secondary">
                  {hasErrors
                    ? `${errorWarnings.length} critical answer leakage or alignment alert requiring fix.`
                    : 'Zero critical quality defects found.'}
                </div>
              </div>
            </div>
            <span className={`badge ${hasErrors ? 'badge-revision' : 'badge-success'}`}>
              {hasErrors ? 'Action Needed' : 'Passed'}
            </span>
          </div>

          {/* Check 3: Assets Approved */}
          <div
            className="flex items-center justify-between p-3 border rounded"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: allAssetsApproved ? 'var(--status-approved-bg)' : 'var(--status-review-bg)',
            }}
          >
            <div className="flex items-center gap-3">
              {allAssetsApproved ? (
                <IconCheckCircle size={18} style={{ color: 'var(--color-success-600)' }} />
              ) : (
                <IconAlertTriangle size={18} style={{ color: 'var(--color-warning-600)' }} />
              )}
              <div>
                <div className="font-medium text-sm">Individual Asset Approvals</div>
                <div className="text-xs text-secondary">
                  {approvedAssetsCount} of {unit.assets.length} assets reviewed and approved by teacher.
                </div>
              </div>
            </div>
            {allAssetsApproved ? (
              <span className="badge badge-success">All Approved</span>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onApproveAllAssets}
              >
                Approve Remaining
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Audit List */}
      <div className="card p-6">
        <h4 className="font-semibold text-base mb-4">Pack Asset Review Status</h4>
        <div className="flex flex-col gap-2">
          {unit.assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-3 border rounded"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="badge badge-neutral text-xs">{asset.type}</span>
                <span className="font-medium text-sm truncate">{asset.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`badge ${
                    asset.status === 'Approved'
                      ? 'badge-approved'
                      : asset.status === 'Needs Revision'
                      ? 'badge-revision'
                      : 'badge-draft'
                  }`}
                >
                  {asset.status}
                </span>
                {asset.review && (
                  <span className="text-xs text-secondary">
                    {asset.review.reviewerName} · {new Date(asset.review.reviewedAt).toLocaleString()}
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onViewAssetById(asset.id)}
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export & Actions */}
      <div className="card p-6">
        <h4 className="font-semibold text-base mb-4">Export & Distribution</h4>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadMarkdown}
            disabled={approvedAssetsCount === 0}
          >
            <IconDownload size={16} /> Download Markdown (.md)
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopyPack}
            disabled={approvedAssetsCount === 0}
          >
            <IconCopy size={16} />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Entire Pack'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
          >
            <IconPrinter size={16} /> Print / Save as PDF
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenStudentMode}
          >
            <IconEye size={16} /> Preview Student View
          </button>
        </div>
      </div>
    </div>
  );
}
