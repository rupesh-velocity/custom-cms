import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prismaClientV3: PrismaClient }

export const prisma = globalForPrisma.prismaClientV3 || (() => {
  const url = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const pool = new Pool({
    connectionString: url,
    max: 1, // Crucial for Vercel Serverless to prevent pool exhaustion
    connectionTimeoutMillis: 5000,
  })
  pool.on('error', (err) => console.error('Unexpected pg pool error', err))
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClientV3 = prisma
