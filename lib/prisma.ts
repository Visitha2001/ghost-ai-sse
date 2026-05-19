import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || '';

const prismaClientSingleton = () => {
  if (connectionString.startsWith('prisma+postgres://') || connectionString.startsWith('prisma://')) {
    return new PrismaClient({
      accelerateUrl: connectionString,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  const { Pool } = pg;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
