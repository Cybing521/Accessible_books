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

const products = [];
let category = '肢体类';
const headerRow = rows.findIndex(r => r && (r[0] === '序号' || r[1] === '适用场所'));
if (headerRow < 0) throw new Error('Header row not found');

for (let i = headerRow + 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.every(c => c == null || c === '')) continue;
  if (['肢体类', '视障类', '听障类'].includes(r[0])) { category = r[0]; continue; }
  if (r[0] === '序号' || !r[0]) continue;
  products.push({
    id: String(products.length + 1),
    name: r[2] || '',
    category,
    venue: r[1] || '',
    audience: String(r[4] || '').replace(/\n/g, '、'),
    material: String(r[3] || '').replace(/\n/g, ' '),
    image: '/images/products/placeholder.svg'
  });
}

writeFileSync(outPath, JSON.stringify(products, null, 2), 'utf-8');
console.log(`Wrote ${products.length} products to ${outPath}`);
