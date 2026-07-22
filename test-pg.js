const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://4a5407255fd47d32e2799e0941ed5ddaba5fc2b746a1d5a75ef9ba108ce2acbf:sk_Li-_G4CPQ2h43IkLaFeH7@db.prisma.io:5432/postgres?sslmode=require'
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, title, "updatedAt" FROM "Page" WHERE id = 10');
  console.log("PAGE 10:", res.rows);
  
  const pages = await client.query('SELECT id, title, "updatedAt", "schemaJson" FROM "Page" ORDER BY "updatedAt" DESC LIMIT 3');
  console.log("RECENTLY UPDATED PAGES:", pages.rows);
  
  await client.end();
}
main().catch(console.error);
