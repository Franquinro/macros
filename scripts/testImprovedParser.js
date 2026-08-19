import fs from 'fs';

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<!--[\s\S]*?-->/g, '') // remove comments like <!--sp707661:0-->
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '') // strip all tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
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

  // Cost (Mana / Energy / Rage / Runic Power / Health / Focus)
  const costMatch = tooltipHtml.match(/(\d+\s*(?:% of base )?(?:Mana|Energy|Rage|Runic Power|Health|Focus))/i);
  if (costMatch) info.cost = costMatch[1].trim();

  // Cast time (Instant, X sec cast, Channeled)
  const castMatch = tooltipHtml.match(/(Instant|Channeled|\d+(?:\.\d+)?\s*sec cast)/i);
  if (castMatch) info.castTime = castMatch[1].trim();

  // Cooldown
  const cdMatch = tooltipHtml.match(/(\d+(?:\.\d+)?\s*(?:sec|min)\s*cooldown)/i);
  if (cdMatch) info.cooldown = cdMatch[1].trim().replace(/&nbsp;/g, ' ');

  // Range
  const rangeMatch = tooltipHtml.match(/(\d+\s*yd range|Melee Range)/i);
  if (rangeMatch) info.range = rangeMatch[1].trim();

  // Split by tables:
  // Usually: <table>[Header / Cost / CD / Cast]</table><table>[Description / Reqs]</table>
  const tables = tooltipHtml.split(/<\/?table[^>]*>/gi).filter(t => t.trim().length > 0);
  
  if (tables.length >= 2) {
    // The second (or subsequent) tables contain the description
    const descTables = tables.slice(1).join('\n');
    info.descriptionEn = cleanHtml(descTables);
  } else if (tables.length === 1) {
    // Single table spell
    info.descriptionEn = cleanHtml(tables[0]);
  } else {
    info.descriptionEn = cleanHtml(tooltipHtml);
  }

  // Remove trailing comments or artifact ids
  info.descriptionEn = info.descriptionEn.replace(/\?[\d:]+$/, '').trim();

  return info;
}

// Better translator for WoW terms
function translateWoWDescription(text) {
  if (!text) return '';
  let es = text;

  const dict = [
    // Headhunting & pushback
    [/Reduces the cast time of (.*?) by (\d+)% and removes your spell pushback suffered from taking damage\./gi, 'Reduce el tiempo de lanzamiento de $1 un $2% y elimina el retroceso de hechizos al recibir daño.'],
    [/Reduces the cast time of (.*?) by (\d+)%/gi, 'Reduce el tiempo de lanzamiento de $1 un $2%'],
    [/removes your spell pushback suffered from taking damage\./gi, 'elimina el retroceso de hechizos al recibir daño.'],
    
    // Fill level / custom CoA mechanics
    [/Grants (.*?) and the ability to manipulate a (.*?)\./gi, 'Otorga $1 y la habilidad de manipular un $2.'],
    [/You have a magical (.*?) that fills up over time, granting you (\d+) stack of (.*?) every (\d+) sec\./gi, 'Tienes un $1 mágico que se llena con el tiempo, otorgándote $2 acumulación de $3 cada $4 s.'],
    [/Some of your other abilities empty your (.*?) to trigger with a reduced cooldown\./gi, 'Algunas de tus otras habilidades vacían tu $1 para activarse con un tiempo de reutilización reducido.'],
    
    // Increases / Reduces
    [/Increases your movement speed by (\d+)% for (\d+)\s*sec/gi, 'Aumenta tu velocidad de movimiento un $1% durante $2 s'],
    [/Increases your maximum (Energy|Mana|Health|Rage) by (\d+)%/gi, 'Aumenta tu $1 máxima un $2%'],
    [/Increases your (critical strike chance|haste|attack power|spell power) by (\d+)%/gi, 'Aumenta tu $1 un $2%'],
    [/Increases damage dealt by (\d+)%/gi, 'Aumenta el daño infligido un $1%'],
    [/Reduces damage taken by (\d+)%/gi, 'Reduce el daño recibido un $1%'],
    [/Reduces the cooldown of (.*?) by (\d+)\s*sec/gi, 'Reduce el tiempo de reutilización de $1 en $2 s'],
    
    // Attacks & procs
    [/Your next attack within the duration will consume the effect to impale your target, causing them to Bleed for (\d+) Physical damage every (\d+) sec for (\d+)\s*sec\./gi, 'Tu siguiente ataque dentro de la duración consumirá el efecto para empalar al objetivo, haciéndolo sangrar por $1 p. de daño físico cada $2 s durante $3 s.'],
    [/Your next attack causes you to swing violently at an enemy and up to (\d+) nearby enemies, dealing (\d+)% Weapon Damage plus (\d+)\./gi, 'Tu siguiente ataque te hace golpear violentamente a un enemigo y hasta $1 enemigos cercanos, infligiendo un $2% de daño de arma más $3.'],
    [/Summons a field of crackling energy at a random target's location\. This field deals (\d+) Arcane damage per second to all enemies within (\d+) yards of that location\./gi, 'Invoca un campo de energía crepitante en la ubicación de un objetivo aleatorio. Este campo inflige $1 p. de daño Arcano por segundo a todos los enemigos a menos de $2 metros.'],
    [/Whirl in a barbaric fury, striking up to (\d+) nearby enemies with both weapons, dealing (\d+)% Weapon Damage plus (\d+)\./gi, 'Gira con furia bárbara, golpeando hasta a $1 enemigos cercanos con ambas armas, infligiendo un $2% de daño de arma más $3.'],
    [/striking up to (\d+) nearby enemies/gi, 'golpeando hasta a $1 enemigos cercanos'],
    
    // Requirements & Tags
    [/Requires Melee Weapon/gi, 'Requiere arma cuerpo a cuerpo'],
    [/Requires Ranged Weapon/gi, 'Requiere arma a distancia'],
    [/Requires Shield/gi, 'Requiere escudo'],
    [/Requires Two-Handed/gi, 'Requiere arma de dos manos'],
    [/Requires One-Handed/gi, 'Requiere arma de una mano'],
    [/Passive/gi, 'Pasiva'],
    [/Spec Passive/gi, 'Pasiva de Especialización'],
    
    // Damage & Healing
    [/deals (\d+) to (\d+) (Physical|Fire|Frost|Nature|Shadow|Holy|Arcane|Twilight) damage/gi, 'inflige de $1 a $2 p. de daño de $3'],
    [/deals (\d+) (Physical|Fire|Frost|Nature|Shadow|Holy|Arcane|Twilight) damage/gi, 'inflige $1 p. de daño de $2'],
    [/deals (\d+)% Weapon Damage/gi, 'inflige un $1% de daño con el arma'],
    [/deals (\d+)% damage/gi, 'inflige un $1% de daño'],
    [/deals (\d+) damage/gi, 'inflige $1 p. de daño'],
    [/heals the target for (\d+) to (\d+)/gi, 'sana al objetivo de $1 a $2 p.'],
    [/heals the target for (\d+)/gi, 'sana al objetivo por $1 p.'],
    [/heals for (\d+) to (\d+)/gi, 'sana de $1 a $2 p.'],
    [/heals for (\d+)/gi, 'sana por $1 p.'],
    [/for (\d+)\s*sec/gi, 'durante $1 s'],
    [/every (\d+)\s*sec/gi, 'cada $1 s'],
    
    // Schools & Resources
    [/Physical damage/gi, 'daño físico'],
    [/Fire damage/gi, 'daño de Fuego'],
    [/Frost damage/gi, 'daño de Escarcha'],
    [/Nature damage/gi, 'daño de Naturaleza'],
    [/Shadow damage/gi, 'daño de Sombras'],
    [/Holy damage/gi, 'daño Sagrado'],
    [/Arcane damage/gi, 'daño Arcano'],
    [/Twilight damage/gi, 'daño Crepuscular'],
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

async function test() {
  const ids = [500060, 500061, 501344, 500000];
  for (const id of ids) {
    const res = await fetch(`https://db.ascension.gg/?spell=${id}&power`);
    const text = await res.text();
    const jsonMatch = text.match(/\$WowheadPower\.registerSpell\(\d+,\s*\d+,\s*(\{[\s\S]*?\})\);/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      const parsed = parseTooltipHtml(data.tooltip_enus || '');
      console.log(`\n=== ID ${id}: ${data.name_enus} (${data.icon}) ===`);
      console.log('Parsed EN:', parsed.descriptionEn);
      console.log('Parsed ES:', translateWoWDescription(parsed.descriptionEn));
    }
  }
}

test().catch(console.error);
