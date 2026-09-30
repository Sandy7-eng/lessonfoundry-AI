'use client';

import React, { useState, useMemo } from 'react';
import type { Asset, AssetStatus } from '@/types';
import {
  IconFileText,
  IconCheck,
  IconEye,
  IconShieldCheck,
} from '../icons/Icons';

interface LearningPackTabProps {
  assets: Asset[];
  onViewAsset: (asset: Asset) => void;
  onUpdateStatus: (assetId: string, status: AssetStatus) => void;
  onRegenerateAsset: (assetId: string) => void;
  onApproveAll: () => void;
}

export function LearningPackTab({
  assets,
  onViewAsset,
  onUpdateStatus,
  onRegenerateAsset,
  onApproveAll,
}: LearningPackTabProps) {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchType = selectedType === 'All' || asset.type === selectedType;
      const matchStatus = selectedStatus === 'All' || asset.status === selectedStatus;
      return matchType && matchStatus;
    });
  }, [assets, selectedType, selectedStatus]);

  const approvedCount = assets.filter((a) => a.status === 'Approved').length;
  const needsRevisionCount = assets.filter((a) => a.status === 'Needs Revision').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Quick Approval */}
      <div
        className="card p-4 flex items-center justify-between flex-wrap gap-4"
        style={{ backgroundColor: 'var(--color-white)' }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="font-semibold text-sm">
              Pedagogical Learning Pack ({assets.length} Generated Assets)
            </div>
            <div className="text-xs text-secondary mt-1">
              Curriculum materials differentiated for mixed-ability teaching.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-approved">{approvedCount} Approved</span>
            {needsRevisionCount > 0 && (
              <span className="badge badge-revision">
                {needsRevisionCount} Needs Revision
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {approvedCount < assets.length && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onApproveAll}
            >
              <IconCheck size={14} /> Approve All Assets
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-secondary">Asset Filter:</span>
          {['All', 'Concept Explanation', 'Worked Example', 'Formative Quiz', 'Revision Sheet'].map(
            (t) => (
              <button
                key={t}
                type="button"
                className={`btn btn-sm ${selectedType === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedType(t)}
                style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)' }}
              >
                {t}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="learning-pack-status-filter" className="text-xs font-medium text-secondary">Status:</label>
          <select
            id="learning-pack-status-filter"
            className="select"
            style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: 'var(--text-xs)' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Needs Revision">Needs Revision</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
        {filteredAssets.map((asset) => {
          const statusClass =
            asset.status === 'Approved'
              ? 'badge-approved'
              : asset.status === 'Needs Revision'
              ? 'badge-revision'
              : 'badge-draft';

          return (
            <div
              key={asset.id}
              className="asset-card flex flex-col"
              style={{ cursor: 'pointer' }}
              onClick={() => onViewAsset(asset)}
            >
              <div className="asset-card-header">
                <div className="flex items-center gap-3">
                  <div className="asset-type-icon">
                    <IconFileText size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-secondary uppercase" style={{ letterSpacing: '0.04em' }}>
                      {asset.type}
                    </span>
                    <h4 className="font-semibold text-base" style={{ margin: '2px 0 0 0', color: 'var(--color-brand-900)' }}>
                      {asset.title}
                    </h4>
                  </div>
                </div>
                <span className={`badge ${statusClass}`}>{asset.status}</span>
              </div>

              {asset.review && (
                <div className="text-xs text-secondary mt-2">
                  Reviewed by {asset.review.reviewerName} on {new Date(asset.review.reviewedAt).toLocaleString()}
                  {asset.review.comment ? ` · ${asset.review.comment}` : ''}
                </div>
              )}

              <div className="asset-card-body flex-1">
                {/* Content snippet */}
                <p
                  className="text-xs text-secondary mb-3"
                  style={{
                    lineHeight: '1.6',
                    maxHeight: '4.8em',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {asset.content.replace(/[#*`_>]/g, '')}
                </p>

                {/* Objective coverage tags */}
                <div className="flex items-center gap-1 flex-wrap mt-2">
                  <span className="text-xs text-secondary font-medium mr-1">LOs:</span>
                  {asset.objectiveCoverage.map((cov) => (
                    <span
                      key={cov.objectiveId}
                      className={`badge badge-${
                        cov.status === 'Covered'
                          ? 'success'
                          : cov.status === 'Partial'
                          ? 'warning'
                          : 'neutral'
                      }`}
                      style={{ fontSize: '10px' }}
                    >
                      {cov.identifier}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="asset-card-footer"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-xs text-secondary truncate flex items-center gap-1" style={{ maxWidth: '240px' }}>
                  <IconShieldCheck size={14} className="text-secondary" />
                  <span className="truncate">{asset.provenance?.sourceName || 'Curriculum Reference'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onViewAsset(asset)}
                  >
                    <IconEye size={14} /> View / Edit
                  </button>

                  <>
                    {asset.status !== 'Approved' && (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => onUpdateStatus(asset.id, 'Approved')}
                        title="Approve Asset"
                      >
                        <IconCheck size={14} /> Approve
                      </button>
                    )}
                    {asset.status !== 'Needs Revision' ? (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onUpdateStatus(asset.id, 'Needs Revision')}
                        title="Request changes to this asset"
                      >
                        Request Revision
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onUpdateStatus(asset.id, 'Draft')}
                        title="Return this asset to draft"
                      >
                        Return to Draft
                      </button>
                    )}
                    {asset.status !== 'Approved' && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRegenerateAsset(asset.id);
                        }}
                        title="Regenerate this asset"
                      >
                        Regenerate
                      </button>
                    )}
                  </>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
