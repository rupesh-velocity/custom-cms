const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/components/SeoAnalyzer.tsx');
let content = fs.readFileSync(file, 'utf8');

const interfaceTarget = `  redirectType?: string;
  setRedirectType?: (type: string) => void;`;
const interfaceReplacement = `  redirectType?: string;
  setRedirectType?: (type: string) => void;
  customFieldsText?: string;`;

content = content.replace(interfaceTarget, interfaceReplacement);

const destructureTarget = `  featuredImage = null
}: SeoAnalyzerProps) {`;
const destructureReplacement = `  featuredImage = null,
  customFieldsText = ''
}: SeoAnalyzerProps) {`;
content = content.replace(destructureTarget, destructureReplacement);

const safeContentTarget = `  const safeDesc = metaDescription.toLowerCase();
  const safeContent = content.toLowerCase();
  const safeSlug = slug.toLowerCase();`;

const safeContentReplacement = `  const safeDesc = metaDescription.toLowerCase();
  const fullContent = customFieldsText ? content + ' ' + customFieldsText : content;
  const safeContent = fullContent.toLowerCase();
  const safeSlug = slug.toLowerCase();`;

content = content.replace(safeContentTarget, safeContentReplacement);

const plainTextTarget = `const plainTextContent = content.replace(/<[^>]*>?/gm, '').toLowerCase();`;
const plainTextReplacement = `const plainTextContent = fullContent.replace(/<[^>]*>?/gm, '').toLowerCase();`;
content = content.replace(plainTextTarget, plainTextReplacement);

const headingsTarget = `const headings: string[] = content.match(/<h[2-6][^>]*>([\\s\\S]*?)<\\/h[2-6]>/ig) || [];`;
const headingsReplacement = `const headings: string[] = fullContent.match(/<h[2-6][^>]*>([\\s\\S]*?)<\\/h[2-6]>/ig) || [];`;
content = content.replace(headingsTarget, headingsReplacement);

const hrefTarget = `const hrefMatches: string[] = content.match(/href="([^"]+)"/ig) || [];`;
const hrefReplacement = `const hrefMatches: string[] = fullContent.match(/href="([^"]+)"/ig) || [];`;
content = content.replace(hrefTarget, hrefReplacement);

fs.writeFileSync(file, content);
console.log('SeoAnalyzer props updated');
