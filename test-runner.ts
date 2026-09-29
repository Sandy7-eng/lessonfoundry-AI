import prisma from './src/lib/db/prisma';

async function test() {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'teacher@lessonfoundry.ai', name: 'Demo Teacher', role: 'TEACHER' }
      });
    }
    console.log('User found/created:', user.id);

    const unit = await prisma.unit.create({
      data: {
        userId: user.id,
        title: 'Test Unit',
        subject: 'Geography',
        targetLevel: 'GCSE Year 10',
        status: 'GENERATING',
        constraints: {
          create: {
            difficulty: 'Core' as any,
            vocabularyConstraints: 'None',
            answerRevealPolicy: 'After Attempt' as any
          }
        },
        sources: {
          create: [{
            name: 'test.pdf',
            type: 'TEXT',
            preview: 'test',
            trusted: true,
            status: 'READY'
          }]
        },
        objectives: {
          create: [{
            identifier: 'LO-1',
            text: 'Test objective',
            displayOrder: 0
          }]
        }
      }
    });
    console.log('Unit created successfully:', unit.id);
  } catch (e: any) {
    console.error('Prisma Error:', e.message || e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
