// ============================================================
// LessonFoundry — Mock Data
// Realistic data for visual development and review
// ============================================================

import type {
  User,
  LearningUnit,
  Source,
  LearningObjective,
  Constraints,
  Asset,
  QualityWarning,
  VersionHistoryEntry,
} from '@/types';

// ── Current User ─────────────────────────────────────────────
export const MOCK_USER: User = {
  id: 'user-001',
  name: 'Sarah Mitchell',
  email: 'sarah.mitchell@westbrook.edu',
  avatarInitials: 'SM',
  role: 'teacher',
  createdAt: '2026-01-10T09:00:00Z',
};

// ── Sources ───────────────────────────────────────────────────
export const MOCK_SOURCES: Source[] = [
  {
    id: 'src-001',
    name: 'Chapter 4 — Cell Division.pdf',
    type: 'PDF',
    status: 'Ready',
    trusted: true,
    size: '2.4 MB',
    pages: 18,
    uploadedAt: '2026-09-25T10:15:00Z',
    version: 1,
    preview: 'Cell division is the process by which a parent cell divides into two or more daughter cells. Cell division usually occurs as part of a larger cell cycle in which the cell grows, replicates its DNA, and then divides. In eukaryotes, there are two distinct types of cell division...',
  },
  {
    id: 'src-002',
    name: 'GCSE Biology Specification 2024.pdf',
    type: 'PDF',
    status: 'Ready',
    trusted: true,
    size: '5.1 MB',
    pages: 72,
    uploadedAt: '2026-09-24T14:30:00Z',
    version: 1,
    preview: 'The specification content for GCSE Biology covers the following topics: Cell Biology, Organisation, Infection and Response, Bioenergetics, Homeostasis and Response, Inheritance, Variation and Evolution...',
  },
  {
    id: 'src-003',
    name: 'Teacher supplementary notes.docx',
    type: 'Document',
    status: 'Ready',
    trusted: true,
    size: '128 KB',
    pages: 4,
    uploadedAt: '2026-09-26T09:00:00Z',
    version: 1,
    preview: 'Key points for Year 10 class: Students should be comfortable with basic cell structure before approaching this topic. Common misconceptions include confusing mitosis with meiosis...',
  },
];

// ── Objectives ────────────────────────────────────────────────
export const MOCK_OBJECTIVES: LearningObjective[] = [
  {
    id: 'obj-001',
    identifier: 'LO-1',
    text: 'Describe the stages of mitosis and explain the significance of each stage in producing genetically identical daughter cells.',
    bloomsLevel: 'Understand',
    assetCoverage: ['Covered', 'Covered', 'Covered', 'Covered', 'Covered', 'Covered'],
  },
  {
    id: 'obj-002',
    identifier: 'LO-2',
    text: 'Compare and contrast mitosis and meiosis, identifying the key differences in process and outcomes.',
    bloomsLevel: 'Analyse',
    assetCoverage: ['Covered', 'Covered', 'Partial', 'Covered', 'Partial', 'Covered'],
  },
  {
    id: 'obj-003',
    identifier: 'LO-3',
    text: 'Apply knowledge of cell division to explain growth, repair, and reproduction in living organisms.',
    bloomsLevel: 'Apply',
    assetCoverage: ['Partial', 'Covered', 'Partial', 'Partial', 'Missing', 'Partial'],
  },
];

// ── Constraints ───────────────────────────────────────────────
export const MOCK_CONSTRAINTS: Constraints = {
  targetLevel: 'GCSE Year 10 (Ages 14–15)',
  difficulty: 'Core',
  vocabularyConstraints: 'Use standard GCSE Biology terminology. Define all scientific terms on first use. Avoid A-level concepts unless clearly labelled as extension.',
  contentLength: 'Standard',
  answerRevealPolicy: 'After Attempt',
  teacherNotes: 'This class has mixed ability. Some students have previously struggled with the stages of mitosis — use memory aids where helpful. The quiz should not include trick questions.',
};

// ── Assets ────────────────────────────────────────────────────
export const MOCK_ASSETS: Asset[] = [
  {
    id: 'asset-001',
    title: 'Cell Division: Mitosis and Meiosis Explained',
    type: 'Concept Explanation',
    status: 'Approved',
    objectiveCoverage: [
      { objectiveId: 'obj-001', identifier: 'LO-1', status: 'Covered' },
      { objectiveId: 'obj-002', identifier: 'LO-2', status: 'Covered' },
      { objectiveId: 'obj-003', identifier: 'LO-3', status: 'Partial' },
    ],
    lastUpdated: '2026-09-27T14:30:00Z',
    content: `## Cell Division: Mitosis and Meiosis

Cell division is a fundamental biological process that allows organisms to grow, repair damaged tissues, and reproduce. There are two main types of cell division: **mitosis** and **meiosis**.

### Mitosis

Mitosis produces two genetically identical daughter cells and is used for:
- Growth of multicellular organisms
- Repair and replacement of damaged cells
- Asexual reproduction

**Stages of Mitosis:**

1. **Prophase** — Chromosomes condense and become visible. The nuclear envelope breaks down.
2. **Metaphase** — Chromosomes align along the cell's equator (metaphase plate).
3. **Anaphase** — Sister chromatids are pulled to opposite poles of the cell.
4. **Telophase** — Nuclear envelopes reform around each set of chromosomes. The cell divides (cytokinesis).

### Meiosis

Meiosis produces four genetically unique daughter cells with half the chromosome number. It is used exclusively for sexual reproduction.

**Key differences from mitosis:**
- Two rounds of division (Meiosis I and Meiosis II)
- Results in four haploid cells
- Crossing over during Prophase I creates genetic variation`,
    versions: [
      { versionNumber: 2, createdAt: '2026-09-27T14:30:00Z', note: 'Approved after teacher review', status: 'Approved' },
      { versionNumber: 1, createdAt: '2026-09-26T11:00:00Z', note: 'Initial generation', status: 'Needs Revision' },
    ],
    provenance: {
      sourceId: 'src-001',
      sourceName: 'Chapter 4 — Cell Division.pdf',
      sourceVersion: 1,
      generatedAt: '2026-09-26T11:00:00Z',
      modelIdentifier: 'lf-generator-v1',
      generationVersion: '1.0.0',
    },
  },
  {
    id: 'asset-002',
    title: 'Worked Example: Identifying Stages of Mitosis',
    type: 'Worked Example',
    status: 'Approved',
    objectiveCoverage: [
      { objectiveId: 'obj-001', identifier: 'LO-1', status: 'Covered' },
      { objectiveId: 'obj-002', identifier: 'LO-2', status: 'Partial' },
      { objectiveId: 'obj-003', identifier: 'LO-3', status: 'Covered' },
    ],
    lastUpdated: '2026-09-27T15:00:00Z',
    content: `## Worked Example: Identifying Stages of Mitosis

**Question:** A student observes a cell under a microscope and sees that the chromosomes are lined up along the middle of the cell. What stage of mitosis is this, and what happens next?

**Step 1: Identify the observation**
The chromosomes are aligned along the middle (equator) of the cell. This arrangement is the key defining feature of one specific stage.

**Step 2: Name the stage**
This is **Metaphase**. During metaphase, chromosomes are attached to spindle fibres at their centromeres and are pulled into alignment at the cell's equatorial plate.

**Step 3: What happens next?**
Following metaphase, the cell enters **Anaphase**. During anaphase:
- The spindle fibres contract and shorten
- The sister chromatids are pulled apart
- One chromatid from each chromosome moves to each pole of the cell

**Step 4: Why is this important?**
This separation ensures that each daughter cell receives exactly one copy of each chromosome, maintaining the correct chromosome number (46 in humans).

**Mark scheme note:** Award 1 mark for correctly naming Metaphase, 2 marks for a clear description of Anaphase including chromatid separation.`,
    versions: [
      { versionNumber: 1, createdAt: '2026-09-27T15:00:00Z', note: 'Initial generation — approved', status: 'Approved' },
    ],
    provenance: {
      sourceId: 'src-001',
      sourceName: 'Chapter 4 — Cell Division.pdf',
      sourceVersion: 1,
      generatedAt: '2026-09-27T15:00:00Z',
      modelIdentifier: 'lf-generator-v1',
      generationVersion: '1.0.0',
    },
  },
  {
    id: 'asset-003',
    title: 'Formative Quiz: Cell Division',
    type: 'Formative Quiz',
    status: 'Needs Revision',
    objectiveCoverage: [
      { objectiveId: 'obj-001', identifier: 'LO-1', status: 'Covered' },
      { objectiveId: 'obj-002', identifier: 'LO-2', status: 'Partial' },
      { objectiveId: 'obj-003', identifier: 'LO-3', status: 'Partial' },
    ],
    lastUpdated: '2026-09-27T11:00:00Z',
    content: `## Formative Quiz: Cell Division

**Instructions:** Answer all questions. Show your working where applicable.

---

**Q1.** Name the four stages of mitosis in the correct order. (2 marks)

> **Answer Key:** Prophase → Metaphase → Anaphase → Telophase. Award 1 mark for any two correct stages in order; 2 marks for all four correct stages in order.

---

**Q2.** Which of the following is NOT a function of mitosis?

A) Growth of an organism
B) Repair of damaged tissue
C) Production of gametes
D) Replacement of dead cells

> **Answer Key:** C — Production of gametes. Gametes are produced by meiosis, not mitosis.

---

**Q3.** A body cell of a particular organism has 16 chromosomes. How many chromosomes would be present in each daughter cell after mitosis? (1 mark)

> **Answer Key:** 16 chromosomes. Mitosis produces daughter cells with the same chromosome number as the parent cell.

---

**Q4.** Explain why it is important that mitosis produces genetically identical cells. (3 marks)

> **Answer Key:** Award up to 3 marks for: identical genetic information ensures correct protein synthesis (1); damaged cells are replaced with cells that function identically (1); consistency of cell function throughout the organism (1).`,
    versions: [
      { versionNumber: 1, createdAt: '2026-09-27T11:00:00Z', note: 'Awaiting teacher revision', status: 'Needs Revision' },
    ],
    provenance: {
      sourceId: 'src-001',
      sourceName: 'Chapter 4 — Cell Division.pdf',
      sourceVersion: 1,
      generatedAt: '2026-09-27T11:00:00Z',
      modelIdentifier: 'lf-generator-v1',
      generationVersion: '1.0.0',
    },
  },
  {
    id: 'asset-004',
    title: 'Differentiated Practice — Foundation',
    type: 'Differentiated Practice — Foundation',
    status: 'Draft',
    objectiveCoverage: [
      { objectiveId: 'obj-001', identifier: 'LO-1', status: 'Covered' },
      { objectiveId: 'obj-002', identifier: 'LO-2', status: 'Covered' },
      { objectiveId: 'obj-003', identifier: 'LO-3', status: 'Partial' },
    ],
    lastUpdated: '2026-09-27T16:00:00Z',
    content: `## Foundation Practice: Cell Division

**Instructions:** Use the word bank below to help you answer the questions.

**Word Bank:** mitosis, meiosis, identical, different, two, four, growth, gametes

---

**Q1.** Complete the sentences:

a) __________ produces two daughter cells that are genetically __________.

b) __________ produces __________ daughter cells that are genetically __________.

---

**Q2.** Draw a line to match each stage of mitosis to what happens:

| Stage | What happens |
|-------|-------------|
| Prophase | Chromosomes line up in the middle |
| Metaphase | Nuclear envelope breaks down |
| Anaphase | New nuclear envelopes form |
| Telophase | Sister chromatids are pulled apart |

---

**Q3.** Give TWO reasons why organisms need mitosis.

1. _______________
2. _______________`,
    versions: [
      { versionNumber: 1, createdAt: '2026-09-27T16:00:00Z', status: 'Draft' },
    ],
    provenance: {
      sourceId: 'src-001',
      sourceName: 'Chapter 4 — Cell Division.pdf',
      sourceVersion: 1,
      generatedAt: '2026-09-27T16:00:00Z',
      modelIdentifier: 'lf-generator-v1',
      generationVersion: '1.0.0',
    },
  },
  {
    id: 'asset-005',
    title: 'Differentiated Practice — Extension',
    type: 'Differentiated Practice — Extension',
    status: 'Draft',
    objectiveCoverage: [
      { objectiveId: 'obj-001', identifier: 'LO-1', status: 'Covered' },
      { objectiveId: 'obj-002', identifier: 'LO-2', status: 'Covered' },
      { objectiveId: 'obj-003', identifier: 'LO-3', status: 'Covered' },
    ],
    lastUpdated: '2026-09-27T16:15:00Z',
    content: `## Extension Practice: Cell Division

**Instructions:** These questions require extended answers and application of knowledge.

---

**Q1.** A scientist treats dividing cells with a chemical that prevents spindle fibres from forming. Predict and explain the effect this would have on the cell cycle. (4 marks)

---

**Q2.** Cancer cells divide uncontrollably. Using your knowledge of the cell cycle and mitosis, explain:

a) Why uncontrolled mitosis leads to tumour formation (2 marks)
b) How cancer treatments such as radiotherapy might work at the cellular level (3 marks)

---

**Q3.** Compare the roles of mitosis and meiosis in the human body. Your answer should refer to: the type of cells produced, chromosome number, and genetic variation. (6 marks)`,
    versions: [
      { versionNumber: 1, createdAt: '2026-09-27T16:15:00Z', status: 'Draft' },
    ],
    provenance: {
      sourceId: 'src-001',
      sourceName: 'Chapter 4 — Cell Division.pdf',
      sourceVersion: 1,
      generatedAt: '2026-09-27T16:15:00Z',
      modelIdentifier: 'lf-generator-v1',
      generationVersion: '1.0.0',
    },
  },
  {
    id: 'asset-006',
    title: 'Revision Sheet: Cell Division Key Points',
    type: 'Revision Sheet',
    status: 'Approved',
    objectiveCoverage: [
      { objectiveId: 'obj-001', identifier: 'LO-1', status: 'Covered' },
      { objectiveId: 'obj-002', identifier: 'LO-2', status: 'Covered' },
      { objectiveId: 'obj-003', identifier: 'LO-3', status: 'Partial' },
    ],
    lastUpdated: '2026-09-28T09:00:00Z',
    content: `## Revision Sheet: Cell Division

### Key Vocabulary

| Term | Definition |
|------|------------|
| Mitosis | Cell division producing 2 genetically identical daughter cells |
| Meiosis | Cell division producing 4 genetically unique haploid cells |
| Chromosome | A structure of DNA and proteins carrying genetic information |
| Chromatid | One of two identical halves of a replicated chromosome |
| Haploid | A cell containing half the normal number of chromosomes |
| Diploid | A cell containing the full chromosome number |

### Stages of Mitosis (PMAT)

**P**rophase → **M**etaphase → **A**naphase → **T**elophase

### Key Comparisons

|  | Mitosis | Meiosis |
|--|---------|---------|
| Number of divisions | 1 | 2 |
| Daughter cells | 2 | 4 |
| Chromosome number | Same (diploid) | Halved (haploid) |
| Genetic variation | None | Yes (crossing over) |
| Purpose | Growth, repair | Gamete production |

### Common Exam Points

- Mitosis produces genetically **identical** cells
- Meiosis produces genetically **unique** cells due to **crossing over**
- Human body cells have **46 chromosomes**; gametes have **23**`,
    versions: [
      { versionNumber: 2, createdAt: '2026-09-28T09:00:00Z', note: 'Approved after teacher review', status: 'Approved' },
      { versionNumber: 1, createdAt: '2026-09-27T17:00:00Z', status: 'Draft' },
    ],
    provenance: {
      sourceId: 'src-001',
      sourceName: 'Chapter 4 — Cell Division.pdf',
      sourceVersion: 1,
      generatedAt: '2026-09-27T17:00:00Z',
      modelIdentifier: 'lf-generator-v1',
      generationVersion: '1.0.0',
    },
  },
];

// ── Quality Warnings ──────────────────────────────────────────
export const MOCK_QUALITY_WARNINGS: QualityWarning[] = [
  {
    id: 'qw-001',
    severity: 'Warning',
    type: 'Partial Objective Coverage',
    affectedAssetId: 'asset-003',
    affectedAssetTitle: 'Formative Quiz: Cell Division',
    problem: 'LO-3 is only partially covered in the quiz.',
    explanation: 'Learning Objective 3 (application of cell division knowledge) is partially addressed in Q4 but no question directly asks students to apply this to growth, repair, or reproduction scenarios.',
    suggestedAction: 'Consider adding a question that asks students to apply their knowledge of mitosis to a real-world scenario such as wound healing or growth.',
  },
  {
    id: 'qw-002',
    severity: 'Error',
    type: 'Answer Leakage Risk',
    affectedAssetId: 'asset-003',
    affectedAssetTitle: 'Formative Quiz: Cell Division',
    problem: 'Q1 answer may be visible before student submission depending on reveal policy.',
    explanation: 'The answer key for Q1 appears immediately below the question in the current layout. With the current "After Attempt" reveal policy, ensure the answer section is properly gated.',
    suggestedAction: 'Review the answer reveal mechanism. The answer key sections should not be visible until the student has submitted their response.',
  },
  {
    id: 'qw-003',
    severity: 'Info',
    type: 'Difficulty Balance',
    affectedAssetId: 'asset-004',
    affectedAssetTitle: 'Differentiated Practice — Foundation',
    problem: 'Foundation practice may be slightly below target difficulty.',
    explanation: 'The Foundation worksheet uses fill-in-the-blank and matching activities only. GCSE Foundation typically requires some short-answer questions to build examination technique.',
    suggestedAction: 'Consider adding one or two short-answer questions to the Foundation worksheet to better prepare students for examination conditions.',
  },
];

// ── Learning Units ────────────────────────────────────────────
export const MOCK_UNITS: LearningUnit[] = [
  {
    id: 'unit-001',
    title: 'Cell Division: Mitosis and Meiosis',
    subject: 'Biology',
    targetLevel: 'GCSE Year 10',
    status: 'Needs Review',
    createdAt: '2026-09-25T10:00:00Z',
    updatedAt: '2026-09-28T09:00:00Z',
    sources: MOCK_SOURCES,
    objectives: MOCK_OBJECTIVES,
    constraints: MOCK_CONSTRAINTS,
    assets: MOCK_ASSETS,
    qualityWarnings: MOCK_QUALITY_WARNINGS,
  },
  {
    id: 'unit-002',
    title: 'Forces and Newton\'s Laws of Motion',
    subject: 'Physics',
    targetLevel: 'GCSE Year 11',
    status: 'Approved',
    createdAt: '2026-09-20T08:00:00Z',
    updatedAt: '2026-09-22T16:30:00Z',
    sources: [],
    objectives: [],
    constraints: MOCK_CONSTRAINTS,
    assets: [],
    qualityWarnings: [],
  },
  {
    id: 'unit-003',
    title: 'Chemical Bonding and Molecular Structure',
    subject: 'Chemistry',
    targetLevel: 'A-Level Year 12',
    status: 'Draft',
    createdAt: '2026-09-28T11:00:00Z',
    updatedAt: '2026-09-28T11:00:00Z',
    sources: [],
    objectives: [],
    constraints: MOCK_CONSTRAINTS,
    assets: [],
    qualityWarnings: [],
  },
  {
    id: 'unit-004',
    title: 'The Water Cycle and Climate Systems',
    subject: 'Geography',
    targetLevel: 'KS3 Year 8',
    status: 'Generating',
    createdAt: '2026-09-29T08:00:00Z',
    updatedAt: '2026-09-29T08:00:00Z',
    sources: [],
    objectives: [],
    constraints: MOCK_CONSTRAINTS,
    assets: [],
    qualityWarnings: [],
  },
  {
    id: 'unit-005',
    title: 'Shakespeare\'s Macbeth: Power and Ambition',
    subject: 'English Literature',
    targetLevel: 'GCSE Year 10',
    status: 'Draft',
    createdAt: '2026-09-18T09:30:00Z',
    updatedAt: '2026-09-18T09:30:00Z',
    sources: [],
    objectives: [],
    constraints: MOCK_CONSTRAINTS,
    assets: [],
    qualityWarnings: [],
  },
];

// ── Version History ───────────────────────────────────────────
export const MOCK_VERSION_HISTORY: VersionHistoryEntry[] = [
  {
    id: 'ver-003',
    versionNumber: 3,
    timestamp: '2026-09-28T09:00:00Z',
    sourceVersion: 1,
    assetVersion: 6,
    status: 'Needs Review',
    modelIdentifier: 'lf-generator-v1',
    generationVersion: '1.0.0',
    teacherAction: 'Requested revision on quiz',
    note: 'Revision Sheet approved; Quiz flagged for revision',
  },
  {
    id: 'ver-002',
    versionNumber: 2,
    timestamp: '2026-09-27T14:00:00Z',
    sourceVersion: 1,
    assetVersion: 4,
    status: 'Needs Review',
    modelIdentifier: 'lf-generator-v1',
    generationVersion: '1.0.0',
    teacherAction: 'Approved Concept Explanation and Worked Example',
    note: 'First teacher review session complete',
  },
  {
    id: 'ver-001',
    versionNumber: 1,
    timestamp: '2026-09-26T11:00:00Z',
    sourceVersion: 1,
    assetVersion: 1,
    status: 'Generating',
    modelIdentifier: 'lf-generator-v1',
    generationVersion: '1.0.0',
    note: 'Initial generation from uploaded sources',
  },
];

// ── Subjects (for form selects) ───────────────────────────────
export const SUBJECTS = [
  'Biology', 'Chemistry', 'Physics', 'Mathematics',
  'English Language', 'English Literature', 'History',
  'Geography', 'Religious Studies', 'Computer Science',
  'French', 'Spanish', 'German', 'Art & Design',
  'Music', 'Physical Education', 'Design & Technology',
  'Economics', 'Psychology', 'Sociology',
];

// ── Target Levels ─────────────────────────────────────────────
export const TARGET_LEVELS = [
  'KS3 Year 7', 'KS3 Year 8', 'KS3 Year 9',
  'GCSE Year 10', 'GCSE Year 11',
  'A-Level Year 12', 'A-Level Year 13',
  'Primary — KS1', 'Primary — KS2',
  'BTEC Level 2', 'BTEC Level 3',
  'International Baccalaureate',
  'University Foundation', 'Other',
];
