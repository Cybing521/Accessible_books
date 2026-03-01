// scripts/xls-to-products.js
import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const xlsPath = join(__dirname, '../data/残疾人家居改造家具分类表(1).xls');
const outPath = join(__dirname, '../src/data/products.json');

const wb = XLSX.readFile(xlsPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const raw = [];
let category = '肢体类';
const catMap = { '肢体类': '肢体类', '视力类': '视障类', '听力类': '听障类' };
const headerRow = rows.findIndex(r => r && (r[0] === '序号' || r[1] === '适用场所'));
if (headerRow < 0) throw new Error('Header row not found');

for (let i = headerRow + 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.every(c => c == null || c === '')) continue;
  if (r[0] in catMap) { category = catMap[r[0]]; continue; }
  if (r[0] === '序号' || !r[0]) continue;
  const name = (r[2] || '').trim();
  if (!name) continue;
  raw.push({
    name,
    category,
    venue: r[1] || '',
    audience: String(r[4] || '').replace(/\n/g, '、'),
    material: String(r[3] || '').replace(/\n/g, ' '),
    _firstId: raw.length + 1
  });
}

// Deduplicate by name, merge data, preserve first-occurrence order
const byName = new Map();
for (const p of raw) {
  if (!byName.has(p.name)) {
    byName.set(p.name, {
      ...p,
      categories: [p.category],
      firstId: p._firstId
    });
  } else {
    const m = byName.get(p.name);
    if (!m.categories.includes(p.category)) m.categories.push(p.category);
    if ((p.audience || '').length > 0) {
      const parts = (m.audience + '、' + p.audience).split('、').filter(Boolean);
      m.audience = [...new Set(parts)].join('、');
    }
    if ((p.material || '').length > (m.material || '').length) m.material = p.material;
    if ((p.venue || '').trim() && !(m.venue || '').trim()) m.venue = p.venue;
  }
}

const products = [];
let idx = 0;
for (const p of raw) {
  const m = byName.get(p.name);
  if (!m) continue;
  byName.delete(p.name);
  idx++;
  products.push({
    id: String(idx),
    name: m.name,
    category: m.categories.join('、'),
    venue: m.venue || '—',
    audience: m.audience || '—',
    material: m.material || '',
    image: `/images/products/${m.firstId}.png`
  });
}

writeFileSync(outPath, JSON.stringify(products, null, 2), 'utf-8');
console.log(`Wrote ${products.length} products (deduplicated from ${raw.length}) to ${outPath}`);
