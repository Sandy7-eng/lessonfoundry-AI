'use client';

import React, { useState } from 'react';
import type { LearningObjective, Constraints, DifficultyLevel, AnswerRevealPolicy } from '@/types';
import { generateId } from '@/lib/utils';
import {
  IconTarget,
  IconPlus,
  IconTrash,
  IconCheck,
  IconShieldCheck,
} from '../icons/Icons';

interface ObjectivesTabProps {
  objectives: LearningObjective[];
  constraints: Constraints;
  onUpdateObjectives: (objectives: LearningObjective[]) => void;
  onUpdateConstraints: (constraints: Constraints) => void;
}

export function ObjectivesTab({
  objectives,
  constraints,
  onUpdateObjectives,
  onUpdateConstraints,
}: ObjectivesTabProps) {
  // New LO form
  const [newText, setNewText] = useState('');
  const [newBlooms, setNewBlooms] = useState<LearningObjective['bloomsLevel']>('Understand');

  // Constraints local state
  const [formConstraints, setFormConstraints] = useState<Constraints>(constraints);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newObj: LearningObjective = {
      id: `obj-${generateId()}`,
      identifier: `LO-${objectives.length + 1}`,
      text: newText.trim(),
      bloomsLevel: newBlooms,
      assetCoverage: ['Covered', 'Covered', 'Covered'],
    };

    onUpdateObjectives([...objectives, newObj]);
    setNewText('');
  };

  const handleRemoveObjective = (id: string) => {
    onUpdateObjectives(objectives.filter((o) => o.id !== id));
  };

  const handleSaveConstraints = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConstraints(formConstraints);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  return (
    <div className="grid-2" style={{ alignItems: 'start', gap: 'var(--space-8)' }}>
      {/* Left Column: Learning Objectives */}
      <div className="flex flex-col gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <IconTarget size={20} style={{ color: 'var(--color-brand-600)' }} />
                <span>Learning Objectives</span>
              </h3>
              <p className="text-xs text-secondary mt-1">
                Each asset in the pack is rigorously mapped against these objectives.
              </p>
            </div>
            <span className="badge badge-brand">{objectives.length} Defined</span>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {objectives.map((obj) => (
              <div key={obj.id} className="objective-card flex items-start gap-3">
                <div className="objective-id">{obj.identifier}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="badge badge-neutral text-xs">
                      Bloom&apos;s: {obj.bloomsLevel || 'Understand'}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => handleRemoveObjective(obj.id)}
                      title="Remove objective"
                      style={{ color: 'var(--color-error-600)' }}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-medium" style={{ margin: 0 }}>
                    {obj.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Objective Form */}
          <form
            onSubmit={handleAddObjective}
            className="p-4 border rounded"
            style={{ backgroundColor: 'var(--color-neutral-50)', borderColor: 'var(--color-border)' }}
          >
            <div className="font-semibold text-xs uppercase text-secondary mb-3">
              Add New Learning Objective
            </div>
            <div className="form-group mb-3">
              <label htmlFor="objective-text-input" className="form-label text-xs">Objective Statement</label>
              <textarea
                id="objective-text-input"
                className="textarea"
                rows={2}
                placeholder="e.g. Compare the stages of mitosis and identify key chromosome configurations..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                style={{ minHeight: '60px' }}
                required
              />
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label htmlFor="objective-blooms-select" className="text-xs text-secondary font-medium">Bloom&apos;s Level:</label>
                <select
                  id="objective-blooms-select"
                  className="select"
                  style={{ width: 'auto', padding: '4px 24px 4px 8px', fontSize: 'var(--text-xs)' }}
                  value={newBlooms}
                  onChange={(e) =>
                    setNewBlooms(
                      e.target.value as LearningObjective['bloomsLevel']
                    )
                  }
                >
                  <option value="Remember">Remember</option>
                  <option value="Understand">Understand</option>
                  <option value="Apply">Apply</option>
                  <option value="Analyse">Analyse</option>
                  <option value="Evaluate">Evaluate</option>
                  <option value="Create">Create</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!newText.trim()}
              >
                <IconPlus size={14} /> Add Objective
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Pedagogical Constraints Form */}
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSaveConstraints} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <IconShieldCheck size={20} style={{ color: 'var(--color-brand-600)' }} />
                <span>Pedagogical Constraints</span>
              </h3>
              <p className="text-xs text-secondary mt-1">
                Controls difficulty, vocabulary restrictions, and answer reveal rules.
              </p>
            </div>
            {saveFeedback && (
              <span className="badge badge-approved">
                <IconCheck size={12} /> Saved
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="constraint-target-level" className="form-label">Target Level</label>
                <input
                  id="constraint-target-level"
                  type="text"
                  className="input"
                  value={formConstraints.targetLevel}
                  onChange={(e) =>
                    setFormConstraints({ ...formConstraints, targetLevel: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="constraint-difficulty" className="form-label">Difficulty Band</label>
                <select
                  id="constraint-difficulty"
                  className="select"
                  value={formConstraints.difficulty}
                  onChange={(e) =>
                    setFormConstraints({
                      ...formConstraints,
                      difficulty: e.target.value as DifficultyLevel,
                    })
                  }
                >
                  <option value="Foundation">Foundation</option>
                  <option value="Core">Core</option>
                  <option value="Extension">Extension</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="constraint-answer-policy" className="form-label">Answer Reveal Policy</label>
              <select
                id="constraint-answer-policy"
                className="select"
                value={formConstraints.answerRevealPolicy}
                onChange={(e) =>
                  setFormConstraints({
                    ...formConstraints,
                    answerRevealPolicy: e.target.value as AnswerRevealPolicy,
                  })
                }
              >
                <option value="After Attempt">After Attempt (Reveals feedback upon submission)</option>
                <option value="Teacher Only">Teacher Only (Keeps mark scheme hidden from students)</option>
                <option value="Always">Always (Self-study and revision)</option>
                <option value="Never">Never (Strict summative exam)</option>
              </select>
              <span className="form-hint">
                Controls student visibility of quiz mark schemes and practice solutions.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="constraint-vocab-rules" className="form-label">Vocabulary & Terminology Constraints</label>
              <textarea
                id="constraint-vocab-rules"
                className="textarea"
                rows={3}
                value={formConstraints.vocabularyConstraints}
                onChange={(e) =>
                  setFormConstraints({
                    ...formConstraints,
                    vocabularyConstraints: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="constraint-teacher-notes" className="form-label">Teacher Guidance Notes & Misconceptions</label>
              <textarea
                id="constraint-teacher-notes"
                className="textarea"
                rows={3}
                placeholder="Notes for differentiation, student misconceptions, or exam board caveats..."
                value={formConstraints.teacherNotes}
                onChange={(e) =>
                  setFormConstraints({
                    ...formConstraints,
                    teacherNotes: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="btn btn-primary btn-sm">
                <IconCheck size={16} /> Save Constraints
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
