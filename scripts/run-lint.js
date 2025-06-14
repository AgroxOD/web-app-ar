import { spawn } from 'node:child_process';
import fs from 'node:fs';

const useLog = !!process.env.CI;
const eslintArgs = ['exec', 'eslint', '.', ...process.argv.slice(2)];
const child = spawn('pnpm', eslintArgs, {
  stdio: useLog ? ['inherit', 'pipe', 'pipe'] : 'inherit',
  shell: true,
});

if (useLog) {
  const log = fs.createWriteStream('lint.log', { flags: 'w' });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  child.on('close', (code) => {
    log.end(() => process.exit(code));
  });
} else {
  child.on('close', (code) => process.exit(code));
}
