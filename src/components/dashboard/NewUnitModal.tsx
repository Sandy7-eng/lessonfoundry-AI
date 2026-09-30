'use client';

import React, { useRef, useState } from 'react';
import type { LearningUnit, Source, LearningObjective, DifficultyLevel, AnswerRevealPolicy } from '@/types';
import { SUBJECTS, TARGET_LEVELS, MOCK_CONSTRAINTS } from '@/lib/mockData';
import { generateId } from '@/lib/utils';
import { Modal } from '../common/Modal';
import {
  IconCheck,
  IconUpload,
  IconFileText,
  IconShieldCheck,
  IconSparkles,
  IconTrash,
  IconPlus,
} from '../icons/Icons';

interface NewUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUnit: (newUnit: LearningUnit) => void;
}

export function NewUnitModal({ isOpen, onClose, onCreateUnit }: NewUnitModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Details
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [targetLevel, setTargetLevel] = useState(TARGET_LEVELS[3]); // GCSE Year 10

  // Step 2: Sources
  const [sources, setSources] = useState<Source[]>([
    {
      id: generateId(),
      name: 'Curriculum_Topic_Guide.pdf',
      type: 'PDF',
      status: 'Ready',
      trusted: true,
      size: '1.8 MB',
      pages: 14,
      uploadedAt: new Date().toISOString(),
      version: 1,
      preview: 'Course syllabus outline, mandatory learning objectives, and core terminology.',
    },
  ]);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<'PDF' | 'Document' | 'Text'>('PDF');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const inferSourceType = (fileName: string): Source['type'] => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'PDF';
    if (extension === 'doc' || extension === 'docx') return 'Document';
    return 'Text';
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const uploadedSources: Source[] = selectedFiles.map((file) => ({
      id: generateId(),
      name: file.name,
      type: inferSourceType(file.name),
      status: 'Ready',
      trusted: true,
      size: formatFileSize(file.size),
      pages: file.type === 'application/pdf' ? Math.max(1, Math.ceil(file.size / 25000)) : 1,
      uploadedAt: new Date().toISOString(),
      version: 1,
      preview: `Uploaded curriculum source: ${file.name}`,
    }));

    setSources((current) => [...current, ...uploadedSources]);
    event.target.value = '';
  };

  // Step 3: Objectives & Constraints
  const [objectives, setObjectives] = useState<LearningObjective[]>([
    {
      id: generateId(),
      identifier: 'LO-1',
      text: 'Explain core principles and terminology of the topic.',
      bloomsLevel: 'Understand',
    },
  ]);
  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Core');
  const [answerPolicy, setAnswerPolicy] = useState<AnswerRevealPolicy>('After Attempt');
  const [vocabularyConstraints, setVocabularyConstraints] = useState(
    'Use standard national curriculum terminology. Define key terms explicitly upon first introduction.'
  );

  const handleAddSource = () => {
    if (!newSourceName.trim()) return;
    const addedSource: Source = {
      id: generateId(),
      name: newSourceName.trim(),
      type: newSourceType,
      status: 'Ready',
      trusted: true,
      size: '500 KB',
      pages: 5,
      uploadedAt: new Date().toISOString(),
      version: 1,
      preview: 'User-provided supplementary source content.',
    };
    setSources([...sources, addedSource]);
    setNewSourceName('');
  };

  const handleRemoveSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  const handleAddObjective = () => {
    if (!newObjectiveText.trim()) return;
    const newObj: LearningObjective = {
      id: generateId(),
      identifier: `LO-${objectives.length + 1}`,
      text: newObjectiveText.trim(),
      bloomsLevel: 'Apply',
    };
    setObjectives([...objectives, newObj]);
    setNewObjectiveText('');
  };

  const handleRemoveObjective = (id: string) => {
    setObjectives(objectives.filter((o) => o.id !== id));
  };

  // Map DB enum → frontend display type for AssetType
  const mapAssetType = (dbType: string): import('@/types').AssetType => {
    const map: Record<string, import('@/types').AssetType> = {
      CONCEPT_EXPLANATION: 'Concept Explanation',
      WORKED_EXAMPLE: 'Worked Example',
      FORMATIVE_QUIZ: 'Formative Quiz',
      DIFFERENTIATED_PRACTICE_FOUNDATION: 'Differentiated Practice — Foundation',
      DIFFERENTIATED_PRACTICE_EXTENSION: 'Differentiated Practice — Extension',
      REVISION_SHEET: 'Revision Sheet',
    };
    return map[dbType] ?? 'Concept Explanation';
  };

  // Map DB enum → frontend AssetStatus
  const mapAssetStatus = (dbStatus: string): import('@/types').AssetStatus => {
    if (dbStatus === 'APPROVED') return 'Approved';
    if (dbStatus === 'NEEDS_REVISION') return 'Needs Revision';
    return 'Draft';
  };

  // Map DB enum → frontend UnitStatus
  const mapUnitStatus = (dbStatus: string): import('@/types').UnitStatus => {
    if (dbStatus === 'GENERATED') return 'Generated';
    if (dbStatus === 'NEEDS_REVIEW') return 'Needs Review';
    if (dbStatus === 'APPROVED') return 'Approved';
    if (dbStatus === 'GENERATING') return 'Generating';
    return 'Draft';
  };

  type ApiObjective = {
    id: string;
    identifier: string;
    text: string;
  };

  type ApiAlignment = {
    objectiveId: string;
    status?: 'COVERED' | 'PARTIAL' | 'MISSING';
  };

  type ApiAsset = {
    id: string;
    title: string;
    type: string;
    status: string;
    alignments?: ApiAlignment[];
    reviews?: Array<{
      status: string;
      comment?: string | null;
      createdAt: string;
      user?: { name: string };
    }>;
    assetVersions?: Array<{
      versionNumber: number;
      createdAt: string;
      note?: string | null;
      status: string;
    }>;
    provenances?: Array<{
      sourceId?: string | null;
      generatedAt: string;
      modelIdentifier: string;
      generationVersion: string;
    }>;
    updatedAt?: string;
    content?: string;
  };

  type ApiSource = {
    id: string;
    name: string;
    type: string;
    trusted: boolean;
    createdAt: string;
    version: number;
    preview?: string | null;
  };

  type ApiQualityIssue = {
    id: string;
    type: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    description: string;
    explanation?: string | null;
    suggestedAction?: string | null;
    assetId?: string | null;
    questionId?: string | null;
    status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
    asset?: {
      id: string;
      title: string;
      type: string;
    } | null;
  };

  type ApiUnit = {
    title?: string;
    subject?: string;
    targetLevel?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    objectives?: ApiObjective[];
    assets?: ApiAsset[];
    sources?: ApiSource[];
    qualityIssues?: ApiQualityIssue[];
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationProgress(15);
    
    try {
      const unitPayload = {
        title: title.trim() || 'Untitled Curriculum Unit',
        subject,
        targetLevel,
        constraints: { difficulty, vocabularyConstraints, answerRevealPolicy: answerPolicy },
        sources: sources.map(s => ({ name: s.name, type: s.type, preview: s.preview })),
        objectives: objectives.map(o => ({ identifier: o.identifier, text: o.text }))
      };
      
      const initRes = await fetch('/api/units/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitPayload)
      });
      
      if (!initRes.ok) {
        const err = await initRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to initialize unit');
      }
      const { unitId } = await initRes.json();
      
      setGenerationProgress(50);
      
      const genRes = await fetch(`/api/units/${unitId}/generate`, { method: 'POST' });
      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate pack');
      }
      
      setGenerationProgress(90);
      
      // Fetch the full unit from API to get real assets
      const unitRes = await fetch(`/api/units/${unitId}`);
      if (!unitRes.ok) {
        const err = await unitRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch generated unit');
      }
      const dbUnit = await unitRes.json();
      
      setGenerationProgress(100);
      
      setTimeout(() => {
        finishCreation(unitId, dbUnit);
      }, 600);
    } catch (error: unknown) {
      console.error('Generation Error', error);
      setIsGenerating(false);
      setGenerationProgress(0);
      const message = error instanceof Error ? error.message : 'Generation failed. Please try again.';
      setErrorMsg(message);
    }
  };

  const finishCreation = (unitId: string, dbUnit: ApiUnit) => {
    const objectiveMap = new Map<string, ApiObjective>((dbUnit.objectives ?? []).map((objective) => [objective.id, objective]));

    const mappedAssets: LearningUnit['assets'] = (dbUnit.assets ?? []).map((asset) => {
      const coverageMap = new Map<string, { objectiveId: string; identifier: string; status: 'Covered' | 'Partial' | 'Missing' }>();
      const alignments = Array.isArray(asset.alignments) ? asset.alignments : [];

      for (const alignment of alignments) {
        const objective = objectiveMap.get(alignment.objectiveId);
        if (!objective) continue;

        const status = alignment.status === 'COVERED' ? 'Covered' : alignment.status === 'PARTIAL' ? 'Partial' : 'Missing';
        const existing = coverageMap.get(alignment.objectiveId);
        if (!existing || (existing.status === 'Missing' && status !== 'Missing')) {
          coverageMap.set(alignment.objectiveId, {
            objectiveId: alignment.objectiveId,
            identifier: objective.identifier,
            status,
          });
        }
      }

      return {
        id: asset.id,
        title: asset.title,
        type: mapAssetType(asset.type),
        status: mapAssetStatus(asset.status),
        objectiveCoverage: Array.from(coverageMap.values()),
        lastUpdated: asset.updatedAt ?? new Date().toISOString(),
        content: asset.content ?? '',
        review: asset.reviews?.[0] ? {
          status: mapAssetStatus(asset.reviews[0].status),
          reviewerName: asset.reviews[0].user?.name ?? 'Teacher',
          reviewedAt: asset.reviews[0].createdAt,
          comment: asset.reviews[0].comment ?? undefined,
        } : undefined,
        versions: (asset.assetVersions ?? []).map((version) => ({
          versionNumber: version.versionNumber,
          createdAt: version.createdAt,
          note: version.note ?? undefined,
          status: mapAssetStatus(version.status),
        })),
        provenance: asset.provenances?.[0] ? {
          sourceId: asset.provenances[0].sourceId ?? '',
          sourceName: dbUnit.sources?.[0]?.name ?? 'Source',
          sourceVersion: 1,
          generatedAt: asset.provenances[0].generatedAt,
          modelIdentifier: asset.provenances[0].modelIdentifier,
          generationVersion: asset.provenances[0].generationVersion,
        } : undefined,
      };
    });

    const mappedSources: LearningUnit['sources'] = (dbUnit.sources ?? []).map((source) => ({
      id: source.id,
      name: source.name,
      type: source.type as LearningUnit['sources'][0]['type'],
      status: 'Ready' as const,
      trusted: source.trusted,
      uploadedAt: source.createdAt,
      version: source.version,
      preview: source.preview ?? undefined,
    }));

    const mappedObjectives: LearningUnit['objectives'] = (dbUnit.objectives ?? []).map((objective) => ({
      id: objective.id,
      identifier: objective.identifier,
      text: objective.text,
      bloomsLevel: undefined,
    }));

    const mappedQualityWarnings: LearningUnit['qualityWarnings'] = (dbUnit.qualityIssues ?? []).filter((issue) => issue.status === 'OPEN').map((issue) => ({
      id: issue.id,
      severity: issue.severity === 'ERROR' ? 'Error' : issue.severity === 'WARNING' ? 'Warning' : 'Info',
      type: issue.type,
      affectedAssetId: issue.assetId ?? issue.asset?.id ?? '',
      affectedAssetTitle: issue.asset?.title ?? 'Generated Asset',
      problem: issue.description,
      explanation: issue.explanation ?? 'No additional explanation provided.',
      suggestedAction: issue.suggestedAction ?? 'Review the generated content for remediation.',
    }));

    const newUnit: LearningUnit = {
      id: unitId,
      title: dbUnit.title ?? (title.trim() || 'Untitled Curriculum Unit'),
      subject: dbUnit.subject ?? subject,
      targetLevel: dbUnit.targetLevel ?? targetLevel,
      status: mapUnitStatus(dbUnit.status ?? 'DRAFT'),
      createdAt: dbUnit.createdAt ?? new Date().toISOString(),
      updatedAt: dbUnit.updatedAt ?? new Date().toISOString(),
      sources: mappedSources.length > 0 ? mappedSources : sources,
      objectives: mappedObjectives.length > 0 ? mappedObjectives : objectives,
      constraints: {
        ...MOCK_CONSTRAINTS,
        targetLevel,
        difficulty,
        vocabularyConstraints,
        answerRevealPolicy: answerPolicy,
      },
      assets: mappedAssets,
      qualityWarnings: mappedQualityWarnings,
    };

    setIsGenerating(false);
    onCreateUnit(newUnit);
    onClose();
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Learning Unit"
      maxWidth="680px"
    >
      {/* Steps Indicator */}
      <div className="steps" style={{ marginBottom: 'var(--space-6)' }}>
        <div className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'complete' : ''}`}>
          <div className="step-num">{currentStep > 1 ? <IconCheck size={14} /> : '1'}</div>
          <span className="step-label">Details</span>
        </div>
        <div className={`step-line ${currentStep > 1 ? 'complete' : ''}`} />
        <div className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'complete' : ''}`}>
          <div className="step-num">{currentStep > 2 ? <IconCheck size={14} /> : '2'}</div>
          <span className="step-label">Sources</span>
        </div>
        <div className={`step-line ${currentStep > 2 ? 'complete' : ''}`} />
        <div className={`step ${currentStep === 3 ? 'active' : currentStep > 3 ? 'complete' : ''}`}>
          <div className="step-num">{currentStep > 3 ? <IconCheck size={14} /> : '3'}</div>
          <span className="step-label">Pedagogy</span>
        </div>
        <div className={`step-line ${currentStep > 3 ? 'complete' : ''}`} />
        <div className={`step ${currentStep === 4 ? 'active' : ''}`}>
          <div className="step-num">4</div>
          <span className="step-label">Generate</span>
        </div>
      </div>

      {/* Step 1: Unit Details */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label htmlFor="unit-title-input" className="form-label form-label-required">Unit Title / Topic</label>
            <input
              id="unit-title-input"
              type="text"
              className="input"
              placeholder="e.g. Plate Tectonics and Volcanic Hazards"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <span className="form-hint">A clear descriptive title for teachers and learners.</span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="unit-subject-select" className="form-label form-label-required">Subject Area</label>
              <select
                id="unit-subject-select"
                className="select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="unit-level-select" className="form-label form-label-required">Target Level</label>
              <select
                id="unit-level-select"
                className="select"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
              >
                {TARGET_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Sources */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="font-medium text-sm mb-1">Attached Source Documents</div>
            <p className="text-xs text-secondary mb-3">
              LessonFoundry references these documents exclusively to maintain factual fidelity.
            </p>

            <div className="flex flex-col gap-2 mb-4">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="flex items-center justify-between p-3 border rounded"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-neutral-50)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <IconFileText size={16} className="text-secondary" />
                    <span className="text-sm font-medium">{src.name}</span>
                    <span className="trusted-badge">
                      <IconShieldCheck size={12} /> Trusted
                    </span>
                  </div>
                  {sources.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => handleRemoveSource(src.id)}
                      style={{ color: 'var(--color-error-600)' }}
                    >
                      <IconTrash size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelection}
            />
            <div
              className="upload-zone mb-4"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <IconUpload size={28} className="text-secondary mb-2" />
              <div className="font-semibold text-sm">Click to upload curriculum documents</div>
              <div className="text-xs text-secondary mt-1">PDF, DOCX, TXT, or multiple files</div>
            </div>

            {/* Quick add manual source */}
            <div className="flex gap-2">
              <select
                className="select"
                style={{ width: 'auto', minWidth: '100px' }}
                value={newSourceType}
                onChange={(e) => setNewSourceType(e.target.value as 'PDF' | 'Document' | 'Text')}
              >
                <option value="PDF">PDF</option>
                <option value="Document">Word Doc</option>
                <option value="Text">Notes / URL</option>
              </select>
              <input
                type="text"
                className="input text-sm flex-1"
                placeholder="Or paste textbook chapter name / reference URL..."
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSource();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddSource}
              >
                <IconPlus size={14} /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Pedagogy & Constraints */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-4">
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="pedagogy-difficulty" className="form-label">Difficulty Band</label>
              <select
                id="pedagogy-difficulty"
                className="select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              >
                <option value="Foundation">Foundation (Scaffolded)</option>
                <option value="Core">Core (Standard Curriculum)</option>
                <option value="Extension">Extension (Advanced / Higher Tier)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pedagogy-answer-policy" className="form-label">Answer Reveal Policy</label>
              <select
                id="pedagogy-answer-policy"
                className="select"
                value={answerPolicy}
                onChange={(e) => setAnswerPolicy(e.target.value as AnswerRevealPolicy)}
              >
                <option value="After Attempt">After Attempt (Recommended)</option>
                <option value="Teacher Only">Teacher Only (Restricted)</option>
                <option value="Always">Always Visible</option>
                <option value="Never">Never (Assessment Mode)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pedagogy-vocab-rules" className="form-label">Vocabulary & Terminology Rules</label>
            <input
              id="pedagogy-vocab-rules"
              type="text"
              className="input"
              value={vocabularyConstraints}
              onChange={(e) => setVocabularyConstraints(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-objective-input" className="form-label">Learning Objectives (LOs)</label>
            <div className="flex flex-col gap-2 mb-2">
              {objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-center justify-between p-2 border rounded text-sm"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-white)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="badge badge-brand">{obj.identifier}</span>
                    <span>{obj.text}</span>
                  </div>
                  {objectives.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => handleRemoveObjective(obj.id)}
                    >
                      <IconTrash size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                id="new-objective-input"
                type="text"
                className="input text-sm flex-1"
                placeholder="Add another learning objective (e.g. Compare process X to Y)..."
                value={newObjectiveText}
                onChange={(e) => setNewObjectiveText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddObjective();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddObjective}
              >
                <IconPlus size={14} /> Add LO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Generate */}
      {currentStep === 4 && (
        <div>
          {isGenerating ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <div className="spinner spinner-lg mb-4" style={{ color: 'var(--color-brand-600)' }} />
              <div className="empty-state-title">Synthesizing Pedagogical Pack...</div>
              <p className="empty-state-desc">
                Analyzing verified sources, checking alignment against {objectives.length} objectives, and assembling 6 differentiated assets.
              </p>
              <div
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  height: '8px',
                  backgroundColor: 'var(--color-neutral-200)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  marginTop: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${generationProgress}%`,
                    backgroundColor: 'var(--color-brand-600)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          ) : errorMsg ? (
            <div>
              <div className="alert alert-error mb-4" style={{ backgroundColor: 'var(--color-error-50)', color: 'var(--color-error-800)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error-200)' }}>
                <div className="font-semibold mb-1 text-sm">Generation Failed</div>
                <p className="text-sm m-0">{errorMsg}</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="alert alert-info mb-4">
                <IconSparkles size={18} style={{ flexShrink: 0 }} />
                <div>
                  <div className="font-semibold mb-1">Ready to Generate Learning Pack</div>
                  <p className="text-xs" style={{ margin: 0 }}>
                    LessonFoundry will produce 6 aligned teaching assets: Concept Explanation, Worked Example, Formative Quiz, Foundation Practice, Extension Practice, and Revision Sheet.
                  </p>
                </div>
              </div>

              <div className="card p-4 text-sm flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-secondary">Unit Title:</span>
                  <span className="font-medium">{title || 'Untitled Unit'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Subject & Level:</span>
                  <span className="font-medium">{subject} • {targetLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Source Documents:</span>
                  <span className="font-medium">{sources.length} verified sources</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Learning Objectives:</span>
                  <span className="font-medium">{objectives.length} objectives defined</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Difficulty & Reveal:</span>
                  <span className="font-medium">{difficulty} • {answerPolicy}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
        {currentStep > 1 && !isGenerating ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Back
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={currentStep === 1 && !title.trim()}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              disabled={isGenerating}
              onClick={handleStartGeneration}
            >
              <IconSparkles size={16} />
              <span>{isGenerating ? 'Generating...' : errorMsg ? 'Retry Generation' : 'Generate Learning Pack'}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
