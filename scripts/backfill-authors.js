const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (user) {
    const pages = await prisma.page.updateMany({ where: { authorId: null }, data: { authorId: user.id } });
    const posts = await prisma.post.updateMany({ where: { authorId: null }, data: { authorId: user.id } });
    console.log(`Updated ${pages.count} pages and ${posts.count} posts to authorId ${user.id}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
