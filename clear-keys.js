const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.updateMany({
    where: { key: { in: ["stripePublicKey", "stripeSecretKey"] } },
    data: { value: "" },
  });
  console.log("Cleared!");
}
main().finally(() => prisma.$disconnect());
