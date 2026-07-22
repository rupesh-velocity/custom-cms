const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log("Total users in DB:", userCount);
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true }});
    console.log("Users:", users);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
