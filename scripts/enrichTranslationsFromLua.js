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

function cleanForPrefixMatch(str) {
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

const requirementTranslations = [
  [/^Requires Melee Weapon\b/i, 'Requiere arma cuerpo a cuerpo'],
  [/^Requires One-Handed Melee Weapon\b/i, 'Requiere arma cuerpo a cuerpo de una mano'],
  [/^Requires Two-Handed Melee Weapon\b/i, 'Requiere arma cuerpo a cuerpo de dos manos'],
  [/^Requires Two-Handed Weapon\b/i, 'Requiere arma de dos manos'],
  [/^Requires One-Handed Weapon\b/i, 'Requiere arma de una mano'],
  [/^Requires Main Hand Weapon\b/i, 'Requiere arma en la mano principal'],
  [/^Requires Off-Hand Weapon\b/i, 'Requiere arma en la mano izquierda'],
  [/^Requires Weapon\b/i, 'Requiere arma'],
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

const fallbackSentenceRules = [
  [/^Does not stack with (other )?similar effects\.?$/i, 'No se acumula con otros efectos similares.'],
  [/^Only usable on enemies below (\d+)% health\.?$/i, 'Solo se puede usar en enemigos con menos del $1% de salud.'],
  [/^Only usable in ([^\.]+)\.?$/i, 'Solo se puede usar en $1.'],
  [/^Teaches you (.*?)\.?$/i, 'Te enseña $1.'],
  [/^Grants (.*?)\.?$/i, 'Otorga $1.'],
  [/^Increases your ([a-zA-Z\s]+) by (\d+)%\.?$/i, 'Aumenta tu $1 en un $2%.'],
  [/^Reduces the cooldown of (.*?) by (\d+) sec\.?$/i, 'Reduce el tiempo de reutilización de $1 en $2 s.'],
  [/^Lasts (\d+) sec\.?$/i, 'Dura $1 s.'],
  [/^Lasts (\d+) min\.?$/i, 'Dura $1 min.'],
  [/^Lasts (\d+) hr\.?$/i, 'Dura $1 h.'],
  [/^Max (\d+) charges\.?$/i, 'Máximo $1 cargas.'],
  [/^(\d+) second recharge timer\.?$/i, 'Tiempo de recarga de $1 segundos.']
];

async function main() {
  console.log('Loading coaSpellsData.json...');
  const coaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/coaSpellsData.json'), 'utf8'));

  console.log('Parsing SpellDescs.lua (DescPairs, DescByID, DescByPrefix)...');
  const luaPath = path.join(__dirname, '../src/data/SpellDescs.lua');
  const fileStream = fs.createReadStream(luaPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const descPairs = new Map();
  const descById = new Map();
  const descByPrefix = new Map();

  let inSection = 'pairs';

  for await (const line of rl) {
    if (line.includes('AscensionES.DescByID = {}')) {
      inSection = 'byId';
      continue;
    }
    if (line.includes('AscensionES.DescByPrefix = {}')) {
      inSection = 'byPrefix';
      continue;
    }

    if (inSection === 'pairs') {
      const match = line.match(/^T\[(\d+)\]=\{"([\s\S]*)","([\s\S]*)"\}$/);
      if (match) {
        const id = parseInt(match[1], 10);
        descPairs.set(id, { patternStr: match[2], transStr: match[3] });
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
    } else if (inSection === 'byPrefix') {
      // T["prefix string"]={1,2,3} or T["prefix string"]=123
      const match = line.match(/^T\["([^"]+)"\]=(.+)$/);
      if (match) {
        const prefixKey = match[1].toLowerCase().trim();
        const valStr = match[2].trim();
        let ids = [];
        if (valStr.startsWith('{') && valStr.endsWith('}')) {
          ids = valStr.slice(1, -1).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        } else {
          const num = parseInt(valStr, 10);
          if (!isNaN(num)) ids = [num];
        }
        if (ids.length > 0) {
          descByPrefix.set(prefixKey, ids);
        }
      }
    }
  }

  console.log(`Loaded:
  - ${descPairs.size} DescPairs
  - ${descById.size} DescByID
  - ${descByPrefix.size} DescByPrefix`);

  function findCandidatePairsForText(text, spellId) {
    const candidates = [];
    const seen = new Set();

    function addIds(ids) {
      if (!ids) return;
      for (const id of ids) {
        if (!seen.has(id)) {
          seen.add(id);
          candidates.push(id);
        }
      }
    }

    if (spellId) {
      addIds(descById.get(spellId));
    }

    const normText = cleanForPrefixMatch(text);
    if (!normText) return candidates;

    // Check exact or prefix in descByPrefix
    for (const [prefix, ids] of descByPrefix.entries()) {
      if (normText.startsWith(prefix) || prefix.startsWith(normText.slice(0, 40))) {
        addIds(ids);
        if (candidates.length > 30) break;
      }
    }

    return candidates;
  }

  function matchSingleBlock(text, spellId, extraCandidates = null) {
    if (!text || !text.trim()) return null;
    let cleanText = text.trim();
    if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
      cleanText = cleanText.slice(1, -1).trim();
    } else if (cleanText.startsWith('"')) {
      cleanText = cleanText.slice(1).trim();
    }

    const candidatePairIds = extraCandidates || findCandidatePairsForText(cleanText, spellId);

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

    // Fallback sentence rules
    for (const [re, trans] of fallbackSentenceRules) {
      if (re.test(cleanText)) {
        return cleanText.replace(re, trans);
      }
    }

    return null;
  }

  function translateDescription(enDesc, spellId) {
    if (!enDesc || !enDesc.trim()) return '';

    // 1. Direct match whole text
    const fullMatch = matchSingleBlock(enDesc, spellId);
    if (fullMatch) return fullMatch;

    // 2. Direct match without "Requires ..." prefix
    const reqMatch = enDesc.match(/^(Requires [^\n]+)\n+([\s\S]+)$/i);
    if (reqMatch) {
      const reqLine = reqMatch[1];
      const rest = reqMatch[2];
      const translatedRest = matchSingleBlock(rest, spellId);
      if (translatedRest) {
        return translateRequirementLine(reqLine) + '\n' + translatedRest;
      }
    }

    // 3. Line-by-line / section-by-section
    const lines = enDesc.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      let translatedLines = [];
      for (const line of lines) {
        if (/^Requires /i.test(line)) {
          translatedLines.push(translateRequirementLine(line));
          continue;
        }

        const t = matchSingleBlock(line, spellId);
        if (t) {
          translatedLines.push(t);
        } else {
          // If line has multiple sentences, try translating sentence by sentence
          const sentences = line.split(/(?<=[.!?])\s+/);
          if (sentences.length > 1) {
            let translatedSentences = [];
            for (const s of sentences) {
              const st = matchSingleBlock(s, spellId);
              translatedSentences.push(st || s);
            }
            translatedLines.push(translatedSentences.join(' '));
          } else {
            // Check if sub-spell title or aura name
            translatedLines.push(line);
          }
        }
      }
      return cleanAllFormatting(translatedLines.join('\n'));
    }

    // Single block sentence-by-sentence
    const sentences = enDesc.split(/(?<=[.!?])\s+/);
    if (sentences.length > 1) {
      let translatedSentences = [];
      for (const s of sentences) {
        const st = matchSingleBlock(s, spellId);
        translatedSentences.push(st || s);
      }
      return cleanAllFormatting(translatedSentences.join(' '));
    }

    return cleanAllFormatting(enDesc);
  }

  // Update coaSpellsData.json
  let totalCount = 0;
  let translatedCount = 0;

  for (const [cls, list] of Object.entries(coaData.spellsByClass)) {
    for (const spell of list) {
      totalCount++;
      if (spell.descriptionEn) {
        const trans = translateDescription(spell.descriptionEn, spell.id);
        spell.descriptionEs = trans;
        if (trans && trans !== spell.descriptionEn) {
          translatedCount++;
        }
      }
    }
  }

  console.log(`Translation complete: ${translatedCount} / ${totalCount} (${((translatedCount / totalCount) * 100).toFixed(1)}%) translated into authentic Spanish!`);

  const outPath = path.join(__dirname, '../src/data/coaSpellsData.json');
  fs.writeFileSync(outPath, JSON.stringify(coaData, null, 2), 'utf8');
  console.log(`Saved updated file to ${outPath}`);
}

main();
