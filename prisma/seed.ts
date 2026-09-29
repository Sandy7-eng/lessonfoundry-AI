import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing seed data if present
  await prisma.provenance.deleteMany();
  await prisma.assetVersion.deleteMany();
  await prisma.unitVersion.deleteMany();
  await prisma.qualityIssue.deleteMany();
  await prisma.review.deleteMany();
  await prisma.objectiveAlignment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.constraint.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.source.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed 1 User
  const user = await prisma.user.create({
    data: {
      id: 'usr_teacher_1',
      email: 'sarah.jenkins@oakridge.edu',
      name: 'Sarah Jenkins',
      role: 'TEACHER',
    },
  });
  console.log('✅ Created User:', user.name);

  // 3. Seed 1 Unit
  const unit = await prisma.unit.create({
    data: {
      id: 'unit_photosynthesis_01',
      userId: user.id,
      title: 'Photosynthesis & Cellular Respiration',
      subject: 'Biology',
      targetLevel: 'Year 9 Standard',
      status: 'NEEDS_REVIEW',
    },
  });
  console.log('✅ Created Unit:', unit.title);

  // 4. Seed 1 Source
  const source = await prisma.source.create({
    data: {
      id: 'src_bio_ch4',
      unitId: unit.id,
      name: 'Chapter 4 - Energetics of Life.pdf',
      type: 'PDF',
      status: 'READY',
      trusted: true,
      sizeBytes: 4250000,
      pageCount: 18,
      preview:
        'Photosynthesis converts light energy into chemical energy stored in glucose molecules. Chloroplasts contain chlorophyll pigments...',
      version: 1,
    },
  });
  console.log('✅ Created Source:', source.name);

  // 5. Seed 2 Objectives
  const obj1 = await prisma.objective.create({
    data: {
      id: 'obj_101',
      unitId: unit.id,
      identifier: 'LO1',
      text: 'Explain the word and chemical equations for photosynthesis and identify the role of chlorophyll.',
      bloomLevel: 'UNDERSTAND',
      displayOrder: 1,
    },
  });

  const obj2 = await prisma.objective.create({
    data: {
      id: 'obj_102',
      unitId: unit.id,
      identifier: 'LO2',
      text: 'Compare and contrast light-dependent reactions with light-independent (Calvin cycle) reactions.',
      bloomLevel: 'ANALYSE',
      displayOrder: 2,
    },
  });
  console.log('✅ Created 2 Objectives:', obj1.identifier, obj2.identifier);

  // 6. Seed Constraints
  await prisma.constraint.create({
    data: {
      id: 'cst_photo_01',
      unitId: unit.id,
      difficulty: 'CORE',
      vocabularyConstraints:
        'Define key vocabulary: ATP, NADPH, Chloroplast, Stroma, Thylakoid, Rubisco.',
      contentLength: 'STANDARD',
      answerRevealPolicy: 'AFTER_ATTEMPT',
      teacherNotes: 'Focus on clear visual analogies for energy carrier molecules (ATP/ADP).',
    },
  });
  console.log('✅ Created Constraints for unit');

  // 7. Seed Sample Assets & Questions
  const conceptAsset = await prisma.asset.create({
    data: {
      id: 'ast_concept_01',
      unitId: unit.id,
      type: 'CONCEPT_EXPLANATION',
      title: 'Concept Guide: The Dual Stages of Photosynthesis',
      content: `Photosynthesis takes place in two distinct stages inside the chloroplast:

1. **Light-Dependent Reactions**: Occur in the thylakoid membranes. Solar energy splits water molecules ($2H_2O \\rightarrow O_2 + 4H^+ + 4e^-$), producing ATP and NADPH while releasing oxygen gas as a byproduct.
2. **Light-Independent Reactions (Calvin Cycle)**: Occur in the stroma. Chemical energy from ATP and NADPH drives the fixation of carbon dioxide ($CO_2$) into high-energy G3P molecules, ultimately forming glucose ($C_6H_{12}O_6$).`,
      status: 'APPROVED',
      version: 1,
    },
  });

  const quizAsset = await prisma.asset.create({
    data: {
      id: 'ast_quiz_01',
      unitId: unit.id,
      type: 'FORMATIVE_QUIZ',
      title: 'Formative Quiz: Photosynthesis Foundations',
      content: 'A 3-question formative assessment targeting light reactions and chemical inputs.',
      status: 'NEEDS_REVISION',
      version: 1,
    },
  });

  await prisma.question.create({
    data: {
      id: 'q_001',
      assetId: quizAsset.id,
      content: 'Where do the light-dependent reactions of photosynthesis take place?',
      answer: 'In the thylakoid membranes of the chloroplast.',
      difficulty: 'FOUNDATION',
      displayOrder: 1,
    },
  });

  const question2 = await prisma.question.create({
    data: {
      id: 'q_002',
      assetId: quizAsset.id,
      content: 'Describe the main function of ATP and NADPH generated during the light reactions.',
      answer:
        'They act as energy carriers that transport chemical energy and high-energy electrons to the stroma to power carbon fixation in the Calvin cycle.',
      difficulty: 'CORE',
      displayOrder: 2,
    },
  });
  console.log('✅ Created Sample Assets & Questions');

  // 8. Seed Objective Alignment
  await prisma.objectiveAlignment.create({
    data: {
      id: 'align_001',
      objectiveId: obj1.id,
      assetId: conceptAsset.id,
      status: 'COVERED',
    },
  });

  await prisma.objectiveAlignment.create({
    data: {
      id: 'align_002',
      objectiveId: obj2.id,
      questionId: question2.id,
      status: 'PARTIAL',
    },
  });
  console.log('✅ Created Objective Alignments');

  // 9. Seed Review
  const review = await prisma.review.create({
    data: {
      id: 'rev_001',
      assetId: quizAsset.id,
      userId: user.id,
      status: 'NEEDS_REVISION',
      comment:
        'Question 2 requires clearer rubric descriptors for partial credit. Please expand answer key with key terminology markers.',
    },
  });
  console.log('✅ Created Asset Review:', review.status);

  // 10. Seed Quality Issue
  const qualityIssue = await prisma.qualityIssue.create({
    data: {
      id: 'qi_001',
      unitId: unit.id,
      assetId: quizAsset.id,
      type: 'DEPTH_OF_KNOWLEDGE',
      severity: 'WARNING',
      description: 'Insufficient higher-order thinking questions targeting Calvin cycle regulation.',
      explanation:
        'Quiz contains mostly recall and basic application questions. Consider adding an evaluation level scenario.',
      suggestedAction:
        'Add 1 extension question asking students to predict outcome if stroma pH changes.',
      status: 'OPEN',
    },
  });
  console.log('✅ Created Quality Issue:', qualityIssue.type);

  // 11. Seed Unit Version, Asset Version & Provenance
  await prisma.unitVersion.create({
    data: {
      id: 'uv_001',
      unitId: unit.id,
      versionNumber: 1,
      status: 'NEEDS_REVIEW',
      assetVersionCount: 2,
      sourceVersion: 1,
      modelIdentifier: 'gemini-1.5-pro',
      generationVersion: 'v2.4.0',
      teacherAction: 'INITIAL_GENERATE',
      note: 'Initial generation from Chapter 4 source PDF.',
    },
  });

  await prisma.assetVersion.create({
    data: {
      id: 'av_001',
      assetId: quizAsset.id,
      versionNumber: 1,
      status: 'DRAFT',
      note: 'Initial quiz generation',
      contentSnapshot: quizAsset.content,
    },
  });

  await prisma.provenance.create({
    data: {
      id: 'prov_001',
      assetId: conceptAsset.id,
      sourceId: source.id,
      modelIdentifier: 'gemini-1.5-pro',
      generationVersion: 'v2.4.0',
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        targetTaxonomy: 'BLOOMS',
      },
    },
  });
  console.log('✅ Created Unit Version, Asset Version, and Provenance records');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
