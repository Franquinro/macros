import fs from 'fs';

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

// Parse tooltip details
function parseTooltipHtml(tooltipHtml) {
  if (!tooltipHtml) return {};

  const info = {
    cost: '',
    castTime: '',
    cooldown: '',
    range: '',
    descriptionEn: ''
  };

  // Cost (Mana / Energy / Rage / Runic Power)
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

  // Description in <span class="q">...</span>
  const qMatch = tooltipHtml.match(/<span class="q">([\s\S]*?)<\/span>/i);
  if (qMatch) {
    info.descriptionEn = cleanHtml(qMatch[1]);
  } else {
    // Fallback: second table
    const tableParts = tooltipHtml.split('<table>');
    if (tableParts.length > 2) {
      info.descriptionEn = cleanHtml(tableParts[2]);
    }
  }

  return info;
}

// Translate common WoW gaming phrases from EN to ES
function translateWoWDescription(text) {
  if (!text) return '';
  let es = text;

  // Replacements dictionary for WoW combat terms
  const dict = [
    // General terms
    [/Increases your movement speed by (\d+)% for (\d+)\s*sec/gi, 'Aumenta tu velocidad de movimiento un $1% durante $2 s'],
    [/Increases your maximum (Energy|Mana|Health|Rage) by (\d+)%/gi, 'Aumenta tu $1 máxima un $2%'],
    [/Whirl in a barbaric fury, striking up to (\d+) nearby enemies with both weapons, dealing (\d+)% Weapon Damage plus (\d+)\./gi, 'Gira con furia bárbara, golpeando hasta a $1 enemigos cercanos con ambas armas, infligiendo un $2% de daño de arma más $3.'],
    [/Whirl in a barbaric fury, striking up to (\d+) nearby enemies/gi, 'Gira con furia bárbara, golpeando hasta a $1 enemigos cercanos'],
    [/Your next attack within the duration will consume the effect to impale your target, causing them to Bleed for (\d+) Physical damage every (\d+) sec for (\d+)\s*sec\./gi, 'Tu siguiente ataque dentro de la duración consumirá el efecto para empalar al objetivo, haciéndolo sangrar por $1 p. de daño físico cada $2 s durante $3 s.'],
    [/Your next attack causes you to swing violently at an enemy and up to (\d+) nearby enemies, dealing (\d+)% Weapon Damage plus (\d+)\./gi, 'Tu siguiente ataque te hace golpear violentamente a un enemigo y hasta $1 enemigos cercanos, infligiendo un $2% de daño de arma más $3.'],
    [/Summons a field of crackling energy at a random target's location\. This field deals (\d+) Arcane damage per second to all enemies within (\d+) yards of that location\./gi, 'Invoca un campo de energía crepitante en la ubicación de un objetivo aleatorio. Este campo inflige $1 p. de daño Arcano por segundo a todos los enemigos a menos de $2 metros.'],
    [/Requires Melee Weapon/gi, 'Requiere arma cuerpo a cuerpo'],
    [/Requires Ranged Weapon/gi, 'Requiere arma a distancia'],
    [/Requires Shield/gi, 'Requiere escudo'],
    [/Passive/gi, 'Pasiva'],
    [/Physical damage/gi, 'daño físico'],
    [/Fire damage/gi, 'daño de Fuego'],
    [/Frost damage/gi, 'daño de Escarcha'],
    [/Nature damage/gi, 'daño de Naturaleza'],
    [/Shadow damage/gi, 'daño de Sombras'],
    [/Holy damage/gi, 'daño Sagrado'],
    [/Arcane damage/gi, 'daño Arcano'],
    [/Weapon Damage/gi, 'daño de arma'],
    [/deals (\d+) to (\d+)/gi, 'inflige de $1 a $2'],
    [/deals (\d+)% damage/gi, 'inflige un $1% de daño'],
    [/deals (\d+)/gi, 'inflige $1 p.'],
    [/heals the target for (\d+) to (\d+)/gi, 'sana al objetivo de $1 a $2 p.'],
    [/heals for (\d+)/gi, 'sana por $1 p.'],
    [/for (\d+)\s*sec/gi, 'durante $1 s'],
    [/every (\d+)\s*sec/gi, 'cada $1 s'],
    [/cooldown/gi, 'tiempo de reutilización'],
    [/Instant/gi, 'Instantáneo']
  ];

  for (const [pattern, rep] of dict) {
    es = es.replace(pattern, rep);
  }

  return es;
}

console.log('Test parsing...');
const sampleHtml = '<table><tr><td><table width="100%"><tr><td><b>Barbaric Whirl</b></td><th><b class="q0">Rank 1</b></th></tr></table>30 Energy<br /><table width="100%"><tr><td>Instant</td><th>6&nbsp;sec cooldown</th></tr></table></td></tr></table><table><tr><td>Requires Melee Weapon<br /><span class="q">Whirl in a barbaric fury, striking up to 5 nearby enemies with both weapons, dealing 135% Weapon Damage plus 3.</span></td></tr></table>';
const parsed = parseTooltipHtml(sampleHtml);
console.log('Parsed:', parsed);
console.log('ES Translation:', translateWoWDescription(parsed.descriptionEn));
