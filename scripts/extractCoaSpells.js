import fs from 'fs';
import path from 'path';

function cleanSpellName(name) {
  if (!name) return '';
  return name.replace(/^@/, '').trim();
}

async function extractClassSpells(classNum) {
  const url = `https://db.ascension.gg/?spells=7.${classNum}`;
  console.log(`Fetching 7.${classNum}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed 7.${classNum}: status ${res.status}`);
      return null;
    }
    const html = await res.text();

    // Extract class name from Title: e.g. "Barbarian - Class Skills - Ascension Database"
    let className = `CoA Class ${classNum}`;
    const titleMatch = html.match(/<title>\s*(.*?)\s*-\s*Class Skills/i);
    if (titleMatch && titleMatch[1]) {
      className = titleMatch[1].trim();
    }

    const startMarker = 'new Listview(';
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) {
      console.warn(`No Listview in 7.${classNum}`);
      return { classNum, className, spells: [] };
    }

    const dataMarker = '"data":';
    const dataIdx = html.indexOf(dataMarker, startIdx);
    if (dataIdx === -1) {
      console.warn(`No data array in 7.${classNum}`);
      return { classNum, className, spells: [] };
    }

    const arrayStart = html.indexOf('[', dataIdx);
    let depth = 0;
    let arrayEnd = -1;
    for (let i = arrayStart; i < html.length; i++) {
      if (html[i] === '[') depth++;
      else if (html[i] === ']') {
        depth--;
        if (depth === 0) {
          arrayEnd = i;
          break;
        }
      }
    }

    if (arrayEnd === -1) {
      console.warn(`Could not find closing bracket in 7.${classNum}`);
      return { classNum, className, spells: [] };
    }

    const rawJson = html.substring(arrayStart, arrayEnd + 1);
    const rawSpells = JSON.parse(rawJson);

    const spells = rawSpells.map(s => ({
      id: s.id,
      name: cleanSpellName(s.name),
      rank: s.rank || '',
      icon: s.icon || '',
      level: s.level ?? 0,
      school: s.school,
      cat: s.cat
    })).filter(s => s.name && !s.name.startsWith('@Poisons') && !s.name.startsWith('Test '));

    console.log(`-> 7.${classNum} (${className}): ${spells.length} spells`);
    return { classNum, className, spells };
  } catch (err) {
    console.error(`Error in 7.${classNum}:`, err.message);
    return null;
  }
}

async function run() {
  const results = [];
  for (let c = 12; c <= 32; c++) {
    const res = await extractClassSpells(c);
    if (res) {
      results.push(res);
    }
    // Small delay to be gentle
    await new Promise(r => setTimeout(r, 200));
  }

  // Aggregate unique spell names
  const allUniqueSpellNames = new Set();
  const spellsByClass = {};
  const allSpellsList = [];

  for (const cls of results) {
    spellsByClass[cls.className] = cls.spells;
    for (const sp of cls.spells) {
      allUniqueSpellNames.add(sp.name);
      allSpellsList.push({
        ...sp,
        className: cls.className,
        classNum: cls.classNum
      });
    }
  }

  const outputData = {
    extractedAt: new Date().toISOString(),
    totalClasses: results.length,
    totalUniqueSpellNames: allUniqueSpellNames.size,
    totalSpellsCount: allSpellsList.length,
    classes: results.map(r => ({
      classNum: r.classNum,
      className: r.className,
      spellCount: r.spells.length
    })),
    uniqueSpellNames: Array.from(allUniqueSpellNames).sort(),
    spellsByClass
  };

  const jsonOutPath = path.resolve('src/data/coaSpellsData.json');
  fs.writeFileSync(jsonOutPath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`Saved JSON to ${jsonOutPath}`);

  // Create TypeScript file with lookup helpers
  const tsContent = `// Auto-generated CoA Spells database from Ascension Database (7.12 to 7.32)
import coaData from './coaSpellsData.json';

export interface CoaSpellItem {
  id: number;
  name: string;
  rank?: string;
  icon?: string;
  level?: number;
  school?: number;
  cat?: number;
  className?: string;
  classNum?: number;
}

export interface CoaClassSpellGroup {
  classNum: number;
  className: string;
  spellCount: number;
}

export const COA_CLASSES_LIST: CoaClassSpellGroup[] = coaData.classes;

export const COA_UNIQUE_SPELL_NAMES: string[] = coaData.uniqueSpellNames;

export const COA_SPELLS_BY_CLASS: Record<string, CoaSpellItem[]> = coaData.spellsByClass as any;

// Fast lookup Set for Macro syntax highlighting
const COA_SPELL_SET = new Set(COA_UNIQUE_SPELL_NAMES.map(s => s.toLowerCase()));

/**
 * Check if a spell name is a recognized Ascension CoA spell
 */
export function isCoaSpell(spellName: string): boolean {
  if (!spellName) return false;
  return COA_SPELL_SET.has(spellName.trim().toLowerCase());
}

/**
 * Search CoA spells by query for autocomplete suggestions
 */
export function searchCoaSpells(query: string, limit = 10): { name: string; className?: string; icon?: string; rank?: string }[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();
  const results: { name: string; className?: string; icon?: string; rank?: string }[] = [];
  const seen = new Set<string>();

  for (const [className, spells] of Object.entries(COA_SPELLS_BY_CLASS)) {
    for (const sp of spells) {
      if (sp.name.toLowerCase().includes(q)) {
        const key = sp.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            name: sp.name,
            className,
            icon: sp.icon,
            rank: sp.rank
          });
          if (results.length >= limit) return results;
        }
      }
    }
  }

  return results;
}
`;

  const tsOutPath = path.resolve('src/data/coaSpells.ts');
  fs.writeFileSync(tsOutPath, tsContent, 'utf-8');
  console.log(`Saved TS file to ${tsOutPath}`);
  console.log(`Extracted ${allUniqueSpellNames.size} unique CoA spells across ${results.length} classes!`);
}

run().catch(console.error);
