import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = fs.readFileSync(path.join(__dirname, '../src/data/coaSpellsData.json'), 'utf8');
const lines = data.split('\n');
lines.forEach((line, idx) => {
  if (/\|c|\|r/i.test(line)) {
    console.log('Line ' + (idx + 1) + ': ' + line.trim());
  }
});
