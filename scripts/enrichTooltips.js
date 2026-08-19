import fs from 'fs';
import path from 'path';

// Clean HTML to text
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function parseTooltipHtml(tooltipHtml) {
  if (!tooltipHtml) return {};

  const info = {
    cost: '',
    castTime: '',
    cooldown: '',
    range: '',
    descriptionEn: ''
  };

  const costMatch = tooltipHtml.match(/(\d+\s*(?:% of base )?(?:Mana|Energy|Rage|Runic Power|Health|Focus))/i);
  if (costMatch) info.cost = costMatch[1].trim();

  const castMatch = tooltipHtml.match(/(Instant|Channeled|\d+(?:\.\d+)?\s*sec cast)/i);
  if (castMatch) info.castTime = castMatch[1].trim();

  const cdMatch = tooltipHtml.match(/(\d+(?:\.\d+)?\s*(?:sec|min)\s*cooldown)/i);
  if (cdMatch) info.cooldown = cdMatch[1].trim().replace(/&nbsp;/g, ' ');

  const rangeMatch = tooltipHtml.match(/(\d+\s*yd range|Melee Range)/i);
  if (rangeMatch) info.range = rangeMatch[1].trim();

  const qMatch = tooltipHtml.match(/<span class="q">([\s\S]*?)<\/span>/i);
  if (qMatch) {
    info.descriptionEn = cleanHtml(qMatch[1]);
  } else {
    const tableParts = tooltipHtml.split('<table>');
    if (tableParts.length > 2) {
      info.descriptionEn = cleanHtml(tableParts[2]);
    }
  }

  return info;
}

function translateWoWDescription(text) {
  if (!text) return '';
  let es = text;

  const dict = [
    // Phrases & mechanics
    [/Increases your movement speed by (\d+)% for (\d+)\s*sec/gi, 'Aumenta tu velocidad de movimiento un $1% durante $2 s'],
    [/Increases your maximum (Energy|Mana|Health|Rage) by (\d+)%/gi, 'Aumenta tu $1 máxima un $2%'],
    [/Increases your (critical strike chance|haste|attack power|spell power) by (\d+)%/gi, 'Aumenta tu $1 un $2%'],
    [/Increases damage dealt by (\d+)%/gi, 'Aumenta el daño infligido un $1%'],
    [/Reduces damage taken by (\d+)%/gi, 'Reduce el daño recibido un $1%'],
    [/Your next attack within the duration will consume the effect to impale your target, causing them to Bleed for (\d+) Physical damage every (\d+) sec for (\d+)\s*sec\./gi, 'Tu siguiente ataque dentro de la duración consumirá el efecto para empalar al objetivo, haciéndolo sangrar por $1 p. de daño físico cada $2 s durante $3 s.'],
    [/Your next attack causes you to swing violently at an enemy and up to (\d+) nearby enemies, dealing (\d+)% Weapon Damage plus (\d+)\./gi, 'Tu siguiente ataque te hace golpear violentamente a un enemigo y hasta $1 enemigos cercanos, infligiendo un $2% de daño de arma más $3.'],
    [/Summons a field of crackling energy at a random target's location\. This field deals (\d+) Arcane damage per second to all enemies within (\d+) yards of that location\./gi, 'Invoca un campo de energía crepitante en la ubicación de un objetivo aleatorio. Este campo inflige $1 p. de daño Arcano por segundo a todos los enemigos a menos de $2 metros.'],
    [/Whirl in a barbaric fury, striking up to (\d+) nearby enemies with both weapons, dealing (\d+)% Weapon Damage plus (\d+)\./gi, 'Gira con furia bárbara, golpeando hasta a $1 enemigos cercanos con ambas armas, infligiendo un $2% de daño de arma más $3.'],
    [/striking up to (\d+) nearby enemies/gi, 'golpeando hasta a $1 enemigos cercanos'],
    [/Requires Melee Weapon/gi, 'Requiere arma cuerpo a cuerpo'],
    [/Requires Ranged Weapon/gi, 'Requiere arma a distancia'],
    [/Requires Shield/gi, 'Requiere escudo'],
    [/Requires Two-Handed/gi, 'Requiere arma de dos manos'],
    [/Requires One-Handed/gi, 'Requiere arma de una mano'],
    [/Passive/gi, 'Pasiva'],
    [/deals (\d+) to (\d+) (Physical|Fire|Frost|Nature|Shadow|Holy|Arcane) damage/gi, 'inflige de $1 a $2 p. de daño $3'],
    [/deals (\d+) (Physical|Fire|Frost|Nature|Shadow|Holy|Arcane) damage/gi, 'inflige $1 p. de daño $2'],
    [/deals (\d+)% Weapon Damage/gi, 'inflige un $1% de daño con el arma'],
    [/deals (\d+)% damage/gi, 'inflige un $1% de daño'],
    [/deals (\d+) damage/gi, 'inflige $1 p. de daño'],
    [/heals the target for (\d+) to (\d+)/gi, 'sana al objetivo de $1 a $2 p.'],
    [/heals the target for (\d+)/gi, 'sana al objetivo por $1 p.'],
    [/heals for (\d+) to (\d+)/gi, 'sana de $1 a $2 p.'],
    [/heals for (\d+)/gi, 'sana por $1 p.'],
    [/for (\d+)\s*sec/gi, 'durante $1 s'],
    [/every (\d+)\s*sec/gi, 'cada $1 s'],
    [/Physical damage/gi, 'daño físico'],
    [/Fire damage/gi, 'daño de Fuego'],
    [/Frost damage/gi, 'daño de Escarcha'],
    [/Nature damage/gi, 'daño de Naturaleza'],
    [/Shadow damage/gi, 'daño de Sombras'],
    [/Holy damage/gi, 'daño Sagrado'],
    [/Arcane damage/gi, 'daño Arcano'],
    [/Physical/gi, 'Físico'],
    [/Energy/gi, 'Energía'],
    [/Rage/gi, 'Ira'],
    [/Mana/gi, 'Maná'],
    [/Health/gi, 'Salud'],
    [/cooldown/gi, 'tiempo de reutilización'],
    [/Instant/gi, 'Instantáneo']
  ];

  for (const [pattern, rep] of dict) {
    es = es.replace(pattern, rep);
  }

  return es;
}

async function fetchTooltip(spellId) {
  try {
    const res = await fetch(`https://db.ascension.gg/?spell=${spellId}&power`);
    if (!res.ok) return null;
    const text = await res.text();
    const jsonMatch = text.match(/\$WowheadPower\.registerSpell\(\d+,\s*\d+,\s*(\{[\s\S]*?\})\);/);
    if (!jsonMatch) return null;
    const data = JSON.parse(jsonMatch[1]);
    const parsed = parseTooltipHtml(data.tooltip_enus || '');
    return {
      icon: data.icon || '',
      cost: parsed.cost || '',
      castTime: parsed.castTime || '',
      cooldown: parsed.cooldown || '',
      range: parsed.range || '',
      descriptionEn: parsed.descriptionEn || '',
      descriptionEs: translateWoWDescription(parsed.descriptionEn || '')
    };
  } catch (err) {
    return null;
  }
}

async function batchFetchTooltips(spells, concurrency = 12) {
  const results = new Map();
  console.log(`Fetching tooltips for ${spells.length} unique abilities (concurrency ${concurrency})...`);
  
  let index = 0;
  async function worker() {
    while (index < spells.length) {
      const currIdx = index++;
      const sp = spells[currIdx];
      const tooltip = await fetchTooltip(sp.id);
      if (tooltip) {
        results.set(sp.name, tooltip);
      }
      if (currIdx % 50 === 0 || currIdx === spells.length - 1) {
        console.log(`Progress: ${currIdx + 1}/${spells.length} (${Math.round((currIdx + 1) / spells.length * 100)}%)`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  const dataRaw = fs.readFileSync('src/data/coaSpellsData.json', 'utf-8');
  const coaData = JSON.parse(dataRaw);

  // Group unique spells by name across classes
  const uniqueSpellsMap = new Map();
  for (const [clsName, spells] of Object.entries(coaData.spellsByClass)) {
    for (const sp of spells) {
      if (!uniqueSpellsMap.has(sp.name)) {
        uniqueSpellsMap.set(sp.name, {
          id: sp.id,
          name: sp.name,
          className: clsName,
          icon: sp.icon
        });
      }
    }
  }

  const uniqueList = Array.from(uniqueSpellsMap.values());
  console.log(`Found ${uniqueList.length} unique abilities to enrich with tooltips.`);

  const tooltipsMap = await batchFetchTooltips(uniqueList, 15);
  console.log(`Successfully fetched ${tooltipsMap.size} tooltips!`);

  // Enrich data
  const enrichedSpellsByClass = {};
  for (const [clsName, spells] of Object.entries(coaData.spellsByClass)) {
    enrichedSpellsByClass[clsName] = spells.map(sp => {
      const tt = tooltipsMap.get(sp.name);
      return {
        ...sp,
        icon: (tt && tt.icon) || sp.icon,
        cost: (tt && tt.cost) || '',
        castTime: (tt && tt.castTime) || '',
        cooldown: (tt && tt.cooldown) || '',
        range: (tt && tt.range) || '',
        descriptionEn: (tt && tt.descriptionEn) || '',
        descriptionEs: (tt && tt.descriptionEs) || ''
      };
    });
  }

  const outputEnriched = {
    ...coaData,
    enrichedAt: new Date().toISOString(),
    tooltipsCount: tooltipsMap.size,
    spellsByClass: enrichedSpellsByClass
  };

  fs.writeFileSync('src/data/coaSpellsData.json', JSON.stringify(outputEnriched, null, 2), 'utf-8');
  console.log('Saved enriched coaSpellsData.json!');
}

main().catch(console.error);
