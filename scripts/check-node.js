import fs from 'node:fs';
const major = parseInt(process.version.slice(1).split('.')[0], 10);

if (major >= 22) {
  const nvmrc = fs.existsSync('.nvmrc')
    ? fs.readFileSync('.nvmrc', 'utf8').trim()
    : '20';
  console.error(
    `Detected Node.js ${process.version}. Node.js 22+ is not supported.\n` +
      `Run \`nvm use ${nvmrc}\` to switch to a compatible version.`,
  );
  process.exit(1);
}

if (major < 18 || major > 21) {
  console.error(
    `Unsupported Node.js version ${process.version}.\nPlease use Node.js 18–21.`,
  );
  process.exit(1);
}
