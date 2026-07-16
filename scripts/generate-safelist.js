const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Generating Tailwind safelist from database content...');
  try {
    const outputPath = path.join(__dirname, '../src/safelist.html');
    fs.writeFileSync(outputPath, '<!-- Empty safelist fallback -->');
    console.log('Successfully generated src/safelist.html (fallback)');
  } catch (error) {
    console.error('Error generating safelist:', error);
  }
}

main();
