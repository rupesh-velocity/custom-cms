import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

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
          apply() { return Promise.reject(new Error("Prisma skipped during build")); }
        });
      },
      apply() {
        return Promise.reject(new Error("Prisma skipped during build"));
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
      const url = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
      
      // If DATABASE_URL is missing, we are likely in a build phase where it is omitted.
      if (!url) {
        return Reflect.get(mockPrisma, prop);
      }
      
      const pool = new Pool({ connectionString: url });
      const adapter = new PrismaPg(pool);
      
      prismaInstance = new PrismaClient({ adapter });
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prismaClientV3 = prismaInstance;
      }
    }

    return Reflect.get(prismaInstance, prop);
  }
});
