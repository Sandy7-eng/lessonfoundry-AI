'use client';

import React from 'react';
import type { LearningObjective, Asset } from '@/types';
import { IconTarget } from '../icons/Icons';

interface AlignmentTabProps {
  objectives: LearningObjective[];
  assets: Asset[];
  onViewAsset: (asset: Asset) => void;
}

export function AlignmentTab({ objectives, assets, onViewAsset }: AlignmentTabProps) {
  // Compute coverage stats
  const totalCells = objectives.length * assets.length;
  let coveredCount = 0;
  let partialCount = 0;

  objectives.forEach((obj) => {
    assets.forEach((asset) => {
      const match = asset.objectiveCoverage.find(
        (c) => c.objectiveId === obj.id || c.identifier === obj.identifier
      );
      if (match?.status === 'Covered') coveredCount++;
      else if (match?.status === 'Partial') partialCount++;
    });
  });

  const alignmentScore = Math.round(
    ((coveredCount * 1 + partialCount * 0.5) / (totalCells || 1)) * 100
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Alignment Scorecard */}
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase">Overall Alignment</div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-brand-600)' }}>
            {alignmentScore}%
          </div>
          <div className="text-xs text-secondary mt-1">Curriculum coverage score</div>
        </div>

        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase">Covered Links</div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-success-700)' }}>
            {coveredCount}
          </div>
          <div className="text-xs text-secondary mt-1">Fully addressed in assets</div>
        </div>

        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase">Partial Links</div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-warning-700)' }}>
            {partialCount}
          </div>
          <div className="text-xs text-secondary mt-1">Requires secondary reinforcement</div>
        </div>

        <div className="card p-4">
          <div className="text-xs text-secondary font-medium uppercase">Objectives Defined</div>
          <div className="font-bold text-2xl mt-1" style={{ color: 'var(--color-brand-900)' }}>
            {objectives.length}
          </div>
          <div className="text-xs text-secondary mt-1">Target syllabus competencies</div>
        </div>
      </div>

      {/* Alignment Matrix Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2">
              <IconTarget size={18} style={{ color: 'var(--color-brand-600)' }} />
              <span>Pedagogical Alignment Matrix</span>
            </h3>
            <p className="text-xs text-secondary mt-1">
              Cross-verifies that every learning objective is represented in teaching and formative materials.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success-500)' }} />
              Covered
            </span>
            <span className="flex items-center gap-1">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning-500)' }} />
              Partial
            </span>
            <span className="flex items-center gap-1">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-neutral-300)' }} />
              Missing
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-neutral-50)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', minWidth: '220px' }}>
                  Learning Objective
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center', width: '90px' }}>
                  Bloom&apos;s
                </th>
                {assets.map((asset) => (
                  <th
                    key={asset.id}
                    style={{
                      padding: 'var(--space-3) var(--space-2)',
                      textAlign: 'center',
                      minWidth: '120px',
                      cursor: 'pointer',
                    }}
                    onClick={() => onViewAsset(asset)}
                    title={`Click to open ${asset.title}`}
                  >
                    <div className="truncate font-semibold hover:underline" style={{ color: 'var(--color-brand-700)' }}>
                      {asset.type}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {objectives.map((obj) => (
                <tr
                  key={obj.id}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div className="flex items-center gap-2">
                      <span className="objective-id" style={{ width: 22, height: 22, fontSize: 10 }}>
                        {obj.identifier}
                      </span>
                      <span className="font-medium text-xs text-primary" style={{ lineHeight: '1.4' }}>
                        {obj.text}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'center' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                      {obj.bloomsLevel || 'Understand'}
                    </span>
                  </td>
                  {assets.map((asset) => {
                    const match = asset.objectiveCoverage.find(
                      (c) => c.objectiveId === obj.id || c.identifier === obj.identifier
                    );
                    const status = match?.status || 'Missing';

                    return (
                      <td
                        key={asset.id}
                        style={{
                          padding: 'var(--space-3) var(--space-2)',
                          textAlign: 'center',
                          backgroundColor:
                            status === 'Covered'
                              ? 'rgba(34, 197, 94, 0.05)'
                              : status === 'Partial'
                              ? 'rgba(234, 179, 8, 0.05)'
                              : 'transparent',
                        }}
                      >
                        <span
                          className={`badge badge-${
                            status === 'Covered'
                              ? 'success'
                              : status === 'Partial'
                              ? 'warning'
                              : 'neutral'
                          }`}
                          style={{ fontSize: '10px' }}
                        >
                          {status}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloom's Taxonomy Distribution Card */}
      <div className="card p-6">
        <h4 className="font-semibold text-sm mb-3">Bloom&apos;s Taxonomy Cognitive Distribution</h4>
        <div className="flex flex-col gap-3">
          {['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'].map((level) => {
            const count = objectives.filter((o) => o.bloomsLevel === level).length;
            const pct = Math.round((count / (objectives.length || 1)) * 100);

            return (
              <div key={level} className="flex items-center gap-3 text-xs">
                <span style={{ width: '80px', fontWeight: 500 }}>{level}</span>
                <div
                  style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: 'var(--color-neutral-100)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      backgroundColor: 'var(--color-brand-600)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
                <span className="text-secondary" style={{ width: '40px', textAlign: 'right' }}>
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
