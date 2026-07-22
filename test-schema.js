const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://4a5407255fd47d32e2799e0941ed5ddaba5fc2b746a1d5a75ef9ba108ce2acbf:sk_Li-_G4CPQ2h43IkLaFeH7@db.prisma.io:5432/postgres?sslmode=require'
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, title, "schemaJson" FROM "Page" WHERE "schemaJson" IS NOT NULL AND "schemaJson" != \'[]\' LIMIT 1');
  await client.end();
  
  if (res.rows.length === 0) {
    console.log("No pages with schema found.");
    return;
  }
  
  const page = res.rows[0];
  console.log(`Found page id=${page.id} with schema length=${page.schemaJson.length}`);
  
  const postData = page;
  let schemaInput = page.schemaJson;
  let schemas = schemaInput;
  if (typeof schemas === 'string') {
    try {
      schemas = JSON.parse(schemas);
      console.log("Parsed JSON successfully");
    } catch(e) {
      console.log("JSON parse error:", e);
      return;
    }
  }

  const variables = {
    '%seo_title%': postData.seoTitle || postData.title || '',
    '%seo_description%': postData.metaDescription || (postData.contentHtml ? postData.contentHtml.replace(/<[^>]*>?/gm, '').substring(0, 160) : ''),
    '%title%': postData.title || '',
    '%url%': `https://example.com/${postData.slug || ''}`,
    '%keywords%': postData.focusKeyword || '',
    '%date_published%': postData.publishedAt || postData.createdAt || '',
    '%date_modified%': postData.updatedAt || '',
    '%author_name%': postData.author ? `${postData.author.firstName || ''} ${postData.author.lastName || ''}`.trim() : 'Admin',
  };

  const replaceVarsInString = (str) => {
    let result = str;
    for (const [key, value] of Object.entries(variables)) {
      if (result.includes(key)) {
        result = result.replace(new RegExp(key, 'g'), String(value || ''));
      }
    }
    return result;
  };

  const walk = (node) => {
    if (typeof node === 'string') {
      return replaceVarsInString(node);
    }
    if (Array.isArray(node)) {
      return node.map(item => walk(item));
    }
    if (node !== null && typeof node === 'object') {
      const newNode = {};
      for (const [key, value] of Object.entries(node)) {
        newNode[key] = walk(value);
      }
      return newNode;
    }
    return node;
  };

  try {
    const parsedSchemas = walk(schemas);
    const schemasToRender = Array.isArray(parsedSchemas) ? parsedSchemas : [parsedSchemas];
    schemasToRender.forEach((schema, index) => {
      // simulate React rendering
      const rendered = JSON.stringify(schema);
      console.log(`Rendered schema ${index} successfully, length: ${rendered.length}`);
    });
  } catch (e) {
    console.log("Walk or render crashed:", e);
  }
}
main().catch(console.error);
