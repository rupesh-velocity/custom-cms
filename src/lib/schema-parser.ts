/**
 * Schema Parser Utility
 * Recursively iterates through a JSON-LD schema object and replaces dynamic variables.
 */

export function processSchemaVariables(schemaInput: any, postData: any): any {
  if (!schemaInput) return schemaInput;

  // If it's a string, try to parse it first
  let schemas = schemaInput;
  if (typeof schemas === 'string') {
    try {
      schemas = JSON.parse(schemas);
    } catch {
      return null;
    }
  }

  // Define our available variables
  const variables = {
    '%seo_title%': postData.seoTitle || postData.title || '',
    '%seo_description%': postData.metaDescription || (postData.contentHtml ? postData.contentHtml.replace(/<[^>]*>?/gm, '').substring(0, 160) : ''),
    '%title%': postData.title || '',
    '%url%': `https://${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'example.com'}/${postData.slug || ''}`,
    '%keywords%': postData.focusKeyword || '',
    '%date_published%': postData.publishedAt || postData.createdAt || '',
    '%date_modified%': postData.updatedAt || '',
    '%author_name%': postData.author ? `${postData.author.firstName || ''} ${postData.author.lastName || ''}`.trim() : 'Admin',
  };

  // Helper to replace variables in a string
  const replaceVarsInString = (str: string) => {
    let result = str;
    for (const [key, value] of Object.entries(variables)) {
      if (result.includes(key)) {
        // Ensure stringification of dates or handle empty values safely
        result = result.replace(new RegExp(key, 'g'), String(value || ''));
      }
    }
    return result;
  };

  // Recursive function to walk the schema object
  const walk = (node: any): any => {
    if (typeof node === 'string') {
      return replaceVarsInString(node);
    }
    
    if (Array.isArray(node)) {
      return node.map(item => walk(item));
    }
    
    if (node !== null && typeof node === 'object') {
      const newNode: any = {};
      for (const [key, value] of Object.entries(node)) {
        newNode[key] = walk(value);
      }
      return newNode;
    }
    
    return node;
  };

  return walk(schemas);
}
