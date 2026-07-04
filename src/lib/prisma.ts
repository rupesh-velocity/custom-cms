import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prismaClientV3: PrismaClient }

export const prisma = globalForPrisma.prismaClientV3 || (() => {
  const url = process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
  return new PrismaClient({
    datasourceUrl: url,
  })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClientV3 = prisma
