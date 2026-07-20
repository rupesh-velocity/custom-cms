const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const page = await prisma.page.findFirst({ orderBy: { id: 'desc' } }); 
  console.log('SCHEMA IS:', page.schemaJson); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
