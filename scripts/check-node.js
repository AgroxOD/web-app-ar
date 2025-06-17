// Скрипт завершает процесс, если версия Node.js несовместима
import fs from 'node:fs';
const major = parseInt(process.version.slice(1).split('.')[0], 10);

if (major !== 20) {
  const nvmrc = fs.existsSync('.nvmrc')
    ? fs.readFileSync('.nvmrc', 'utf8').trim()
    : '20';
  console.error(
    `Unsupported Node.js ${process.version}.\nUse Node.js 20 LTS.\n` +
      `Run \`nvm use ${nvmrc}\` to switch.`,
  );
  process.exit(1);
}
