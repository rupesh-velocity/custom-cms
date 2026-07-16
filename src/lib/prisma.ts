import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prismaClientV3: PrismaClient }

// Ensure `DATABASE_URL` is set (Prisma client reads from env var); provide a safe fallback
const databaseUrl = process.env.DATABASE_URL || 'mysql://dummy:dummy@localhost:3306/dummy'
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = databaseUrl

export const prisma = globalForPrisma.prismaClientV3 || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClientV3 = prisma
