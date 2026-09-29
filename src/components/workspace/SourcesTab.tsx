'use client';

import React, { useState } from 'react';
import type { Source } from '@/types';
import { formatDate, generateId } from '@/lib/utils';
import {
  IconPlus,
  IconUpload,
  IconFileText,
  IconShieldCheck,
  IconTrash,
  IconEye,
  IconCheck,
} from '../icons/Icons';

interface SourcesTabProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (sourceId: string) => void;
  onToggleTrusted: (sourceId: string) => void;
  onViewSource: (source: Source) => void;
}

export function SourcesTab({
  sources,
  onAddSource,
  onRemoveSource,
  onToggleTrusted,
  onViewSource,
}: SourcesTabProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Source['type']>('PDF');
  const [pages, setPages] = useState(12);
  const [previewText, setPreviewText] = useState('');
  const [isTrusted, setIsTrusted] = useState(true);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const calculatedSize = pages > 10 ? `${(pages * 0.15).toFixed(1)} MB` : `${pages * 85} KB`;

    const newSource: Source = {
      id: `src-${generateId()}`,
      name: name.trim(),
      type,
      status: 'Ready',
      trusted: isTrusted,
      size: calculatedSize,
      pages: Number(pages) || undefined,
      uploadedAt: new Date().toISOString(),
      version: 1,
      preview: previewText.trim() || 'Custom verified curriculum source document.',
    };

    onAddSource(newSource);
    setName('');
    setPreviewText('');
    setShowUploadModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Explanation */}
      <div
        className="card p-4 flex items-center justify-between flex-wrap gap-4"
        style={{
          borderLeft: '4px solid var(--color-success-600)',
          backgroundColor: 'var(--color-white)',
        }}
      >
        <div>
          <div className="font-semibold text-sm flex items-center gap-2">
            <IconShieldCheck size={18} style={{ color: 'var(--color-success-600)' }} />
            <span>Grounded Source Materials ({sources.length} Documents)</span>
          </div>
          <p className="text-xs text-secondary mt-1">
            LessonFoundry restricts all generation and formative checks strictly to statements present in verified sources.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowUploadModal(true)}
        >
          <IconPlus size={16} />
          <span>Upload Source Document</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div
        className="upload-zone"
        onClick={() => setShowUploadModal(true)}
      >
        <IconUpload size={32} className="text-secondary mb-2" />
        <div className="font-semibold text-sm">Upload syllabus, textbook chapter, or teacher notes</div>
        <div className="text-xs text-secondary mt-1">
          Supports PDF, Word Documents (.docx), and plain text files
        </div>
      </div>

      {/* Sources List */}
      <div className="flex flex-col gap-4">
        {sources.length === 0 ? (
          <div className="card empty-state">
            <IconFileText className="empty-state-icon" />
            <div className="empty-state-title">No sources uploaded yet</div>
            <p className="empty-state-desc">
              Attach curriculum documents so generated lesson assets remain factual and syllabus-accurate.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowUploadModal(true)}
            >
              <IconPlus size={16} /> Upload First Source
            </button>
          </div>
        ) : (
          sources.map((src) => (
            <div key={src.id} className="source-card">
              <div
                className={`source-icon-area ${src.trusted ? 'trusted' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => onViewSource(src)}
              >
                <IconFileText size={22} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div
                    className="font-semibold text-sm hover:underline cursor-pointer"
                    onClick={() => onViewSource(src)}
                    style={{ color: 'var(--color-brand-900)' }}
                  >
                    {src.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`badge ${src.trusted ? 'badge-approved' : 'badge-neutral'}`}
                      style={{ cursor: 'pointer', border: '1px solid transparent' }}
                      onClick={() => onToggleTrusted(src.id)}
                      title="Click to toggle trusted verification"
                    >
                      <IconShieldCheck size={12} />
                      {src.trusted ? 'Trusted Source' : 'Mark as Trusted'}
                    </button>
                    <span className="badge badge-neutral">v{src.version}</span>
                  </div>
                </div>

                <div className="text-xs text-secondary mb-2">
                  <span>{src.type}</span> • <span>{src.size || 'N/A'}</span>
                  {src.pages && <span> • {src.pages} pages</span>}
                  <span> • Uploaded {formatDate(src.uploadedAt)}</span>
                </div>

                {src.preview && (
                  <p
                    className="text-xs text-secondary truncate"
                    style={{
                      backgroundColor: 'var(--color-neutral-50)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius)',
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;{src.preview}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: 'var(--color-neutral-100)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onViewSource(src)}
                  >
                    <IconEye size={14} /> View Reference Text
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-xs"
                    onClick={() => {
                      if (confirm(`Remove source "${src.name}"?`)) {
                        onRemoveSource(src.id);
                      }
                    }}
                    style={{ color: 'var(--color-error-600)' }}
                  >
                    <IconTrash size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Source Modal */}
      {showUploadModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUploadModal(false);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h3 className="font-semibold text-lg">Add Curriculum Source</h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setShowUploadModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body flex flex-col gap-4">
                <div className="form-group">
                  <label htmlFor="source-doc-name" className="form-label form-label-required">Document Title / File Name</label>
                  <input
                    id="source-doc-name"
                    type="text"
                    className="input"
                    placeholder="e.g. Edexcel GCSE Biology Section 1.pdf"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label htmlFor="source-doc-type" className="form-label">Format</label>
                    <select
                      id="source-doc-type"
                      className="select"
                      value={type}
                      onChange={(e) => setType(e.target.value as Source['type'])}
                    >
                      <option value="PDF">PDF</option>
                      <option value="Document">Word Document (.docx)</option>
                      <option value="Text">Plain Text / Notes</option>
                      <option value="URL">Curriculum URL</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="source-page-count" className="form-label">Page Count</label>
                    <input
                      id="source-page-count"
                      type="number"
                      className="input"
                      value={pages}
                      onChange={(e) => setPages(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="source-excerpt-input" className="form-label">Reference Excerpt / Text Content</label>
                  <textarea
                    id="source-excerpt-input"
                    className="textarea"
                    rows={4}
                    placeholder="Paste textbook excerpt or syllabus notes here..."
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                  />
                  <span className="form-hint">Used for factual grounding and hallucination prevention.</span>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="is-trusted-check"
                    checked={isTrusted}
                    onChange={(e) => setIsTrusted(e.target.checked)}
                  />
                  <label htmlFor="is-trusted-check" className="checkbox-label font-medium">
                    Mark as Verified Trusted Curriculum Reference
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!name.trim()}
                >
                  <IconCheck size={16} /> Attach Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
