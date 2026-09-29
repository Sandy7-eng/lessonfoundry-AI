'use client';

import React, { useState } from 'react';
import type { Asset, AssetStatus } from '@/types';
import { Modal } from '../common/Modal';
import {
  IconCheck,
  IconEdit,
  IconHistory,
  IconShieldCheck,
} from '../icons/Icons';
import { formatDate } from '@/lib/utils';

interface AssetModalProps {
  asset: Asset | null;
  onClose: () => void;
  onSaveContent: (assetId: string, updatedContent: string) => void;
  onUpdateStatus: (assetId: string, status: AssetStatus) => void;
}

function AssetModalInner({
  asset,
  onClose,
  onSaveContent,
  onUpdateStatus,
}: {
  asset: Asset;
  onClose: () => void;
  onSaveContent: (assetId: string, updatedContent: string) => void;
  onUpdateStatus: (assetId: string, status: AssetStatus) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(asset.content);

  const handleSave = () => {
    onSaveContent(asset.id, content);
    setIsEditing(false);
  };

  const statusClass =
    asset.status === 'Approved'
      ? 'badge-approved'
      : asset.status === 'Needs Revision'
      ? 'badge-revision'
      : 'badge-draft';

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={asset.title}
      maxWidth="800px"
      footer={
        <div className="flex items-center justify-between w-full flex-wrap gap-2">
          {/* Status controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary font-medium">Status:</span>
            <button
              type="button"
              className={`btn btn-sm ${
                asset.status === 'Approved' ? 'btn-success' : 'btn-secondary'
              }`}
              onClick={() => onUpdateStatus(asset.id, 'Approved')}
            >
              <IconCheck size={14} /> Approved
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                asset.status === 'Needs Revision' ? 'btn-danger' : 'btn-secondary'
              }`}
              onClick={() => onUpdateStatus(asset.id, 'Needs Revision')}
            >
              Needs Revision
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                asset.status === 'Draft' ? 'btn-primary' : 'btn-secondary'
              }`}
              onClick={() => onUpdateStatus(asset.id, 'Draft')}
            >
              Draft
            </button>
          </div>

          {/* Edit / View controls */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setContent(asset.content);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                >
                  <IconCheck size={14} /> Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                <IconEdit size={14} /> Edit Content
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Header bar with badges & coverage */}
        <div
          className="flex items-center justify-between p-3 border rounded flex-wrap gap-2"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-neutral-50)' }}
        >
          <div className="flex items-center gap-2">
            <span className="badge badge-brand">{asset.type}</span>
            <span className={`badge ${statusClass}`}>{asset.status}</span>
            <span className="text-xs text-secondary">
              Updated {formatDate(asset.lastUpdated)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-secondary font-medium">Coverage:</span>
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
                title={`${cov.identifier} is ${cov.status}`}
              >
                {cov.identifier}: {cov.status}
              </span>
            ))}
          </div>
        </div>

        {/* Provenance Box */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-brand-50)',
            border: '1px solid var(--color-brand-200)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div className="flex items-center gap-2">
            <IconShieldCheck size={16} style={{ color: 'var(--color-brand-600)' }} />
            <span>
              <strong>Grounded Source:</strong> {asset.provenance?.sourceName || 'Curriculum Reference'} (v{asset.provenance?.sourceVersion || 1})
            </span>
          </div>
          <div className="text-secondary">
            Model: <code>{asset.provenance?.modelIdentifier || 'lf-generator-v1'}</code>
          </div>
        </div>

        {/* Content area: Editing or Rendered Markdown */}
        <div>
          {isEditing ? (
            <div className="form-group">
              <label htmlFor="asset-markdown-content" className="form-label">Edit Markdown Content</label>
              <textarea
                id="asset-markdown-content"
                className="textarea"
                style={{
                  minHeight: '380px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  lineHeight: '1.6',
                }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          ) : (
            <div
              className="p-6 border rounded"
              style={{
                backgroundColor: 'var(--color-white)',
                borderColor: 'var(--color-border)',
                maxHeight: '450px',
                overflowY: 'auto',
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                }}
              >
                {asset.content}
              </div>
            </div>
          )}
        </div>

        {/* Version History preview */}
        {asset.versions && asset.versions.length > 0 && (
          <div className="text-xs text-secondary flex items-center gap-3">
            <IconHistory size={14} />
            <span>
              <strong>{asset.versions.length} version{asset.versions.length > 1 ? 's' : ''} recorded.</strong> Current: v{asset.versions[0]?.versionNumber || 1}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function AssetModal({
  asset,
  onClose,
  onSaveContent,
  onUpdateStatus,
}: AssetModalProps) {
  if (!asset) return null;
  return (
    <AssetModalInner
      key={asset.id}
      asset={asset}
      onClose={onClose}
      onSaveContent={onSaveContent}
      onUpdateStatus={onUpdateStatus}
    />
  );
}
