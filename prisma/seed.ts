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
      email: 'teacher@lessonfoundry.ai',
      name: 'Demo Teacher',
      role: 'TEACHER',
    },
  });
  console.log('✅ Created User:', user.name);

  // 3. Seed 1 Unit
  const unit = await prisma.unit.create({
    data: {
      id: 'unit_newton_01',
      userId: user.id,
      title: 'Newton\'s Laws of Motion',
      subject: 'Physics',
      targetLevel: 'High School',
      status: 'APPROVED',
    },
  });
  console.log('✅ Created Unit:', unit.title);

  // 4. Seed 1 Source
  const source = await prisma.source.create({
    data: {
      id: 'src_physics_ch4',
      unitId: unit.id,
      name: 'Chapter 4 - Forces.pdf',
      type: 'PDF',
      status: 'READY',
      trusted: true,
      sizeBytes: 4250000,
      pageCount: 18,
      preview: 'Newton\'s three laws of motion describe the relationship between a body and the forces acting upon it...',
      version: 1,
    },
  });
  console.log('✅ Created Source:', source.name);

  // 5. Seed Objectives
  const obj1 = await prisma.objective.create({
    data: {
      id: 'obj_101',
      unitId: unit.id,
      identifier: 'LO1',
      text: 'State Newton\'s first law of motion and explain inertia.',
      bloomLevel: 'UNDERSTAND',
      displayOrder: 1,
    },
  });

  const obj2 = await prisma.objective.create({
    data: {
      id: 'obj_102',
      unitId: unit.id,
      identifier: 'LO2',
      text: 'Apply Newton\'s second law (F=ma) to solve problems.',
      bloomLevel: 'APPLY',
      displayOrder: 2,
    },
  });
  console.log('✅ Created 2 Objectives');

  // 6. Seed Constraints
  await prisma.constraint.create({
    data: {
      id: 'cst_newton_01',
      unitId: unit.id,
      difficulty: 'CORE',
      vocabularyConstraints: 'Define key vocabulary: Force, Mass, Acceleration, Inertia.',
      contentLength: 'STANDARD',
      answerRevealPolicy: 'AFTER_ATTEMPT',
      teacherNotes: 'Use real-world examples.',
    },
  });

  // 7. Seed 6 Assets
  const assetTypes = [
    'CONCEPT_EXPLANATION',
    'WORKED_EXAMPLE',
    'FORMATIVE_QUIZ',
    'DIFFERENTIATED_PRACTICE_FOUNDATION',
    'DIFFERENTIATED_PRACTICE_EXTENSION',
    'REVISION_SHEET'
  ] as const;

  for (const type of assetTypes) {
    await prisma.asset.create({
      data: {
        unitId: unit.id,
        type,
        title: `${type.replace(/_/g, ' ')}`,
        content: `Sample content for ${type}...`,
        status: 'APPROVED',
        version: 1,
      },
    });
  }

  console.log('✅ Created 6 Assets');
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
