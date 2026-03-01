// scripts/gen-policies.js
import { readdirSync, copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '../政策文件');
const destDir = join(__dirname, '../public/policies');
const outPath = join(__dirname, '../src/data/policies.json');

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
const files = readdirSync(srcDir).filter(f => f.endsWith('.pdf'));
const policies = files.map((f, i) => {
  const src = join(srcDir, f);
  const dest = join(destDir, f);
  if (existsSync(src)) copyFileSync(src, dest);
  return { id: String(i + 1), title: f.replace('.pdf', ''), file: `/policies/${f}` };
});
writeFileSync(outPath, JSON.stringify(policies, null, 2), 'utf-8');
console.log(`Wrote ${policies.length} policies`);
