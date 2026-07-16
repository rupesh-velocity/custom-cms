const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  console.log('Generating Tailwind safelist from database content...');
  try {
    const url = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!url) {
      console.log('No database URL found, using fallback safelist...');
      fs.writeFileSync(path.join(__dirname, '../src/safelist.html'), '<!-- Empty safelist fallback -->');
      return;
    }
    
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    const posts = await prisma.post.findMany({ select: { contentHtml: true } });
    const pages = await prisma.page.findMany({ select: { contentHtml: true } });
    const courses = await prisma.course.findMany({ select: { contentHtml: true } });
    
    let combinedHtml = '';
    for (const post of posts) if (post.contentHtml) combinedHtml += post.contentHtml + '\n';
    for (const page of pages) if (page.contentHtml) combinedHtml += page.contentHtml + '\n';
    for (const course of courses) if (course.contentHtml) combinedHtml += course.contentHtml + '\n';
    
    const outputPath = path.join(__dirname, '../src/safelist.html');
    fs.writeFileSync(outputPath, combinedHtml || '<!-- Empty safelist fallback -->');
    
    console.log(`Successfully generated src/safelist.html with ${combinedHtml.length} bytes of content`);
    
    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error('Error generating safelist:', error);
    fs.writeFileSync(path.join(__dirname, '../src/safelist.html'), '<!-- Empty safelist fallback -->');
  }
}

main();
