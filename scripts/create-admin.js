const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "Admin",
    },
  });
  console.log("Live Admin user created successfully!");
}

main().finally(() => prisma.$disconnect());
