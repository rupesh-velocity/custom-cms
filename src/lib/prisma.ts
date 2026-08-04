// Types are imported using import type to completely remove them from runtime execution
import type { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prismaClientV3: PrismaClient }

// Recursive mock proxy for build phase
const mockPrisma = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    const mockFunc = () => {};
    return new Proxy(mockFunc, {
      get(t, p) {
        if (p === 'then') return undefined;
        return new Proxy(mockFunc, {
          apply() { return Promise.resolve([]); }
        });
      },
      apply() {
        return Promise.resolve([]);
      }
    });
  }
}) as PrismaClient;

let prismaInstance: PrismaClient | undefined = globalForPrisma.prismaClientV3;

// Lazy initialize Prisma to avoid module-level initialization errors in Turbopack
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (prop === 'then') return undefined;

    if (!prismaInstance) {
      const url = process.env.NEON_DATABASE_URL || process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
      
      // Check for build phase using explicit flag
      if (process.env.npm_lifecycle_event === 'build' || process.env.IS_NEXT_BUILD === 'true' || !url) {
        return Reflect.get(mockPrisma, prop);
      }
      
      // Inline requires to prevent top-level execution during Next.js module tracing
      const { PrismaClient } = require('@prisma/client');
      const { PrismaPg } = require('@prisma/adapter-pg');
      const { Pool } = require('pg');

      const pool = new Pool({ connectionString: url });
      const adapter = new PrismaPg(pool);
      
      prismaInstance = new PrismaClient({ adapter });
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prismaClientV3 = prismaInstance as PrismaClient;
      }
    }

    return Reflect.get(prismaInstance!, prop);
  }
});
