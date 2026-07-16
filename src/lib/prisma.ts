import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prismaClientV3: PrismaClient }

// Recursive proxy that intercepts all property access and function calls, returning a rejected promise.
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

export const prisma = globalForPrisma.prismaClientV3 || (
  process.env.DATABASE_URL ? new PrismaClient() : mockPrisma
);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClientV3 = prisma
