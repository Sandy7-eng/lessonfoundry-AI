'use client';

import React, { useEffect, useState } from 'react';
import type { VersionHistoryEntry } from '@/types';
import { apiClient } from '@/lib/api/client';
import { formatTimestamp } from '@/lib/utils';
import {
  IconHistory,
  IconPlus,
  IconShieldCheck,
} from '../icons/Icons';

interface VersionsTabProps {
  unitId: string;
}

export function VersionsTab({ unitId }: VersionsTabProps) {
  const [history, setHistory] = useState<VersionHistoryEntry[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSnapshot, setShowSnapshot] = useState(true);

  useEffect(() => {
    let active = true;
    apiClient.getVersions(unitId)
      .then((entries) => {
        if (!active) return;
        setHistory(entries);
        setSelectedVersionId(entries[0]?.id ?? null);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load version history');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [unitId]);

  const selectedVersion = history.find((entry) => entry.id === selectedVersionId) ?? history[0] ?? null;
  const previousVersion = selectedVersion?.recordType === 'asset'
    ? history
        .filter((entry) =>
          entry.recordType === 'asset' &&
          entry.assetId === selectedVersion.assetId &&
          entry.timestamp < selectedVersion.timestamp
        )
        .sort((left, right) => right.timestamp.localeCompare(left.timestamp))[0]
    : undefined;

  const handleCreateSnapshot = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const unitVersions = history.filter((entry) => entry.recordType === 'unit');
      const latestAsset = history.find((entry) => entry.recordType === 'asset');
      await apiClient.createVersionSnapshot(unitId, {
        versionNumber: Math.max(0, ...unitVersions.map((entry) => entry.versionNumber)) + 1,
        status: 'NEEDS_REVIEW',
        assetVersionCount: history.filter((entry) => entry.recordType === 'asset').length,
        sourceVersion: Math.max(1, ...history.map((entry) => entry.sourceVersion)),
        modelIdentifier: latestAsset?.modelIdentifier,
        generationVersion: latestAsset?.generationVersion,
        teacherAction: 'Manual snapshot created by teacher',
        note: `Snapshot recorded for unit ${unitId}`,
      });
      const entries = await apiClient.getVersions(unitId);
      setHistory(entries);
      setSelectedVersionId(entries[0]?.id ?? null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save version snapshot');
    } finally {
      setIsSaving(false);
    }
  };

  const statusClass = (status: VersionHistoryEntry['status']) => {
    if (status === 'Approved') return 'badge-approved';
    if (status === 'Needs Revision') return 'badge-revision';
    if (status === 'Needs Review') return 'badge-review';
    if (status === 'Draft') return 'badge-draft';
    return 'badge-generating';
  };

  return (
    <div className="grid-2" style={{ alignItems: 'start', gap: 'var(--space-8)' }}>
      {/* Left Column: Timeline */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <IconHistory size={20} style={{ color: 'var(--color-brand-600)' }} />
              <span>Version History</span>
            </h3>
            <p className="text-xs text-secondary mt-1">
              Stored unit snapshots and generated asset versions for {unitId}.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCreateSnapshot}
            disabled={isSaving}
          >
            <IconPlus size={14} /> {isSaving ? 'Saving...' : 'New Snapshot'}
          </button>
        </div>

        {error && <p className="text-xs" role="alert" style={{ color: 'var(--color-error-600)' }}>{error}</p>}

        <div className="version-timeline">
          {isLoading ? (
            <p className="text-sm text-secondary">Loading version history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-secondary">No stored versions for this unit yet.</p>
          ) : history.map((entry, idx) => {
            const isSelected = selectedVersion?.id === entry.id;
            const isLatest = idx === 0;

            return (
              <div
                key={entry.id}
                className="version-entry"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedVersionId(entry.id)}
              >
                <div
                  className={`version-dot ${
                    entry.status === 'Approved' ? 'approved' : isLatest ? 'current' : ''
                  }`}
                />
                <div
                  className="p-3 border rounded"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-brand-50)' : 'var(--color-white)',
                    borderColor: isSelected ? 'var(--color-brand-500)' : 'var(--color-border)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {entry.recordType === 'asset' ? `${entry.assetTitle} v${entry.versionNumber}` : `Unit Version ${entry.versionNumber}`}
                      {isLatest && (
                        <span className="badge badge-brand" style={{ marginLeft: 6, fontSize: 10 }}>
                          Current
                        </span>
                      )}
                    </span>
                    <span
                      className={`badge ${statusClass(entry.status)}`}
                    >
                      {entry.status}
                    </span>
                  </div>

                  <div className="text-xs text-secondary mb-1">
                    {formatTimestamp(entry.timestamp)}
                  </div>

                  {entry.teacherAction && (
                    <div className="text-xs font-medium" style={{ color: 'var(--color-brand-700)' }}>
                      Action: {entry.teacherAction}
                    </div>
                  )}

                  {entry.sourceReference && (
                    <div className="text-xs text-secondary mt-1">Source: {entry.sourceReference}</div>
                  )}

                  {entry.note && (
                    <div className="text-xs text-secondary mt-1 italic">
                      &ldquo;{entry.note}&rdquo;
                    </div>
                  )}

                  <div className="text-xs text-tertiary mt-2">
                    Model: {entry.modelIdentifier} • Gen v{entry.generationVersion}
                  </div>
                  <div className="text-xs text-tertiary">Source version {entry.sourceVersion}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Version Diff Viewer */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-base">
              {selectedVersion?.recordType === 'asset'
                ? `Asset Snapshot: ${selectedVersion.assetTitle}`
                : 'Unit Snapshot'}
            </h4>
            <p className="text-xs text-secondary mt-1">
              {selectedVersion ? `Version ${selectedVersion.versionNumber} recorded ${formatTimestamp(selectedVersion.timestamp)}.` : 'Select a stored version to inspect its data.'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowSnapshot(!showSnapshot)}
          >
            {showSnapshot ? 'Hide Snapshot' : 'Show Snapshot'}
          </button>
        </div>

        {showSnapshot && selectedVersion && (
          <div className="flex flex-col gap-4">
            <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
              <div>
                <div className="text-xs font-semibold mb-2">Previous Version</div>
                <pre className="p-3 border rounded text-xs" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 320, overflowY: 'auto', backgroundColor: 'var(--color-neutral-50)' }}>
                  {previousVersion?.contentSnapshot ?? 'No earlier asset snapshot is available.'}
                </pre>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2">Selected Version</div>
                <pre className="p-3 border rounded text-xs" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 320, overflowY: 'auto', backgroundColor: 'var(--color-neutral-50)' }}>
                  {selectedVersion.contentSnapshot ?? selectedVersion.note ?? 'This unit snapshot records metadata, not an asset content snapshot.'}
                </pre>
              </div>
            </div>
            <div className="text-xs text-secondary">
              {selectedVersion.sourceReference && <div>Source: {selectedVersion.sourceReference}</div>}
              <div>Model: {selectedVersion.modelIdentifier} · Generation {selectedVersion.generationVersion}</div>
              <div>Asset version: {selectedVersion.assetVersion} · Source version: {selectedVersion.sourceVersion}</div>
            </div>
          </div>
        )}

        <div
          className="mt-6 p-4 rounded text-xs"
          style={{ backgroundColor: 'var(--color-brand-50)', border: '1px solid var(--color-brand-200)', color: 'var(--color-brand-900)' }}
        >
          <div className="font-semibold mb-1 flex items-center gap-1">
            <IconShieldCheck size={14} /> Reproducibility &amp; Governance
          </div>
          <p style={{ margin: 0 }}>
            Stored history records asset snapshots, source references, model identifiers, generation timestamps, and version numbers.
          </p>
        </div>
      </div>
    </div>
  );
}
