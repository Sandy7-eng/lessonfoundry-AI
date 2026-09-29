/**
 * Normalizers: map any UI/wizard/Gemini string to a valid Prisma enum value.
 * All functions are case-insensitive, trim whitespace, and handle common synonyms.
 * They never return an invalid value – they fall back to a safe default.
 */

// ── DifficultyLevel: FOUNDATION | CORE | EXTENSION
export function normalizeDifficulty(value?: string | null): 'FOUNDATION' | 'CORE' | 'EXTENSION' {
  const v = (value ?? '').trim().toUpperCase();
  if (v === 'FOUNDATION' || v === 'BEGINNER' || v === 'BASIC' || v === 'EASY' || v === 'LOWER') return 'FOUNDATION';
  if (v === 'EXTENSION' || v === 'ADVANCED' || v === 'HARD' || v === 'HIGHER' || v === 'CHALLENGE') return 'EXTENSION';
  // CORE is default – also matches "INTERMEDIATE", "STANDARD", grade strings, etc.
  return 'CORE';
}

// ── AnswerRevealPolicy: ALWAYS | AFTER_ATTEMPT | TEACHER_ONLY | NEVER
export function normalizeAnswerRevealPolicy(
  value?: string | null
): 'ALWAYS' | 'AFTER_ATTEMPT' | 'TEACHER_ONLY' | 'NEVER' {
  const v = (value ?? '').trim().toUpperCase().replace(/[\s\-]+/g, '_');
  if (v === 'ALWAYS' || v === 'SHOW_ALWAYS') return 'ALWAYS';
  if (v === 'TEACHER_ONLY' || v === 'TEACHER') return 'TEACHER_ONLY';
  if (v === 'NEVER' || v === 'HIDE') return 'NEVER';
  return 'AFTER_ATTEMPT'; // default
}

// ── SourceType: PDF | DOCUMENT | TEXT | URL
export function normalizeSourceType(value?: string | null): 'PDF' | 'DOCUMENT' | 'TEXT' | 'URL' {
  const v = (value ?? '').trim().toUpperCase();
  if (v === 'PDF') return 'PDF';
  if (v === 'URL' || v === 'LINK' || v === 'WEB') return 'URL';
  if (v === 'DOCUMENT' || v === 'DOC' || v === 'WORD' || v === 'DOCX') return 'DOCUMENT';
  return 'TEXT'; // default
}

// ── SourceStatus: UPLOADING | PROCESSING | READY | ERROR
export function normalizeSourceStatus(value?: string | null): 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR' {
  const v = (value ?? '').trim().toUpperCase();
  if (v === 'UPLOADING') return 'UPLOADING';
  if (v === 'PROCESSING') return 'PROCESSING';
  if (v === 'ERROR') return 'ERROR';
  return 'READY'; // default
}

// ── AssetType: exact enum values only; reject unknowns with fallback
const ASSET_TYPE_MAP: Record<string, 'CONCEPT_EXPLANATION' | 'WORKED_EXAMPLE' | 'FORMATIVE_QUIZ' | 'DIFFERENTIATED_PRACTICE_FOUNDATION' | 'DIFFERENTIATED_PRACTICE_EXTENSION' | 'REVISION_SHEET'> = {
  CONCEPT_EXPLANATION: 'CONCEPT_EXPLANATION',
  CONCEPT: 'CONCEPT_EXPLANATION',
  WORKED_EXAMPLE: 'WORKED_EXAMPLE',
  EXAMPLE: 'WORKED_EXAMPLE',
  FORMATIVE_QUIZ: 'FORMATIVE_QUIZ',
  QUIZ: 'FORMATIVE_QUIZ',
  DIFFERENTIATED_PRACTICE_FOUNDATION: 'DIFFERENTIATED_PRACTICE_FOUNDATION',
  FOUNDATION_PRACTICE: 'DIFFERENTIATED_PRACTICE_FOUNDATION',
  FOUNDATION: 'DIFFERENTIATED_PRACTICE_FOUNDATION',
  DIFFERENTIATED_PRACTICE_EXTENSION: 'DIFFERENTIATED_PRACTICE_EXTENSION',
  EXTENSION_PRACTICE: 'DIFFERENTIATED_PRACTICE_EXTENSION',
  EXTENSION: 'DIFFERENTIATED_PRACTICE_EXTENSION',
  REVISION_SHEET: 'REVISION_SHEET',
  REVISION: 'REVISION_SHEET',
};

export function normalizeAssetType(
  value?: string | null
): 'CONCEPT_EXPLANATION' | 'WORKED_EXAMPLE' | 'FORMATIVE_QUIZ' | 'DIFFERENTIATED_PRACTICE_FOUNDATION' | 'DIFFERENTIATED_PRACTICE_EXTENSION' | 'REVISION_SHEET' {
  const v = (value ?? '').trim().toUpperCase().replace(/[\s\-]+/g, '_');
  return ASSET_TYPE_MAP[v] ?? 'CONCEPT_EXPLANATION';
}

// ── AssetStatus / VersionStatus: DRAFT | APPROVED | NEEDS_REVISION
export function normalizeAssetStatus(value?: string | null): 'DRAFT' | 'APPROVED' | 'NEEDS_REVISION' {
  const v = (value ?? '').trim().toUpperCase().replace(/[\s\-]+/g, '_');
  if (v === 'APPROVED') return 'APPROVED';
  if (v === 'NEEDS_REVISION' || v === 'NEEDS_REVIEW') return 'NEEDS_REVISION';
  return 'DRAFT';
}

// ── QuestionDifficulty: FOUNDATION | CORE | EXTENSION
export function normalizeQuestionDifficulty(value?: string | null): 'FOUNDATION' | 'CORE' | 'EXTENSION' {
  return normalizeDifficulty(value);
}

// ── BloomLevel: REMEMBER | UNDERSTAND | APPLY | ANALYSE | EVALUATE | CREATE
export function normalizeBloomLevel(
  value?: string | null
): 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYSE' | 'EVALUATE' | 'CREATE' | undefined {
  if (!value) return undefined;
  const v = value.trim().toUpperCase();
  const valid = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYSE', 'ANALYZE', 'EVALUATE', 'CREATE'];
  if (!valid.includes(v)) return undefined;
  return v === 'ANALYZE' ? 'ANALYSE' : (v as 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYSE' | 'EVALUATE' | 'CREATE');
}

// ── UnitStatus: DRAFT | GENERATING | GENERATED | NEEDS_REVIEW | APPROVED
export function normalizeUnitStatus(
  value?: string | null
): 'DRAFT' | 'GENERATING' | 'GENERATED' | 'NEEDS_REVIEW' | 'APPROVED' {
  const v = (value ?? '').trim().toUpperCase().replace(/[\s\-]+/g, '_');
  if (v === 'GENERATING') return 'GENERATING';
  if (v === 'GENERATED') return 'GENERATED';
  if (v === 'NEEDS_REVIEW' || v === 'REVIEW') return 'NEEDS_REVIEW';
  if (v === 'APPROVED') return 'APPROVED';
  return 'DRAFT';
}
