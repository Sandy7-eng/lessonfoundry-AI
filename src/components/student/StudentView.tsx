'use client';

import React, { useState } from 'react';
import type { LearningUnit } from '@/types';
import {
  IconArrowLeft,
  IconCheck,
  IconEyeOff,
  IconBook,
  IconCheckCircle,
  IconFileText,
} from '../icons/Icons';

interface StudentViewProps {
  unit: LearningUnit;
  onExit: () => void;
}

export function StudentView({ unit, onExit }: StudentViewProps) {
  // Quiz student interactive state
  const [selectedQ2, setSelectedQ2] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [practiceTab, setPracticeTab] = useState<'foundation' | 'extension'>('foundation');

  const revealPolicy = unit.constraints.answerRevealPolicy;
  const canRevealAnswers =
    revealPolicy === 'Always' ||
    (revealPolicy === 'After Attempt' && quizSubmitted);

  const approvedAssets = unit.assets.filter((asset) => asset.status === 'Approved');
  const conceptAsset = approvedAssets.find((a) => a.type === 'Concept Explanation');
  const workedExampleAsset = approvedAssets.find((a) => a.type === 'Worked Example');
  const quizAsset = approvedAssets.find((a) => a.type === 'Formative Quiz');
  const foundationAsset = approvedAssets.find((a) => a.type.includes('Foundation'));
  const extensionAsset = approvedAssets.find((a) => a.type.includes('Extension'));
  const revisionAsset = approvedAssets.find((a) => a.type === 'Revision Sheet');

  return (
    <div style={{ backgroundColor: 'var(--color-bg-page)', minHeight: '100vh', paddingBottom: 'var(--space-16)' }}>
      {/* Top Teacher Preview Banner */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
          backgroundColor: 'var(--color-brand-900)',
          color: 'var(--color-white)',
          padding: 'var(--space-3) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onExit}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'var(--color-white)',
              borderColor: 'transparent',
            }}
          >
            <IconArrowLeft size={16} /> Exit Preview
          </button>
          <div>
            <div className="font-semibold text-sm">Student View Simulator</div>
            <div className="text-xs" style={{ color: 'var(--color-brand-200)' }}>
              Reveal Policy: <strong>{revealPolicy}</strong> •{' '}
              {canRevealAnswers
                ? 'Answer keys active for learner'
                : 'Answer keys gated until submission'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onExit}
        >
          Return to Teacher Workspace
        </button>
      </div>

      {/* Main Student Container */}
      <div className="student-mode" style={{ marginTop: 'var(--space-8)' }}>
        {/* Unit Title Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="badge badge-brand">{unit.subject}</span>
            <span className="badge badge-neutral">{unit.targetLevel}</span>
          </div>
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-brand-900)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {unit.title}
          </h1>
          <p className="text-sm text-secondary" style={{ maxWidth: '520px', margin: '0 auto' }}>
            Complete the readings, examine the worked problem, and submit your check for understanding.
          </p>
        </div>

        {approvedAssets.length === 0 && (
          <div className="student-section" role="status">
            <div className="student-section-body text-center text-secondary">
              No approved learning materials are available yet.
            </div>
          </div>
        )}

        {/* 1. Concept Explanation */}
        {conceptAsset && (
          <div className="student-section">
            <div className="student-section-header">
              <IconBook size={18} style={{ color: 'var(--color-brand-600)' }} />
              <h3 className="text-base font-semibold" style={{ margin: 0 }}>
                1. Core Concepts &amp; Theory
              </h3>
            </div>
            <div className="student-section-body">
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'var(--leading-relaxed)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {conceptAsset.content}
              </div>
            </div>
          </div>
        )}

        {/* 2. Worked Example */}
        {workedExampleAsset && (
          <div className="student-section">
            <div className="student-section-header">
              <IconCheckCircle size={18} style={{ color: 'var(--color-success-600)' }} />
              <h3 className="text-base font-semibold" style={{ margin: 0 }}>
                2. Step-by-Step Worked Example
              </h3>
            </div>
            <div className="student-section-body">
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'var(--leading-relaxed)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {workedExampleAsset.content}
              </div>
            </div>
          </div>
        )}

        {/* 3. Formative Quiz (Interactive) */}
        {quizAsset && (
          <div className="student-section">
            <div className="student-section-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCheck size={18} style={{ color: 'var(--color-brand-600)' }} />
                <h3 className="text-base font-semibold" style={{ margin: 0 }}>
                  3. Check Your Understanding (Quiz)
                </h3>
              </div>
              <span className="badge badge-neutral text-xs">
                {quizSubmitted ? 'Submitted' : 'Pending Submission'}
              </span>
            </div>
            <div className="student-section-body">
              {/* Question 1 */}
              <div className="mb-6 p-4 border rounded" style={{ borderColor: 'var(--color-border)' }}>
                <div className="font-semibold text-sm mb-2">
                  Q1. Name the four stages of mitosis in order. (2 marks)
                </div>
                <input
                  type="text"
                  className="input text-sm"
                  placeholder="Type your answer here..."
                  disabled={quizSubmitted}
                />
                {canRevealAnswers && (
                  <div
                    className="mt-3 p-3 rounded text-xs"
                    style={{
                      backgroundColor: 'var(--status-approved-bg)',
                      border: '1px solid var(--status-approved-border)',
                      color: 'var(--status-approved-text)',
                    }}
                  >
                    <strong>Mark Scheme:</strong> Prophase &rarr; Metaphase &rarr; Anaphase &rarr; Telophase. Award 1 mark for any two correct stages in order; 2 marks for all four.
                  </div>
                )}
              </div>

              {/* Question 2 (Multiple Choice) */}
              <div className="mb-6 p-4 border rounded" style={{ borderColor: 'var(--color-border)' }}>
                <div className="font-semibold text-sm mb-3">
                  Q2. Which of the following is NOT a function of mitosis?
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { key: 'A', label: 'Growth of an organism' },
                    { key: 'B', label: 'Repair of damaged tissue' },
                    { key: 'C', label: 'Production of gametes' },
                    { key: 'D', label: 'Replacement of dead cells' },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className="radio-group p-2 rounded hover:bg-neutral-50"
                      style={{
                        backgroundColor:
                          selectedQ2 === opt.key ? 'var(--color-brand-50)' : 'transparent',
                        cursor: quizSubmitted ? 'default' : 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="q2-choice"
                        value={opt.key}
                        checked={selectedQ2 === opt.key}
                        onChange={(e) => setSelectedQ2(e.target.value)}
                        disabled={quizSubmitted}
                      />
                      <span className="text-sm">
                        <strong>{opt.key})</strong> {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
                {canRevealAnswers && (
                  <div
                    className="mt-3 p-3 rounded text-xs"
                    style={{
                      backgroundColor: 'var(--status-approved-bg)',
                      border: '1px solid var(--status-approved-border)',
                      color: 'var(--status-approved-text)',
                    }}
                  >
                    <strong>Correct Answer: C</strong> &mdash; Gametes are produced by meiosis, not mitosis. Mitosis produces identical somatic cells.
                  </div>
                )}
              </div>

              {/* Quiz Submit Button & Reveal Status */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
                {!quizSubmitted ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setQuizSubmitted(true)}
                  >
                    Submit Quiz Answers
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="badge badge-approved">
                      <IconCheck size={12} /> Response Recorded
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setQuizSubmitted(false)}
                    >
                      Reset Attempt
                    </button>
                  </div>
                )}

                {!canRevealAnswers && (
                  <div className="text-xs text-secondary flex items-center gap-1">
                    <IconEyeOff size={14} />
                    {revealPolicy === 'Teacher Only'
                      ? 'Answer keys are reserved for teacher assessment.'
                      : 'Answer feedback will unlock after submitting answers.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Differentiated Practice */}
        <div className="student-section">
          <div className="student-section-header flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ margin: 0 }}>
              4. Differentiated Practice Exercises
            </h3>
            <div className="flex gap-1">
              <button
                type="button"
                className={`btn btn-sm ${practiceTab === 'foundation' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPracticeTab('foundation')}
              >
                Foundation Practice
              </button>
              <button
                type="button"
                className={`btn btn-sm ${practiceTab === 'extension' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPracticeTab('extension')}
              >
                Extension Challenge
              </button>
            </div>
          </div>
          <div className="student-section-body">
            {practiceTab === 'foundation' && foundationAsset && (
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'var(--leading-relaxed)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {foundationAsset.content}
              </div>
            )}
            {practiceTab === 'extension' && extensionAsset && (
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'var(--leading-relaxed)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {extensionAsset.content}
              </div>
            )}
          </div>
        </div>

        {/* 5. Revision Sheet */}
        {revisionAsset && (
          <div className="student-section">
            <div className="student-section-header">
              <IconFileText size={18} style={{ color: 'var(--color-brand-600)' }} />
              <h3 className="text-base font-semibold" style={{ margin: 0 }}>
                5. Quick Reference &amp; Revision Sheet
              </h3>
            </div>
            <div className="student-section-body">
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'var(--leading-relaxed)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {revisionAsset.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
