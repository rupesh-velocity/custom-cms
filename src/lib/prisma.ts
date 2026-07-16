import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prismaClientV3: PrismaClient }

export const prisma = globalForPrisma.prismaClientV3 || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://dummy:dummy@localhost:3306/dummy'
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClientV3 = prisma
