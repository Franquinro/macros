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
  // Loop until all nested WoW tags are removed
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

  // Remove standalone 'ext' at the end of lines
  res = res.replace(/\bext\b/g, '');
  return res;
}

function luaPatternToFlexibleJsRegex(rawPattern) {
  let cleaned = cleanAllFormatting(rawPattern);
  
  // Remove ^ and %s*$
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
      // In Lua (.-) captures lazily. In JS, (.*?) captures lazily
      jsPat += '(.*?)';
      i += 3;
    } else if (/\s/.test(char)) {
      // Match any whitespace including newlines
      // Skip consecutive whitespace in pattern
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
    return new RegExp('^\\s*' + jsPat + '\\s*$', 'is'); // 's' flag so . matches all
  } catch (e) {
    return null;
  }
}

function substituteTemplate(template, captures) {
  let result = cleanAllFormatting(template);
  for (let i = 0; i < captures.length; i++) {
    const val = captures[i].trim();
    const placeholder = new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g');
    result = result.replace(placeholder, val);
  }
  // Remove any leftover {{x}}
  result = result.replace(/\{\{\d+\}\}/g, '');
  return cleanAllFormatting(result).trim();
}

async function runTest2() {
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
        descPairs.set(parseInt(match[1], 10), {
          patternStr: match[2],
          transStr: match[3]
        });
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

  console.log(`Loaded ${descPairs.size} DescPairs and ${descById.size} DescByID.`);

  let totalSpells = 0;
  let directMatches = 0;
  let withPrefixMatches = 0;
  let remainingUnmatched = [];

  const requirementPrefixRegex = /^(Requires [^\n]+\n+)/i;

  for (const [cls, list] of Object.entries(coaData.spellsByClass)) {
    for (const spell of list) {
      totalSpells++;
      const enDesc = spell.descriptionEn ? spell.descriptionEn.trim() : '';
      if (!enDesc) continue;

      const candidatePairIds = descById.get(spell.id) || [];
      let matched = false;

      for (const pairId of candidatePairIds) {
        const pair = descPairs.get(pairId);
        if (!pair) continue;
        if (!pair.regex) {
          pair.regex = luaPatternToFlexibleJsRegex(pair.patternStr);
        }
        if (!pair.regex) continue;

        let m = enDesc.match(pair.regex);
        if (m) {
          matched = true;
          directMatches++;
          break;
        }

        const reqMatch = enDesc.match(requirementPrefixRegex);
        if (reqMatch) {
          const strippedDesc = enDesc.slice(reqMatch[0].length).trim();
          m = strippedDesc.match(pair.regex);
          if (m) {
            matched = true;
            withPrefixMatches++;
            break;
          }
        }
      }

      if (!matched) {
        remainingUnmatched.push({
          id: spell.id,
          name: spell.name,
          desc: enDesc,
          candidatePairIds
        });
      }
    }
  }

  console.log({
    totalSpells,
    directMatches,
    withPrefixMatches,
    totalMatched: directMatches + withPrefixMatches,
    unmatched: remainingUnmatched.length
  });

  console.log('\nSample unmatched (first 5):');
  for (const u of remainingUnmatched.slice(0, 5)) {
    console.log(`[${u.id}] ${u.name}: [${u.desc}]`);
    if (u.candidatePairIds.length > 0) {
      for (const pid of u.candidatePairIds) {
        const p = descPairs.get(pid);
        if (p) console.log(`  Pattern #${pid}: [${p.patternStr}]`);
      }
    } else {
      console.log('  (No ID in DescByID)');
    }
  }
}

runTest2();
