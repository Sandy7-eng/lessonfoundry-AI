import { PrismaClient } from '@prisma/client';

// Declare global prisma instance for Next.js HMR development preservation
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Graceful Prisma Client instantiation that safely handles missing/unreachable database during dev
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper to check if a database connection URL is configured
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim().length > 0 && !url.includes('placeholder'));
}

export default prisma;
