import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function diagnoseMismatches() {
  const coaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/coaSpellsData.json'), 'utf8'));
  const luaPath = path.join(__dirname, '../src/data/SpellDescs.lua');
  const fileStream = fs.createReadStream(luaPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const descPairs = new Map();
  const descById = new Map();
  let inSection = 'pairs';

  for await (const line of rl) {
    if (line.includes('AscensionES.DescByID = {}')) {
      inSection = 'byId';
      continue;
    }
    if (inSection === 'pairs') {
      const match = line.match(/^T\[(\d+)\]=\{"([\s\S]*)","([\s\S]*)"\}$/);
      if (match) {
        descPairs.set(parseInt(match[1], 10), { patternStr: match[2], transStr: match[3] });
      }
    } else if (inSection === 'byId') {
      const match = line.match(/^T\[(\d+)\]=(.+)$/);
      if (match) {
        const spellId = parseInt(match[1], 10);
        const valStr = match[2].trim();
        if (valStr.startsWith('{') && valStr.endsWith('}')) {
          const ids = valStr.slice(1, -1).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
          descById.set(spellId, ids);
        } else {
          const num = parseInt(valStr, 10);
          if (!isNaN(num)) descById.set(spellId, [num]);
        }
      }
    }
  }

  let count = 0;
  for (const [cls, list] of Object.entries(coaData.spellsByClass)) {
    for (const spell of list) {
      const enDesc = spell.descriptionEn ? spell.descriptionEn.trim() : '';
      if (!enDesc) continue;
      const candidatePairIds = descById.get(spell.id);
      if (candidatePairIds && candidatePairIds.length > 0) {
        let matched = false;
        // Let's print out the first 10
        if (count < 10) {
          console.log(`\n--- Spell [${spell.id}] ${spell.name} ---`);
          console.log(`EnDesc in DB: [${enDesc}]`);
          for (const pid of candidatePairIds) {
            const pair = descPairs.get(pid);
            if (pair) {
              console.log(`Pair #${pid}: Pattern: [${pair.patternStr}]`);
              console.log(`Pair #${pid}: Trans:   [${pair.transStr}]`);
            }
          }
          count++;
        }
      }
    }
  }
}

diagnoseMismatches();
