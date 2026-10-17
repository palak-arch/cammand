#!/usr/bin/env node
// Prints REMAINING_TASKS.md with a quick progress summary.
// Usage: npm run tasks
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let md;
try {
  md = readFileSync(join(root, 'REMAINING_TASKS.md'), 'utf8');
} catch {
  console.error('REMAINING_TASKS.md not found.');
  process.exit(1);
}

const total = (md.match(/^- \[ \]/gm) || []).length;
const done = (md.match(/^- \[[xX]\]/gm) || []).length;

console.log('\n CloudOps — remaining tasks \n');
console.log(` Progress: ${done}/${total + done} done, ${total} to go \n`);
console.log(md);
console.log('\n Pick one, then tell the agent: "do task" \n');
