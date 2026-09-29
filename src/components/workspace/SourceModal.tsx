'use client';

import React from 'react';
import type { Source } from '@/types';
import { Modal } from '../common/Modal';
import { IconShieldCheck, IconFileText } from '../icons/Icons';
import { formatDate } from '@/lib/utils';

interface SourceModalProps {
  source: Source | null;
  onClose: () => void;
  onToggleTrusted: (sourceId: string) => void;
}

export function SourceModal({ source, onClose, onToggleTrusted }: SourceModalProps) {
  if (!source) return null;

  return (
    <Modal
      isOpen={!!source}
      onClose={onClose}
      title={source.name}
      maxWidth="680px"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            className={`btn ${source.trusted ? 'btn-success' : 'btn-secondary'} btn-sm`}
            onClick={() => onToggleTrusted(source.id)}
          >
            <IconShieldCheck size={14} />
            <span>{source.trusted ? 'Trusted Source (Active)' : 'Mark as Trusted'}</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Source metadata banner */}
        <div
          className="flex items-center justify-between p-3 border rounded"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-neutral-50)' }}
        >
          <div className="flex items-center gap-3">
            <div className={`source-icon-area ${source.trusted ? 'trusted' : ''}`}>
              <IconFileText size={20} />
            </div>
            <div>
              <div className="font-semibold text-sm">{source.name}</div>
              <div className="text-xs text-secondary">
                {source.type} • {source.size || 'Unknown size'} • {source.pages ? `${source.pages} pages` : 'Document'} • Uploaded {formatDate(source.uploadedAt)}
              </div>
            </div>
          </div>
          <div>
            {source.trusted ? (
              <span className="trusted-badge">
                <IconShieldCheck size={12} /> Trusted Reference
              </span>
            ) : (
              <span className="badge badge-neutral">Untrusted</span>
            )}
          </div>
        </div>

        {/* Source Content Preview */}
        <div>
          <h4 className="text-xs font-semibold text-secondary uppercase mb-2" style={{ letterSpacing: '0.05em' }}>
            Extracted Text Reference
          </h4>
          <div
            className="p-4 border rounded"
            style={{
              backgroundColor: 'var(--color-white)',
              borderColor: 'var(--color-border)',
              maxHeight: '300px',
              overflowY: 'auto',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {source.preview || 'No text preview available for this source document.'}
          </div>
        </div>

        {/* Provenance note */}
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-brand-50)',
            border: '1px solid var(--color-brand-200)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-brand-800)',
          }}
        >
          <strong>Pedagogical Grounding:</strong> LessonFoundry strictly limits AI output generation and verification checks to the statements contained in verified sources.
        </div>
      </div>
    </Modal>
  );
}
