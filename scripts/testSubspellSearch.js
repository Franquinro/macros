import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSubspellSearch() {
  const luaPath = path.join(__dirname, '../src/data/SpellDescs.lua');
  const fileStream = fs.createReadStream(luaPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let found = 0;
  for await (const line of rl) {
    if (line.includes('Tankard that fills up over time') || line.includes('magical Tankard') || line.includes('Warspear symbol') || line.includes('Emanate a powerful aura')) {
      console.log('Found match in Lua:', line.slice(0, 160));
      found++;
    }
  }
  console.log('Total found:', found);
}

testSubspellSearch();
