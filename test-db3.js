const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
  const posts = await prisma.post.findMany({
    orderBy: { id: 'desc' },
    take: 5
  });
  console.log("RECENT POSTS:");
  posts.forEach(p => {
    console.log(`ID: ${p.id}, Title: ${p.title}, Schema: ${p.schemaJson ? p.schemaJson.substring(0, 100) : 'NULL'}`);
  });

  const pages = await prisma.page.findMany({
    orderBy: { id: 'desc' },
    take: 5
  });
  console.log("\nRECENT PAGES:");
  pages.forEach(p => {
    console.log(`ID: ${p.id}, Title: ${p.title}, Schema: ${p.schemaJson ? p.schemaJson.substring(0, 100) : 'NULL'}`);
  });
}
checkDB()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });
