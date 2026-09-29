import { z } from 'zod';

// ── Enums
export const UserRoleSchema = z.enum(['TEACHER', 'ADMIN']);
export const UnitStatusSchema = z.enum(['DRAFT', 'GENERATING', 'NEEDS_REVIEW', 'APPROVED']);
export const SourceTypeSchema = z.enum(['PDF', 'DOCUMENT', 'TEXT', 'URL']);
export const SourceStatusSchema = z.enum(['UPLOADING', 'PROCESSING', 'READY', 'ERROR']);
export const AssetTypeSchema = z.enum([
  'CONCEPT_EXPLANATION',
  'WORKED_EXAMPLE',
  'FORMATIVE_QUIZ',
  'DIFFERENTIATED_PRACTICE_FOUNDATION',
  'DIFFERENTIATED_PRACTICE_EXTENSION',
  'REVISION_SHEET',
]);
export const AssetStatusSchema = z.enum(['DRAFT', 'APPROVED', 'NEEDS_REVISION']);
export const ReviewStatusSchema = z.enum(['DRAFT', 'APPROVED', 'NEEDS_REVISION']);
export const QuestionDifficultySchema = z.enum(['FOUNDATION', 'CORE', 'EXTENSION']);
export const BloomLevelSchema = z.enum([
  'REMEMBER',
  'UNDERSTAND',
  'APPLY',
  'ANALYSE',
  'EVALUATE',
  'CREATE',
]);
export const DifficultyLevelSchema = z.enum(['FOUNDATION', 'CORE', 'EXTENSION']);
export const AnswerRevealPolicySchema = z.enum([
  'ALWAYS',
  'AFTER_ATTEMPT',
  'TEACHER_ONLY',
  'NEVER',
]);
export const ContentLengthSchema = z.enum(['BRIEF', 'STANDARD', 'DETAILED']);
export const ObjectiveCoverageStatusSchema = z.enum(['COVERED', 'PARTIAL', 'MISSING']);
export const QualityIssueSeveritySchema = z.enum(['ERROR', 'WARNING', 'INFO']);
export const QualityIssueStatusSchema = z.enum(['OPEN', 'RESOLVED', 'DISMISSED']);
export const VersionStatusSchema = z.enum(['DRAFT', 'GENERATING', 'NEEDS_REVIEW', 'APPROVED']);

// ── User Schemas
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  role: UserRoleSchema.optional().default('TEACHER'),
});

export const UpdateUserSchema = CreateUserSchema.partial();

// ── Unit Schemas
export const CreateUnitSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  title: z.string().min(1, 'Unit title is required'),
  subject: z.string().min(1, 'Subject is required'),
  targetLevel: z.string().min(1, 'Target level is required'),
  status: UnitStatusSchema.optional().default('DRAFT'),
});

export const UpdateUnitSchema = z.object({
  title: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  targetLevel: z.string().min(1).optional(),
  status: UnitStatusSchema.optional(),
});

// ── Source Schemas
export const CreateSourceSchema = z.object({
  unitId: z.string().min(1, 'unitId is required'),
  name: z.string().min(1, 'Source name is required'),
  type: SourceTypeSchema,
  trusted: z.boolean().optional().default(false),
  sizeBytes: z.number().int().nonnegative().optional(),
  pageCount: z.number().int().nonnegative().optional(),
  preview: z.string().optional(),
});

export const UpdateSourceSchema = CreateSourceSchema.partial().omit({ unitId: true });

// ── Objective Schemas
export const CreateObjectiveSchema = z.object({
  unitId: z.string().min(1, 'unitId is required'),
  identifier: z.string().min(1, 'Identifier is required (e.g. LO1)'),
  text: z.string().min(1, 'Objective text is required'),
  bloomLevel: BloomLevelSchema.optional(),
  displayOrder: z.number().int().optional().default(0),
});

export const UpdateObjectiveSchema = CreateObjectiveSchema.partial().omit({ unitId: true });

// ── Constraint Schemas
export const CreateConstraintSchema = z.object({
  unitId: z.string().min(1, 'unitId is required'),
  difficulty: DifficultyLevelSchema.optional().default('CORE'),
  vocabularyConstraints: z.string().optional(),
  contentLength: ContentLengthSchema.optional().default('STANDARD'),
  answerRevealPolicy: AnswerRevealPolicySchema.optional().default('AFTER_ATTEMPT'),
  teacherNotes: z.string().optional(),
});

export const UpdateConstraintSchema = CreateConstraintSchema.partial().omit({ unitId: true });

// ── Asset Schemas
export const CreateAssetSchema = z.object({
  unitId: z.string().min(1, 'unitId is required'),
  type: AssetTypeSchema,
  title: z.string().min(1, 'Asset title is required'),
  content: z.string().min(1, 'Content is required'),
  status: AssetStatusSchema.optional().default('DRAFT'),
  version: z.number().int().positive().optional().default(1),
});

export const UpdateAssetSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  status: AssetStatusSchema.optional(),
  version: z.number().int().positive().optional(),
});

// ── Question Schemas
export const CreateQuestionSchema = z.object({
  assetId: z.string().min(1, 'assetId is required'),
  content: z.string().min(1, 'Question content is required'),
  answer: z.string().min(1, 'Question answer is required'),
  difficulty: QuestionDifficultySchema.optional().default('CORE'),
  displayOrder: z.number().int().optional().default(0),
});

export const UpdateQuestionSchema = CreateQuestionSchema.partial().omit({ assetId: true });

// ── Objective Alignment Schema
export const CreateObjectiveAlignmentSchema = z.object({
  objectiveId: z.string().min(1, 'objectiveId is required'),
  assetId: z.string().optional(),
  questionId: z.string().optional(),
  status: ObjectiveCoverageStatusSchema.optional().default('PARTIAL'),
});

// ── Review Schema
export const CreateReviewSchema = z.object({
  assetId: z.string().min(1, 'assetId is required'),
  userId: z.string().min(1, 'userId is required'),
  status: ReviewStatusSchema.optional().default('DRAFT'),
  comment: z.string().optional(),
});

export const UpdateReviewSchema = z.object({
  status: ReviewStatusSchema.optional(),
  comment: z.string().optional(),
});

// ── Quality Issue Schema
export const CreateQualityIssueSchema = z.object({
  unitId: z.string().min(1, 'unitId is required'),
  assetId: z.string().optional(),
  questionId: z.string().optional(),
  type: z.string().min(1, 'Issue type is required'),
  severity: QualityIssueSeveritySchema,
  description: z.string().min(1, 'Description is required'),
  explanation: z.string().optional(),
  suggestedAction: z.string().optional(),
  status: QualityIssueStatusSchema.optional().default('OPEN'),
});

export const ResolveQualityIssueSchema = z.object({
  status: QualityIssueStatusSchema,
});

// ── Version & Provenance Schemas
export const CreateUnitVersionSchema = z.object({
  unitId: z.string().min(1, 'unitId is required'),
  versionNumber: z.number().int().positive(),
  status: VersionStatusSchema,
  assetVersionCount: z.number().int().nonnegative().optional().default(0),
  sourceVersion: z.number().int().positive().optional().default(1),
  modelIdentifier: z.string().optional(),
  generationVersion: z.string().optional(),
  teacherAction: z.string().optional(),
  note: z.string().optional(),
});

export const CreateProvenanceSchema = z.object({
  assetId: z.string().optional(),
  sourceId: z.string().optional(),
  modelIdentifier: z.string().min(1, 'modelIdentifier is required'),
  generationVersion: z.string().min(1, 'generationVersion is required'),
  generationConfig: z.record(z.string(), z.unknown()).optional(),
});
