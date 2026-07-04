const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const url = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Generating Tailwind safelist from database content...');
  try {
    const pages = await prisma.page.findMany();
    const posts = await prisma.post.findMany();

    let allHtml = '';
    pages.forEach(p => { allHtml += (p.contentHtml || '') + '\n'; });
    posts.forEach(p => { allHtml += (p.contentHtml || '') + '\n'; });

    const outputPath = path.join(__dirname, '../src/safelist.html');
    fs.writeFileSync(outputPath, allHtml);
    console.log('Successfully generated src/safelist.html');
  } catch (error) {
    console.error('Error generating safelist:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
