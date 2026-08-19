import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/coaSpellsData.json'), 'utf8'));

let untranslated = [];

for (const [cls, list] of Object.entries(coaData.spellsByClass)) {
  for (const s of list) {
    if (s.descriptionEn && (!s.descriptionEs || s.descriptionEs === s.descriptionEn)) {
      untranslated.push({
        id: s.id,
        name: s.name,
        class: cls,
        en: s.descriptionEn
      });
    }
  }
}

console.log(`Total untranslated: ${untranslated.length}`);
console.log('First 20 untranslated:');
untranslated.slice(0, 20).forEach(u => {
  console.log(`[${u.id}] ${u.name} (${u.class}): "${u.en}"`);
});
