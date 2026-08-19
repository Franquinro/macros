import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findTankard() {
  const luaPath = path.join(__dirname, '../src/data/SpellDescs.lua');
  const fileStream = fs.createReadStream(luaPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.toLowerCase().includes('tankard') || line.toLowerCase().includes('ripping frenzy') || line.toLowerCase().includes('bleed for')) {
      console.log(line.slice(0, 140));
    }
  }
}

findTankard();
