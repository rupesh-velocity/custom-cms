require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

process.env.DATABASE_URL =
  process.env.MYSQL_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.DB_URL;
const prisma = new PrismaClient({});

async function main() {
  const hashedPassword = await bcrypt.hash("admin@123", 10);

  const user = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: hashedPassword,
      role: "Administrator",
    },
    create: {
      username: "admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "Administrator",
    },
  });

  console.log("Admin user ready! You can now log in with admin / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
