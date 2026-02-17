import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const adapter = new PrismaBetterSqlite3({
  url: import.meta.env.DATABASE_URL || 'file:./dev.db'
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['error', 'warn']
  });

if (import.meta.env.DEV) {
  globalForPrisma.prisma = prisma;
}
