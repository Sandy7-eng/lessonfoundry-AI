'use client';

import React, { useState } from 'react';
import type {
  LearningUnit,
  WorkspaceTab,
  Asset,
  Source,
  AssetStatus,
  UnitStatus,
  QualityWarning,
  LearningObjective,
  Constraints,
} from '@/types';
import { formatDate } from '@/lib/utils';
import { SourcesTab } from './SourcesTab';
import { ObjectivesTab } from './ObjectivesTab';
import { LearningPackTab } from './LearningPackTab';
import { AlignmentTab } from './AlignmentTab';
import { QualityTab } from './QualityTab';
import { ReviewTab } from './ReviewTab';
import { VersionsTab } from './VersionsTab';
import { AssetModal } from './AssetModal';
import { SourceModal } from './SourceModal';
import {
  IconFileText,
  IconTarget,
  IconLayers,
  IconGrid,
  IconAlertTriangle,
  IconCheckCircle,
  IconHistory,
  IconEye,
  IconShieldCheck,
} from '../icons/Icons';

interface WorkspaceViewProps {
  unit: LearningUnit;
  onUpdateUnit: (updatedUnit: LearningUnit) => void;
  onOpenStudentMode: () => void;
}

export function WorkspaceView({
  unit,
  onUpdateUnit,
  onOpenStudentMode,
}: WorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('learning-pack');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const submitAssetReview = async (assetId: string, status: AssetStatus) => {
    const response = await fetch(`/api/units/${encodeURIComponent(unit.id)}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId,
        status: status.toUpperCase().replace(/\s+/g, '_'),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Unable to save the asset review');
    }

    return response.json() as Promise<{
      createdAt: string;
      comment?: string | null;
      user?: { name?: string };
    }>;
  };

  const handleUpdateAssetStatus = async (assetId: string, status: AssetStatus) => {
    try {
      setReviewError(null);
      const review = await submitAssetReview(assetId, status);
      const updatedAssets = unit.assets.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              status,
              lastUpdated: review.createdAt,
              review: {
                status,
                reviewerName: review.user?.name ?? 'Teacher',
                reviewedAt: review.createdAt,
                comment: review.comment ?? undefined,
              },
            }
          : asset
      );
      const updatedUnit = {
        ...unit,
        assets: updatedAssets,
        updatedAt: new Date().toISOString(),
      };
      onUpdateUnit(updatedUnit);

      if (selectedAsset && selectedAsset.id === assetId) {
        setSelectedAsset(updatedAssets.find((asset) => asset.id === assetId) ?? selectedAsset);
      }
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unable to save the asset review');
    }
  };

  const handleRegenerateAsset = async (assetId: string) => {
    const targetAsset = unit.assets.find((asset) => asset.id === assetId);
    if (!targetAsset || targetAsset.status === 'Approved') {
      return;
    }

    try {
      const response = await fetch(`/api/units/${encodeURIComponent(unit.id)}/assets?assetId=${encodeURIComponent(assetId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      });

      if (!response.ok) {
        throw new Error('Unable to regenerate asset');
      }

      const data = await response.json();
      const regenerated = data.asset as Asset | undefined;
      if (!regenerated) return;

      const updatedAssets = unit.assets.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              content: regenerated.content ?? asset.content,
              status: 'Draft' as AssetStatus,
              lastUpdated: new Date().toISOString(),
            }
          : asset
      );

      const updatedUnit = {
        ...unit,
        assets: updatedAssets,
        updatedAt: new Date().toISOString(),
      };
      onUpdateUnit(updatedUnit);

      if (selectedAsset && selectedAsset.id === assetId) {
        setSelectedAsset({
          ...selectedAsset,
          content: regenerated.content ?? selectedAsset.content,
          status: 'Draft' as AssetStatus,
        });
      }
    } catch (error) {
      console.error('Regeneration failed', error);
    }
  };

  // Asset content save
  const handleSaveAssetContent = async (assetId: string, updatedContent: string) => {
    const targetAsset = unit.assets.find((asset) => asset.id === assetId);
    if (!targetAsset || targetAsset.status === 'Approved') {
      setReviewError('Approved assets cannot be modified. Request revision before editing.');
      return;
    }

    try {
      const response = await fetch(`/api/units/${encodeURIComponent(unit.id)}/assets?assetId=${encodeURIComponent(assetId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Unable to save asset content');
      }
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unable to save asset content');
      return;
    }

    const updatedAssets = unit.assets.map((a) =>
      a.id === assetId
        ? {
            ...a,
            content: updatedContent,
            lastUpdated: new Date().toISOString(),
            versions: [
              {
                versionNumber: (a.versions[0]?.versionNumber || 1) + 1,
                createdAt: new Date().toISOString(),
                note: 'Teacher edit saved',
                status: a.status,
              },
              ...a.versions,
            ],
          }
        : a
    );
    const updatedUnit = {
      ...unit,
      assets: updatedAssets,
      updatedAt: new Date().toISOString(),
    };
    onUpdateUnit(updatedUnit);

    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset({ ...selectedAsset, content: updatedContent });
    }
  };

  // Approve all assets
  const handleApproveAllAssets = async () => {
    try {
      setReviewError(null);
      const pendingAssets = unit.assets.filter((asset) => asset.status !== 'Approved');
      const reviews = await Promise.all(
        pendingAssets.map(async (asset) => ({
          assetId: asset.id,
          review: await submitAssetReview(asset.id, 'Approved'),
        }))
      );
      const reviewByAssetId = new Map(reviews.map(({ assetId, review }) => [assetId, review]));
      const updatedAssets = unit.assets.map((asset) => {
        const review = reviewByAssetId.get(asset.id);
        return review
          ? {
              ...asset,
              status: 'Approved' as AssetStatus,
              lastUpdated: review.createdAt,
              review: {
                status: 'Approved' as AssetStatus,
                reviewerName: review.user?.name ?? 'Teacher',
                reviewedAt: review.createdAt,
                comment: review.comment ?? undefined,
              },
            }
          : asset;
      });
      onUpdateUnit({
        ...unit,
        assets: updatedAssets,
        status: 'Approved',
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unable to approve assets');
    }
  };

  // Unit status update
  const handleUpdateUnitStatus = (status: UnitStatus) => {
    onUpdateUnit({
      ...unit,
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  // Source updates
  const handleAddSource = (newSource: Source) => {
    onUpdateUnit({
      ...unit,
      sources: [...unit.sources, newSource],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveSource = (sourceId: string) => {
    onUpdateUnit({
      ...unit,
      sources: unit.sources.filter((s) => s.id !== sourceId),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleTrusted = (sourceId: string) => {
    const updatedSources = unit.sources.map((s) =>
      s.id === sourceId ? { ...s, trusted: !s.trusted } : s
    );
    onUpdateUnit({
      ...unit,
      sources: updatedSources,
      updatedAt: new Date().toISOString(),
    });
    if (selectedSource && selectedSource.id === sourceId) {
      setSelectedSource({ ...selectedSource, trusted: !selectedSource.trusted });
    }
  };

  // Objective updates
  const handleUpdateObjectives = (objectives: LearningObjective[]) => {
    onUpdateUnit({
      ...unit,
      objectives,
      updatedAt: new Date().toISOString(),
    });
  };

  // Constraints update
  const handleUpdateConstraints = (constraints: Constraints) => {
    onUpdateUnit({
      ...unit,
      constraints,
      updatedAt: new Date().toISOString(),
    });
  };

  // Warnings
  const handleDismissWarning = (warningId: string) => {
    onUpdateUnit({
      ...unit,
      qualityWarnings: unit.qualityWarnings.filter((w) => w.id !== warningId),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleApplyFix = (warning: QualityWarning) => {
    // If warning is about LO-3 in quiz or answer leakage, simulate fix
    if (warning.type.includes('Answer Leakage')) {
      handleUpdateConstraints({
        ...unit.constraints,
        answerRevealPolicy: 'After Attempt',
      });
    }
    handleDismissWarning(warning.id);
  };

  const handleViewAssetById = (assetId: string) => {
    const match = unit.assets.find((a) => a.id === assetId);
    if (match) setSelectedAsset(match);
  };

  const warningCount = unit.qualityWarnings?.length || 0;

  return (
    <div className="workspace-layout">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-brand">{unit.subject}</span>
              <span className="badge badge-neutral">{unit.targetLevel}</span>
              <span
                className={`badge badge-${
                  unit.status === 'Approved'
                    ? 'approved'
                    : unit.status === 'Needs Review'
                    ? 'review'
                    : unit.status === 'Generating'
                    ? 'generating'
                    : 'draft'
                }`}
              >
                {unit.status}
              </span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-brand-900)' }}>
              {unit.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Unit Status"
              className="select"
              style={{ width: 'auto', padding: '4px 28px 4px 10px', fontSize: 'var(--text-xs)' }}
              value={unit.status}
              onChange={(e) => handleUpdateUnitStatus(e.target.value as UnitStatus)}
            >
              <option value="Draft">Draft</option>
              <option value="Generating">Generating</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Approved">Approved</option>
            </select>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenStudentMode}
            >
              <IconEye size={14} /> Student View
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="status-bar" style={{ marginTop: 'var(--space-2)' }}>
          <div className="status-item">
            <IconShieldCheck size={14} style={{ color: 'var(--color-success-600)' }} />
            <span>
              <strong>{unit.sources.filter((s) => s.trusted).length}</strong> Trusted Sources
            </span>
          </div>
          <div className="status-item">
            <IconTarget size={14} />
            <span>
              <strong>{unit.objectives.length}</strong> Objectives
            </span>
          </div>
          <div className="status-item">
            <IconLayers size={14} />
            <span>
              <strong>{unit.assets.length}</strong> Pack Assets
            </span>
          </div>
          {warningCount > 0 && (
            <div
              className="status-item"
              style={{ color: 'var(--color-warning-700)', cursor: 'pointer' }}
              onClick={() => setActiveTab('quality')}
            >
              <IconAlertTriangle size={14} />
              <span>
                <strong>{warningCount}</strong> Quality Notice{warningCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
          <div className="status-item ml-auto">
            <span>Last modified: {formatDate(unit.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="workspace-tabs">
        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            <IconFileText size={16} />
            <span>Sources ({unit.sources.length})</span>
          </button>

          <button
            type="button"
            className={`tab ${activeTab === 'objectives' ? 'active' : ''}`}
            onClick={() => setActiveTab('objectives')}
          >
            <IconTarget size={16} />
            <span>Objectives &amp; Pedagogy</span>
          </button>

          <button
            type="button"
            className={`tab ${activeTab === 'learning-pack' ? 'active' : ''}`}
            onClick={() => setActiveTab('learning-pack')}
          >
            <IconLayers size={16} />
            <span>Learning Pack ({unit.assets.length})</span>
          </button>

          <button
            type="button"
            className={`tab ${activeTab === 'alignment' ? 'active' : ''}`}
            onClick={() => setActiveTab('alignment')}
          >
            <IconGrid size={16} />
            <span>Alignment Matrix</span>
          </button>

          <button
            type="button"
            className={`tab ${activeTab === 'quality' ? 'active' : ''}`}
            onClick={() => setActiveTab('quality')}
          >
            <IconAlertTriangle size={16} />
            <span>Quality Audit</span>
            {warningCount > 0 && (
              <span
                className="badge"
                style={{
                  backgroundColor: 'var(--status-review-bg)',
                  color: 'var(--status-review-text)',
                  border: '1px solid var(--status-review-border)',
                  fontSize: '10px',
                  padding: '1px 6px',
                }}
              >
                {warningCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            <IconCheckCircle size={16} />
            <span>Sign-off &amp; Export</span>
          </button>

          <button
            type="button"
            className={`tab ${activeTab === 'versions' ? 'active' : ''}`}
            onClick={() => setActiveTab('versions')}
          >
            <IconHistory size={16} />
            <span>Version History</span>
          </button>
        </div>
      </div>

      {/* Workspace Active Tab Content */}
      <div className="workspace-content">
        <div className="content-area-wide">
          {reviewError && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
              {reviewError}
            </div>
          )}
          {activeTab === 'sources' && (
            <SourcesTab
              sources={unit.sources}
              onAddSource={handleAddSource}
              onRemoveSource={handleRemoveSource}
              onToggleTrusted={handleToggleTrusted}
              onViewSource={(src) => setSelectedSource(src)}
            />
          )}

          {activeTab === 'objectives' && (
            <ObjectivesTab
              objectives={unit.objectives}
              constraints={unit.constraints}
              onUpdateObjectives={handleUpdateObjectives}
              onUpdateConstraints={handleUpdateConstraints}
            />
          )}

          {activeTab === 'learning-pack' && (
            <LearningPackTab
              assets={unit.assets}
              onViewAsset={(asset) => setSelectedAsset(asset)}
              onUpdateStatus={handleUpdateAssetStatus}
              onRegenerateAsset={handleRegenerateAsset}
              onApproveAll={handleApproveAllAssets}
            />
          )}

          {activeTab === 'alignment' && (
            <AlignmentTab
              objectives={unit.objectives}
              assets={unit.assets}
              onViewAsset={(asset) => setSelectedAsset(asset)}
            />
          )}

          {activeTab === 'quality' && (
            <QualityTab
              warnings={unit.qualityWarnings}
              assets={unit.assets}
              onDismissWarning={handleDismissWarning}
              onApplyFix={handleApplyFix}
              onViewAssetById={handleViewAssetById}
            />
          )}

          {activeTab === 'review' && (
            <ReviewTab
              unit={unit}
              onUpdateUnitStatus={handleUpdateUnitStatus}
              onApproveAllAssets={handleApproveAllAssets}
              onOpenStudentMode={onOpenStudentMode}
              onViewAssetById={handleViewAssetById}
            />
          )}

          {activeTab === 'versions' && <VersionsTab unitId={unit.id} />}
        </div>
      </div>

      {/* Asset Inspection & Edit Modal */}
      <AssetModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onSaveContent={handleSaveAssetContent}
        onUpdateStatus={handleUpdateAssetStatus}
        onRegenerateAsset={handleRegenerateAsset}
      />

      {/* Source Preview Modal */}
      <SourceModal
        source={selectedSource}
        onClose={() => setSelectedSource(null)}
        onToggleTrusted={handleToggleTrusted}
      />
    </div>
  );
}
