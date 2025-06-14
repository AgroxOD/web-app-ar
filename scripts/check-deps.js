import fs from 'node:fs';

if (!fs.existsSync('node_modules')) {
  console.error('Dependencies not installed. Run `pnpm install` first.');
  process.exit(1);
}
