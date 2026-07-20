const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.page.findFirst({ orderBy: { id: 'desc' } });
  if (!page) {
    console.log("No page found!");
    return;
  }
  
  const testSchema = JSON.stringify([{
    "@context": "https://schema.org",
    "@graph": [{ "@type": "FAQPage", "name": "Test" }]
  }]);

  console.log("Updating page ID:", page.id);
  
  const updated = await prisma.page.update({
    where: { id: page.id },
    data: { schemaJson: testSchema }
  });
  
  console.log("Updated schemaJson in DB:", updated.schemaJson);
}

main().catch(console.error).finally(() => prisma.$disconnect());
