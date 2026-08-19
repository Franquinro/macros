import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert Lua pattern to JS RegExp
function luaPatternToRegex(pattern) {
  // In Lua pattern:
  // % is escape character
  // (.-) -> (.*?) non-greedy capture
  // %. -> \.
  // %- -> \-
  // %% -> %
  // %( -> \(
  // %) -> \)
  // %s -> \s
  // %d -> \d
  // %a -> [a-zA-Z]
  // %w -> [a-zA-Z0-9]
  // %b() -> balanced ()
  // %* -> \*
  // %+ -> \+
  // %? -> \?
  // %$ -> \$
  // %^ -> \^
  // %[ -> \[
  // %] -> \]
  
  let jsPat = '';
  let i = 0;
  while (i < pattern.length) {
    const char = pattern[i];
    if (char === '%') {
      i++;
      if (i >= pattern.length) {
        jsPat += '%';
        break;
      }
      const nextChar = pattern[i];
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
      else if (nextChar === 's') jsPat += '\\s';
      else if (nextChar === 'd') jsPat += '\\d';
      else if (nextChar === 'a') jsPat += '[a-zA-Z]';
      else if (nextChar === 'w') jsPat += '[a-zA-Z0-9]';
      else jsPat += '\\' + nextChar;
    } else if (char === '(' && pattern.slice(i, i + 4) === '(.-)') {
      jsPat += '(.*?)';
      i += 3;
    } else if (['.', '+', '*', '?', '[', ']', '{', '}', '|', '\\'].includes(char)) {
      // Literal in lua if not preceded by %? In Lua, . is any char unless escaped %.
      // In Lua pattern: . is any char (like in regex). + is 1 or more. * is 0 or more. - is 0 or more non-greedy. ? is optional.
      // ^ is start anchor. $ is end anchor.
      if (char === '.') jsPat += '[\\s\\S]'; // In JS, . doesn't match newline without s flag, so [\\s\\S] or s flag
      else if (char === '+') jsPat += '+';
      else if (char === '*') jsPat += '*';
      else if (char === '?') jsPat += '?';
      else if (char === '[') jsPat += '[';
      else if (char === ']') jsPat += ']';
      else if (char === '(') jsPat += '(';
      else if (char === ')') jsPat += ')';
      else if (char === '{' || char === '}' || char === '|' || char === '\\') jsPat += '\\' + char;
      else jsPat += char;
    } else {
      jsPat += char;
    }
    i++;
  }

  try {
    return new RegExp(jsPat, 'i');
  } catch (e) {
    return null;
  }
}

// Clean in-game formatting
function cleanInGameFormatting(text) {
  if (!text) return '';
  let res = text;

  // Replace WoW color codes |cff123456 or |c12345678 or |cFF... and |r
  res = res.replace(/\|c[0-9a-fA-F]{8}/gi, '');
  res = res.replace(/\|r/gi, '');
  
  // Replace WoW texture codes |T...|t
  res = res.replace(/\|T[^|]+\|t/gi, '');

  // Replace @ext:...:ext@, @ext:...@ext, ext@, @ext, ext
  res = res.replace(/@ext:[^:]*:ext@/gi, '');
  res = res.replace(/@ext:[^@]*@ext/gi, '');
  res = res.replace(/@ext:[^@\n]*/gi, '');
  res = res.replace(/@ext/gi, '');
  res = res.replace(/ext@/gi, '');
  res = res.replace(/\bext\b$/g, '');

  // Clean extra backslashes or formatting artifacts
  res = res.replace(/\\n/g, '\n');
  res = res.replace(/\|n/g, '\n');

  // Normalize whitespace: trim lines
  res = res.split('\n').map(l => l.trim()).join('\n').trim();

  return res;
}

// Substitute captures {{1}}, {{2}} into template
function substituteTemplate(template, captures) {
  let result = template;
  for (let i = 0; i < captures.length; i++) {
    const placeholder = new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g');
    result = result.replace(placeholder, captures[i]);
  }
  return cleanInGameFormatting(result);
}

async function testMatch() {
  console.log('Loading coaSpellsData.json...');
  const coaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/coaSpellsData.json'), 'utf8'));

  console.log('Parsing SpellDescs.lua...');
  const luaPath = path.join(__dirname, '../src/data/SpellDescs.lua');
  const fileStream = fs.createReadStream(luaPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const descPairs = new Map(); // id -> { patternStr, transStr, regex }
  const descById = new Map();  // spellId -> [pairId, ...]

  let inSection = 'pairs'; // 'pairs' or 'byId'

  for await (const line of rl) {
    if (line.includes('AscensionES.DescByID = {}')) {
      inSection = 'byId';
      continue;
    }

    if (inSection === 'pairs') {
      // T[123]={"pattern","trans"}
      const match = line.match(/^T\[(\d+)\]=\{"([\s\S]*)","([\s\S]*)"\}$/);
      if (match) {
        const id = parseInt(match[1], 10);
        // Note: in Lua string literals, quotes/slashes might be escaped
        let patternStr = match[2];
        let transStr = match[3];
        descPairs.set(id, { patternStr, transStr });
      }
    } else if (inSection === 'byId') {
      // T[spellId]=123 or T[spellId]={1,2,3}
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

  console.log(`Loaded ${descPairs.size} DescPairs and ${descById.size} DescByID entries.`);

  let totalSpells = 0;
  let exactIdMatches = 0;
  let idPairMismatch = 0;
  let noIdInLua = 0;
  let sampleMatches = [];

  for (const [cls, list] of Object.entries(coaData.spellsByClass)) {
    for (const spell of list) {
      totalSpells++;
      const enDesc = spell.descriptionEn ? spell.descriptionEn.trim() : '';
      if (!enDesc) continue;

      const candidatePairIds = descById.get(spell.id);
      if (candidatePairIds && candidatePairIds.length > 0) {
        let matched = false;
        for (const pairId of candidatePairIds) {
          const pair = descPairs.get(pairId);
          if (!pair) continue;

          if (!pair.regex) {
            pair.regex = luaPatternToRegex(pair.patternStr);
          }

          if (pair.regex) {
            const m = enDesc.match(pair.regex);
            if (m) {
              const captures = m.slice(1);
              const trans = substituteTemplate(pair.transStr, captures);
              matched = true;
              exactIdMatches++;
              if (sampleMatches.length < 5) {
                sampleMatches.push({
                  name: spell.name,
                  id: spell.id,
                  en: enDesc,
                  es: trans
                });
              }
              break;
            }
          }
        }
        if (!matched) {
          idPairMismatch++;
        }
      } else {
        noIdInLua++;
      }
    }
  }

  console.log({
    totalSpells,
    exactIdMatches,
    idPairMismatch,
    noIdInLua
  });

  console.log('Sample matches:', JSON.stringify(sampleMatches, null, 2));
}

testMatch();
