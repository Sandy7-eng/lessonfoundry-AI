'use client';

import React, { useState } from 'react';
import type { VersionHistoryEntry } from '@/types';
import { MOCK_VERSION_HISTORY } from '@/lib/mockData';
import { formatTimestamp, generateId } from '@/lib/utils';
import {
  IconHistory,
  IconPlus,
  IconShieldCheck,
} from '../icons/Icons';

interface VersionsTabProps {
  unitId: string;
}

export function VersionsTab({ unitId }: VersionsTabProps) {
  const [history, setHistory] = useState<VersionHistoryEntry[]>(MOCK_VERSION_HISTORY);
  const [selectedVersion, setSelectedVersion] = useState<number>(3);
  const [showDiff, setShowDiff] = useState<boolean>(true);

  const handleCreateSnapshot = () => {
    const nextVer = history.length + 1;
    const newEntry: VersionHistoryEntry = {
      id: `ver-${generateId()}`,
      versionNumber: nextVer,
      timestamp: new Date().toISOString(),
      sourceVersion: 1,
      assetVersion: nextVer * 2,
      status: 'Needs Review',
      modelIdentifier: 'lf-generator-v1',
      generationVersion: '1.0.0',
      teacherAction: 'Manual snapshot created by teacher',
      note: `Snapshot recorded for unit ${unitId}`,
    };
    setHistory([newEntry, ...history]);
    setSelectedVersion(nextVer);
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
              Audit trail of teacher revisions, model iterations, and sign-offs for {unitId}.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCreateSnapshot}
          >
            <IconPlus size={14} /> New Snapshot
          </button>
        </div>

        <div className="version-timeline">
          {history.map((entry, idx) => {
            const isSelected = selectedVersion === entry.versionNumber;
            const isLatest = idx === 0;

            return (
              <div
                key={entry.id}
                className="version-entry"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedVersion(entry.versionNumber)}
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
                      Version {entry.versionNumber}
                      {isLatest && (
                        <span className="badge badge-brand" style={{ marginLeft: 6, fontSize: 10 }}>
                          Current
                        </span>
                      )}
                    </span>
                    <span
                      className={`badge ${
                        entry.status === 'Approved'
                          ? 'badge-approved'
                          : entry.status === 'Needs Review'
                          ? 'badge-review'
                          : 'badge-generating'
                      }`}
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

                  {entry.note && (
                    <div className="text-xs text-secondary mt-1 italic">
                      &ldquo;{entry.note}&rdquo;
                    </div>
                  )}

                  <div className="text-xs text-tertiary mt-2">
                    Model: {entry.modelIdentifier} • Gen v{entry.generationVersion}
                  </div>
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
              Revision Diff: Version {selectedVersion} vs v{Math.max(1, selectedVersion - 1)}
            </h4>
            <p className="text-xs text-secondary mt-1">
              Highlights modifications between sequential generator runs and teacher edits.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowDiff(!showDiff)}
          >
            {showDiff ? 'Hide Diff' : 'Show Diff'}
          </button>
        </div>

        {showDiff && (
          <div
            className="border rounded overflow-hidden"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-white)' }}
          >
            <div
              className="p-2 border-b text-xs font-semibold flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-neutral-50)', borderColor: 'var(--color-border)' }}
            >
              <span>Asset: Formative Quiz &amp; Revision Sheet</span>
              <span className="text-secondary font-normal">Unified diff</span>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: '1.7' }}>
              <div className="diff-line text-secondary">@@ -14,6 +14,8 @@ Formative Quiz Section</div>
              <div className="diff-line"> Q1: Name the four stages of mitosis in order.</div>
              <div className="diff-line diff-removed">
                - &gt; Answer Key: Prophase, Metaphase, Anaphase, Telophase.
              </div>
              <div className="diff-line diff-added">
                + &gt; Answer Key: Prophase &rarr; Metaphase &rarr; Anaphase &rarr; Telophase. Award 1 mark for any two correct; 2 marks for all four.
              </div>
              <div className="diff-line text-secondary">@@ -32,4 +34,7 @@ Revision Sheet Vocab</div>
              <div className="diff-line diff-removed">
                - | Mitosis | Cell division producing identical cells |
              </div>
              <div className="diff-line diff-added">
                + | Mitosis | Cell division producing 2 genetically identical daughter cells |
              </div>
              <div className="diff-line diff-added">
                + | Meiosis | Cell division producing 4 genetically unique haploid cells |
              </div>
              <div className="diff-line"> | Chromosome | DNA structure carrying genetic information |</div>
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
            Every version snapshot binds the exact source files, prompt constraints, and output checksum to prevent regression when updating curriculum packs.
          </p>
        </div>
      </div>
    </div>
  );
}
