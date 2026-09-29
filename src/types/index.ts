// ============================================================
// LessonFoundry — Shared Types
// ============================================================

// ── Auth ────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  role: 'teacher' | 'admin';
  createdAt: string;
}

// ── Unit Status ──────────────────────────────────────────────
export type UnitStatus = 'Draft' | 'Generating' | 'Generated' | 'Needs Review' | 'Approved';

// ── Asset Status ─────────────────────────────────────────────
export type AssetStatus = 'Draft' | 'Approved' | 'Needs Revision';

// ── Source ───────────────────────────────────────────────────
export type SourceType = 'PDF' | 'Document' | 'Text' | 'URL';
export type SourceStatus = 'Uploading' | 'Processing' | 'Ready' | 'Error';

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  trusted: boolean;
  size?: string;
  pages?: number;
  uploadedAt: string;
  version: number;
  preview?: string;
}

// ── Learning Objective ────────────────────────────────────────
export interface LearningObjective {
  id: string;
  identifier: string;   // e.g. "LO-1"
  text: string;
  bloomsLevel?: 'Remember' | 'Understand' | 'Apply' | 'Analyse' | 'Evaluate' | 'Create';
  assetCoverage?: ('Covered' | 'Partial' | 'Missing')[];
}

// ── Constraints ───────────────────────────────────────────────
export type DifficultyLevel = 'Foundation' | 'Core' | 'Extension';
export type AnswerRevealPolicy = 'Always' | 'After Attempt' | 'Teacher Only' | 'Never';

export interface Constraints {
  targetLevel: string;
  difficulty: DifficultyLevel;
  vocabularyConstraints: string;
  contentLength: 'Brief' | 'Standard' | 'Detailed';
  answerRevealPolicy: AnswerRevealPolicy;
  teacherNotes: string;
}

// ── Asset Types ───────────────────────────────────────────────
export type AssetType =
  | 'Concept Explanation'
  | 'Worked Example'
  | 'Formative Quiz'
  | 'Differentiated Practice — Foundation'
  | 'Differentiated Practice — Extension'
  | 'Revision Sheet';

export interface ObjectiveCoverage {
  objectiveId: string;
  identifier: string;
  status: 'Covered' | 'Partial' | 'Missing';
}

export interface AssetVersion {
  versionNumber: number;
  createdAt: string;
  note?: string;
  status: AssetStatus;
}

export interface ProvenanceInfo {
  sourceId: string;
  sourceName: string;
  sourceVersion: number;
  generatedAt: string;
  modelIdentifier: string;
  generationVersion: string;
}

export interface Asset {
  id: string;
  title: string;
  type: AssetType;
  status: AssetStatus;
  objectiveCoverage: ObjectiveCoverage[];
  lastUpdated: string;
  content: string;
  versions: AssetVersion[];
  provenance?: ProvenanceInfo;
}

// ── Quality Warning ───────────────────────────────────────────
export type WarningSeverity = 'Error' | 'Warning' | 'Info';

export interface QualityWarning {
  id: string;
  severity: WarningSeverity;
  type: string;
  affectedAssetId: string;
  affectedAssetTitle: string;
  problem: string;
  explanation: string;
  suggestedAction: string;
}

// ── Learning Unit ─────────────────────────────────────────────
export interface LearningUnit {
  id: string;
  title: string;
  subject: string;
  targetLevel: string;
  status: UnitStatus;
  createdAt: string;
  updatedAt: string;
  sources: Source[];
  objectives: LearningObjective[];
  constraints: Constraints;
  assets: Asset[];
  qualityWarnings: QualityWarning[];
}

// ── Version History ───────────────────────────────────────────
export interface VersionHistoryEntry {
  id: string;
  versionNumber: number;
  timestamp: string;
  sourceVersion: number;
  assetVersion: number;
  status: UnitStatus;
  modelIdentifier: string;
  generationVersion: string;
  teacherAction?: string;
  note?: string;
}

// ── Form State ────────────────────────────────────────────────
export interface FormFieldState {
  value: string;
  error?: string;
  touched: boolean;
}

// ── Navigation ────────────────────────────────────────────────
export type WorkspaceTab =
  | 'sources'
  | 'objectives'
  | 'learning-pack'
  | 'alignment'
  | 'quality'
  | 'review'
  | 'versions';

// ── Auth Forms ────────────────────────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}
