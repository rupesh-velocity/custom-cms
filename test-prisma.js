const { PrismaClient } = require('@prisma/client');
try {
  process.env.DATABASE_URL = 'postgres://test:test@test:5432/test';
  const prisma = new PrismaClient();
  console.log('Success without datasources/adapter');
} catch (e) {
  console.log('Failed:', e.message);
}
