import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanAllFormatting(str) {
  if (!str) return '';
  let res = str;
  let prev;
  do {
    prev = res;
    res = res
      .replace(/\|c[0-9a-fA-F]{8}/gi, '')
      .replace(/\|r/gi, '')
      .replace(/\|T[^|]+\|t/gi, '')
      .replace(/@ext:[^:]*:ext@/gi, '')
      .replace(/@ext:[^@]*@ext/gi, '')
      .replace(/@ext:[^@\n]*/gi, '')
      .replace(/@ext/gi, '')
      .replace(/ext@/gi, '')
      .replace(/\\n/g, '\n')
      .replace(/\|n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
  } while (res !== prev);

  res = res.replace(/\bext\b/g, '');
  return res;
}

function normalizeKey(str) {
  return cleanAllFormatting(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function luaPatternToFlexibleJsRegex(rawPattern) {
  let cleaned = cleanAllFormatting(rawPattern);
  
  let p = cleaned;
  if (p.startsWith('^')) p = p.slice(1);
  p = p.replace(/%s\*\$$/, '');
  p = p.replace(/\$$/, '');

  let jsPat = '';
  let i = 0;
  while (i < p.length) {
    const char = p[i];
    if (char === '%') {
      i++;
      if (i >= p.length) break;
      const nextChar = p[i];
      if (nextChar === '%') jsPat += '%';
      else if (nextChar === '.') jsPat += '\\.';
      else if (nextChar === '-') jsPat += '\\-';
      else if (nextChar === '(') jsPat += '\\(';
      else if (nextChar === ')') jsPat += '\\)';
      else if (nextChar === '[') jsPat += '\\[';
      else if (nextChar === ']') jsPat += '\\]';
      else if (nextChar === '+') jsPat += '\\+';
      else if (nextChar === '*') jsPat += '\\*';
      else if (nextChar === '?') jsPat += '\\?';
      else if (nextChar === '$') jsPat += '\\$';
      else if (nextChar === '^') jsPat += '\\^';
      else if (nextChar === 's') jsPat += '\\s+';
      else if (nextChar === 'd') jsPat += '\\d+';
      else if (nextChar === 'a') jsPat += '[a-zA-Z]+';
      else if (nextChar === 'w') jsPat += '[a-zA-Z0-9]+';
      else jsPat += '\\' + nextChar;
    } else if (char === '(' && p.slice(i, i + 4) === '(.-)') {
      jsPat += '(.*?)';
      i += 3;
    } else if (/\s/.test(char)) {
      while (i + 1 < p.length && /\s/.test(p[i + 1])) {
        i++;
      }
      jsPat += '\\s+';
    } else if (['.', '+', '*', '?', '[', ']', '{', '}', '|', '\\', '(', ')'].includes(char)) {
      if (char === '.') jsPat += '[\\s\\S]';
      else if (char === '+') jsPat += '+';
      else if (char === '*') jsPat += '*';
      else if (char === '?') jsPat += '?';
      else jsPat += '\\' + char;
    } else {
      jsPat += char;
    }
    i++;
  }

  try {
    return new RegExp('^\\s*' + jsPat + '\\s*$', 'is');
  } catch (e) {
    return null;
  }
}

function substituteTemplate(template, captures) {
  let result = cleanAllFormatting(template);
  for (let i = 0; i < captures.length; i++) {
    const val = (captures[i] || '').trim();
    const placeholder = new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g');
    result = result.replace(placeholder, val);
  }
  result = result.replace(/\{\{\d+\}\}/g, '');
  return cleanAllFormatting(result).trim();
}

// Common requirement translations
const requirementTranslations = [
  [/^Requires Melee Weapon\b/i, 'Requiere arma cuerpo a cuerpo'],
  [/^Requires One-Handed Melee Weapon\b/i, 'Requiere arma cuerpo a cuerpo de una mano'],
  [/^Requires Two-Handed Melee Weapon\b/i, 'Requiere arma cuerpo a cuerpo de dos manos'],
  [/^Requires Two-Handed Weapon\b/i, 'Requiere arma de dos manos'],
  [/^Requires One-Handed Weapon\b/i, 'Requiere arma de una mano'],
  [/^Requires Shield\b/i, 'Requiere escudo'],
  [/^Requires Ranged Weapon\b/i, 'Requiere arma a distancia'],
  [/^Requires Dagger\b/i, 'Requiere daga'],
  [/^Requires Daggers\b/i, 'Requiere dagas'],
  [/^Requires Bow, Crossbow or Gun\b/i, 'Requiere arco, ballesta o arma de fuego'],
  [/^Requires Thrown Weapon\b/i, 'Requiere arma arrojadiza'],
  [/^Requires Cat Form\b/i, 'Requiere Forma felina'],
  [/^Requires Bear Form\b/i, 'Requiere Forma de oso'],
  [/^Requires Dire Bear Form\b/i, 'Requiere Forma de oso temible'],
  [/^Requires Aquatic Form\b/i, 'Requiere Forma acuática'],
  [/^Requires Travel Form\b/i, 'Requiere Forma de viaje'],
  [/^Requires Moonkin Form\b/i, 'Requiere Forma de lechúcico lunar'],
  [/^Requires Tree of Life\b/i, 'Requiere Árbol de vida'],
  [/^Requires Stealth\b/i, 'Requiere Sigilo'],
  [/^Requires Defensive Stance\b/i, 'Requiere Actitud defensiva'],
  [/^Requires Battle Stance\b/i, 'Requiere Actitud de batalla'],
  [/^Requires Berserker Stance\b/i, 'Requiere Actitud rabiosa'],
  [/^Requires Enraged\b/i, 'Requiere Enfurecido'],
  [/^Requires Fishing Pole\b/i, 'Requiere caña de pescar'],
  [/^Requires (.*)/i, 'Requiere $1']
];

function translateRequirementLine(line) {
  for (const [re, trans] of requirementTranslations) {
    if (re.test(line)) {
      return line.replace(re, trans);
    }
  }
  return line;
}

async function testGlobalMatch() {
  const coaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/coaSpellsData.json'), 'utf8'));
  const luaPath = path.join(__dirname, '../src/data/SpellDescs.lua');
  const fileStream = fs.createReadStream(luaPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const descPairs = new Map();
  const descById = new Map();
  // Map first 3 words of pattern -> array of pairIds for fast global lookup
  const wordsIndex = new Map();

  let inSection = 'pairs';

  for await (const line of rl) {
    if (line.includes('AscensionES.DescByID = {}')) {
      inSection = 'byId';
      continue;
    }
    if (inSection === 'pairs') {
      const match = line.match(/^T\[(\d+)\]=\{"([\s\S]*)","([\s\S]*)"\}$/);
      if (match) {
        const id = parseInt(match[1], 10);
        const patternStr = match[2];
        const transStr = match[3];
        descPairs.set(id, { patternStr, transStr });

        // Index by first significant 3 words of cleaned pattern
        const cleanedPat = cleanAllFormatting(patternStr).replace(/^\^/, '').replace(/%s\*\$$/, '');
        const words = cleanedPat.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().split(/\s+/).slice(0, 3).join(' ');
        if (words.length >= 3) {
          if (!wordsIndex.has(words)) wordsIndex.set(words, []);
          wordsIndex.get(words).push(id);
        }
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

  console.log(`Loaded ${descPairs.size} DescPairs, ${descById.size} DescByID, ${wordsIndex.size} word index keys.`);

  function matchTextWithPairs(text, candidatePairIds) {
    if (!text || !text.trim()) return null;
    const cleanText = text.trim();

    // 1. Try candidate pair IDs
    for (const pairId of candidatePairIds) {
      const pair = descPairs.get(pairId);
      if (!pair) continue;
      if (!pair.regex) pair.regex = luaPatternToFlexibleJsRegex(pair.patternStr);
      if (!pair.regex) continue;
      const m = cleanText.match(pair.regex);
      if (m) {
        return substituteTemplate(pair.transStr, m.slice(1));
      }
    }

    // 2. Try global word index
    const words = cleanText.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().split(/\s+/).slice(0, 3).join(' ');
    const globalCandidates = wordsIndex.get(words) || [];
    for (const pairId of globalCandidates) {
      const pair = descPairs.get(pairId);
      if (!pair) continue;
      if (!pair.regex) pair.regex = luaPatternToFlexibleJsRegex(pair.patternStr);
      if (!pair.regex) continue;
      const m = cleanText.match(pair.regex);
      if (m) {
        return substituteTemplate(pair.transStr, m.slice(1));
      }
    }

    return null;
  }

  function translateDescription(enDesc, spellId) {
    if (!enDesc || !enDesc.trim()) return '';
    const candidatePairIds = descById.get(spellId) || [];

    // Check if entire text matches
    let direct = matchTextWithPairs(enDesc, candidatePairIds);
    if (direct) return direct;

    // Check if starts with "Requires ..."
    const reqMatch = enDesc.match(/^(Requires [^\n]+)\n+([\s\S]+)$/i);
    if (reqMatch) {
      const reqLine = reqMatch[1];
      const rest = reqMatch[2];
      const translatedRest = matchTextWithPairs(rest, candidatePairIds);
      if (translatedRest) {
        return translateRequirementLine(reqLine) + '\n' + translatedRest;
      }
    }

    // Check if composed of multiple sections / sub-spells separated by \n \n
    // Often: Main spell \n Subspell Name \n Subspell Desc \n Subspell 2 Name \n Subspell 2 Desc
    const lines = enDesc.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      // Try translating line-by-line or section-by-section
      let translatedLines = [];
      let allTranslated = true;

      for (const line of lines) {
        if (/^Requires /i.test(line)) {
          translatedLines.push(translateRequirementLine(line));
          continue;
        }
        const t = matchTextWithPairs(line, candidatePairIds);
        if (t) {
          translatedLines.push(t);
        } else {
          // If it's a short sub-header line (e.g. "Fill Level" or "Ripping Frenzy")
          if (line.split(' ').length <= 4 && !/[.!?]$/.test(line)) {
            translatedLines.push(line);
          } else {
            allTranslated = false;
            break;
          }
        }
      }

      if (allTranslated && translatedLines.length === lines.length) {
        return translatedLines.join('\n');
      }
    }

    return null;
  }

  let totalSpells = 0;
  let translatedCount = 0;
  let unmatchedList = [];

  for (const [cls, list] of Object.entries(coaData.spellsByClass)) {
    for (const spell of list) {
      totalSpells++;
      const enDesc = spell.descriptionEn ? spell.descriptionEn.trim() : '';
      if (!enDesc) continue;

      const esDesc = translateDescription(enDesc, spell.id);
      if (esDesc) {
        translatedCount++;
      } else {
        unmatchedList.push({
          id: spell.id,
          name: spell.name,
          desc: enDesc
        });
      }
    }
  }

  console.log({
    totalSpells,
    translatedCount,
    unmatchedCount: unmatchedList.length,
    percentage: ((translatedCount / totalSpells) * 100).toFixed(1) + '%'
  });

  console.log('\nSample unmatched (first 10):');
  for (const u of unmatchedList.slice(0, 10)) {
    console.log(`[${u.id}] ${u.name}: "${u.desc}"`);
  }
}

testGlobalMatch();
