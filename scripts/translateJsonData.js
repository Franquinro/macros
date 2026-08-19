import fs from 'fs';

function translateSpell(en) {
  if (!en) return '';
  let s = en.trim();

  // 1. Clean math conditions: COND(GT(A, B), X, Y) -> (X / Y)
  s = s.replace(/COND\(GT\((\w+),\s*(\w+)\),\s*([^,]+),\s*([^)]+)\)/g, '($3 / $4)');

  // 2. Full sentence templates & specialized Ascension mechanics
  const fullTemplates = [
    [/Wreathe yourself in fire for up to (\d+)\s*(?:min|minute), dealing (.*?) Fire Damage to nearby enemies every (\d+)\s*sec\.?/gi,
      'Te envuelve en fuego durante hasta $1 min, infligiendo $2 de daño de Fuego a los enemigos cercanos cada $3 s.'],
    [/Wreathe yourself in (.*?) for up to (\d+)\s*(?:min|minute), dealing (.*?) to nearby enemies every (\d+)\s*sec\.?/gi,
      'Te envuelve en $1 durante hasta $2 min, infligiendo $3 a los enemigos cercanos cada $4 s.'],
    [/Removes the cooldown of (.*?)\.?/gi,
      'Elimina el tiempo de reutilización de $1.'],
    [/Teaches you (Build:.*?)\.?\s*(Build:.*?),\s*the latest in regenerative technology,\s*to aid you in healing allies until dismissed\.?/gi,
      'Te enseña $1. $2, lo último en tecnología regenerativa, para ayudarte a sanar aliados hasta ser despedido.'],
    [/Teaches you (.*?)\.?/gi,
      'Te enseña $1.'],
    [/Teaches (Build:.*?)\s*and reduces the cooldown of (.*?)\s*by\s*(\d+(?:\.\d+)?)\s*sec\.?/gi,
      'Te enseña $1 y reduce el tiempo de reutilización de $2 en $3 s.'],
    [/Teaches (.*?)\s*and reduces the cooldown of (.*?)\s*by\s*(\d+(?:\.\d+)?)\s*sec\.?/gi,
      'Te enseña $1 y reduce el tiempo de reutilización de $2 en $3 s.'],
    [/Throw a bomb that sticks to the enemy for (\d+)\s*sec\.\s*At the end of the duration the bomb will explode,\s*dealing (.*?) to the target and (\d+) enemies within (\d+)\s*yds of the target\.\s*Can target corpses\.?/gi,
      'Lanza una bomba que se adhiere al enemigo durante $1 s. Al finalizar la duración la bomba explotará, infligiendo $2 al objetivo y a $3 enemigos a menos de $4 m del objetivo. Puede lanzarse sobre cadáveres.'],
    [/Fire a powerful rocket at an enemy that deals (.*?)\.?/gi,
      'Dispara un potente cohete a un enemigo que inflige $1.'],
    [/Launch (\d+) Deathballs in a line,\s*increasing in speed the further they travel\.\s*They explode when they come into contact with an enemy,\s*dealing (.*?) to nearby enemies,\s*increased based on distance traveled\.\s*Build abilities reduce the cooldown of this ability by (\d+)\s*sec\.?/gi,
      'Lanza $1 Bolas de la Muerte en línea recta, aumentando su velocidad a mayor distancia. Explotan al entrar en contacto con un enemigo infligiendo $2 a los enemigos cercanos, aumentado según la distancia recorrida. Las habilidades de Ensamblaje reducen el tiempo de reutilización de esta habilidad en $3 s.'],
    [/Reduces the cast time of (.*?) by (\d+)% and removes your spell pushback suffered from taking damage\.?/gi,
      'Reduce el tiempo de lanzamiento de $1 un $2% y elimina el retroceso de lanzamiento al recibir daño.'],
    [/Reduces the cast time of (.*?) by (\d+)%\.?/gi,
      'Reduce el tiempo de lanzamiento de $1 un $2%.'],
    [/Increases your movement speed by (\d+)% for (\d+)\s*sec\.?/gi,
      'Aumenta tu velocidad de movimiento un $1% durante $2 s.'],
    [/Increases your maximum (Energy|Mana|Health|Rage) by (\d+)%\.?/gi,
      'Aumenta tu $1 máxima un $2%.'],
    [/Increases your (critical strike chance|haste|attack power|spell power) by (\d+)%\.?/gi,
      'Aumenta tu $1 un $2%.'],
    [/Reduces the cooldown of (.*?) by (\d+(?:\.\d+)?)\s*sec\.?/gi,
      'Reduce el tiempo de reutilización de $1 en $2 s.'],
    [/Your next attack within the duration will consume the effect to impale your target,\s*causing them to Bleed for (.*?) every (\d+)\s*sec for (\d+)\s*sec\.?/gi,
      'Tu siguiente ataque dentro de la duración consumirá el efecto para empalar al objetivo, haciéndolo sangrar por $1 cada $2 s durante $3 s.'],
    [/Your next attack causes you to swing violently at an enemy and up to (\d+) nearby enemies,\s*dealing (.*?)\.?/gi,
      'Tu siguiente ataque te hace golpear violentamente a un enemigo y hasta $1 enemigos cercanos, infligiendo $2.'],
    [/Whirl in a barbaric fury,\s*striking up to (\d+) nearby enemies with both weapons,\s*dealing (.*?)\.?/gi,
      'Gira con furia bárbara, golpeando hasta a $1 enemigos cercanos con ambas armas, infligiendo $2.'],
    [/Summons a field of crackling energy at a random target's location\.\s*This field deals (.*?) to all enemies within (\d+)\s*yards of that location\.?/gi,
      'Invoca un campo de energía crepitante en la ubicación de un objetivo. Inflige $1 a todos los enemigos a menos de $2 m.'],
    [/You remember how to craft poisons,\s*but lack the ability\.?/gi,
      'Recuerdas cómo elaborar venenos, pero careces de la habilidad necesaria.'],
    [/Grants (.*?) and the ability to manipulate a (.*?)\./gi,
      'Otorga $1 y la habilidad de manipular un $2.'],
    [/You have a magical (.*?) that fills up over time,\s*granting you (\d+) stack of (.*?) every (\d+)\s*sec\.?/gi,
      'Tienes un $1 mágico que se llena con el tiempo, otorgándote $2 acumulación de $3 cada $4 s.'],
    [/Some of your other abilities empty your (.*?) to trigger with a reduced cooldown\.?/gi,
      'Algunas de tus otras habilidades vacían tu $1 para activarse con un tiempo de reutilización reducido.']
  ];

  for (const [pat, rep] of fullTemplates) {
    if (pat.test(s)) {
      s = s.replace(pat, rep);
      return s.trim();
    }
  }

  // 3. Clause & Vocabulary replacements for any other abilities
  const replacements = [
    // Verbs and actions
    [/^Wreathe yourself in fire/gi, 'Te envuelve en fuego'],
    [/^Wreathe yourself in/gi, 'Te envuelve en'],
    [/^Surrounds the caster with/gi, 'Rodea al lanzador con'],
    [/^Surrounds the target with/gi, 'Rodea al objetivo con'],
    [/^Surround yourself with/gi, 'Te rodeas de'],
    [/^Strikes the enemy with/gi, 'Golpea al enemigo con'],
    [/^Strikes the target for/gi, 'Golpea al objetivo por'],
    [/^Strikes the target/gi, 'Golpea al objetivo'],
    [/^Strikes an enemy/gi, 'Golpea a un enemigo'],
    [/^Strikes up to (\d+) nearby enemies/gi, 'Golpea hasta a $1 enemigos cercanos'],
    [/^Instantly strikes the enemy/gi, 'Golpea instantáneamente al enemigo'],
    [/^Instantly attacks the enemy/gi, 'Ataca instantáneamente al enemigo'],
    [/^Instantly heals/gi, 'Sana instantáneamente'],
    [/^Instantly deals/gi, 'Inflige instantáneamente'],
    [/^Attacks the enemy/gi, 'Ataca al enemigo'],
    [/^Shoots an arrow at/gi, 'Dispara una flecha a'],
    [/^Fires a missile at/gi, 'Dispara un proyectil a'],
    [/^Fires a blast of/gi, 'Dispara una ráfaga de'],
    [/^Fires an arrow/gi, 'Dispara una flecha'],
    [/^Fires a shot/gi, 'Dispara un tiro'],
    [/^Blasts an enemy for/gi, 'Dispara a un enemigo por'],
    [/^Blasts the target/gi, 'Dispara al objetivo'],
    [/^Burns the enemy for/gi, 'Quema al enemigo por'],
    [/^Curses the target/gi, 'Maldice al objetivo'],
    [/^Empowers your next/gi, 'Potencia tu siguiente'],
    [/^Empowers your weapon/gi, 'Potencia tu arma'],
    [/^Empowers you with/gi, 'Te potencia con'],
    [/^Infuses your weapon with/gi, 'Imbuye tu arma con'],
    [/^Infuses you with/gi, 'Te imbuye con'],
    [/^Increases attack power by/gi, 'Aumenta el poder de ataque en'],
    [/^Increases spell power by/gi, 'Aumenta el poder con hechizos en'],
    [/^Increases movement speed by/gi, 'Aumenta la velocidad de movimiento un'],
    [/^Increases damage by/gi, 'Aumenta el daño un'],
    [/^Increases damage done by/gi, 'Aumenta el daño infligido un'],
    [/^Increases healing done by/gi, 'Aumenta la sanación realizada un'],
    [/^Increases the damage of/gi, 'Aumenta el daño de'],
    [/^Reduces damage taken by/gi, 'Reduce el daño recibido un'],
    [/^Reduces the cooldown of/gi, 'Reduce el tiempo de reutilización de'],
    [/^Reduces the mana cost of/gi, 'Reduce el coste de maná de'],
    [/^Reduces the cast time of/gi, 'Reduce el tiempo de lanzamiento de'],
    [/^Causes your next attack to/gi, 'Hace que tu siguiente ataque'],
    [/^Causes the target to/gi, 'Hace que el objetivo'],
    [/^Causes your (.*?) to/gi, 'Hace que tu $1'],
    [/^Heals the friendly target for/gi, 'Sana al objetivo amistoso por'],
    [/^Heals the target for/gi, 'Sana al objetivo por'],
    [/^Heals an ally for/gi, 'Sana a un aliado por'],
    [/^Heals all party members for/gi, 'Sana a todos los miembros del grupo por'],
    [/^Heals nearby allies for/gi, 'Sana a los aliados cercanos por'],
    [/^Heals you for/gi, 'Te sana por'],
    [/^Restores (\d+)% (Mana|Health|Energy|Rage)/gi, 'Restaura un $1% de $2'],
    [/^Restores (\d+) (Mana|Health|Energy|Rage)/gi, 'Restaura $1 p. de $2'],
    [/^Summons a/gi, 'Invoca un'],
    [/^Summons an/gi, 'Invoca un'],
    [/^Places a/gi, 'Coloca un'],
    [/^Throws a/gi, 'Lanza un'],
    [/^Launches a/gi, 'Lanza un'],

    // Requirements
    [/Requires Melee Weapon/gi, 'Requiere arma cuerpo a cuerpo'],
    [/Requires Ranged Weapon/gi, 'Requiere arma a distancia'],
    [/Requires Shield/gi, 'Requiere escudo'],
    [/Requires Two-Handed/gi, 'Requiere arma de dos manos'],
    [/Requires One-Handed/gi, 'Requiere arma de una mano'],
    [/Requires Dagger/gi, 'Requiere daga'],
    [/Requires Bow, Crossbow or Gun/gi, 'Requiere arco, ballesta o arma de fuego'],

    // In-sentence mechanics
    [/dealing (.*?) Fire Damage/gi, 'infligiendo $1 de daño de Fuego'],
    [/dealing (.*?) Frost Damage/gi, 'infligiendo $1 de daño de Escarcha'],
    [/dealing (.*?) Nature Damage/gi, 'infligiendo $1 de daño de Naturaleza'],
    [/dealing (.*?) Shadow Damage/gi, 'infligiendo $1 de daño de Sombras'],
    [/dealing (.*?) Holy Damage/gi, 'infligiendo $1 de daño Sagrado'],
    [/dealing (.*?) Arcane Damage/gi, 'infligiendo $1 de daño Arcano'],
    [/dealing (.*?) Physical Damage/gi, 'infligiendo $1 de daño físico'],
    [/dealing (.*?) Twilight Damage/gi, 'infligiendo $1 de daño Crepuscular'],
    [/dealing (.*?) Weapon Damage/gi, 'infligiendo $1 de daño de arma'],
    [/dealing (.*?) damage/gi, 'infligiendo $1 de daño'],
    [/deals (.*?) Fire damage/gi, 'inflige $1 de daño de Fuego'],
    [/deals (.*?) Frost damage/gi, 'inflige $1 de daño de Escarcha'],
    [/deals (.*?) Nature damage/gi, 'inflige $1 de daño de Naturaleza'],
    [/deals (.*?) Shadow damage/gi, 'inflige $1 de daño de Sombras'],
    [/deals (.*?) Holy damage/gi, 'inflige $1 de daño Sagrado'],
    [/deals (.*?) Arcane damage/gi, 'inflige $1 de daño Arcano'],
    [/deals (.*?) Physical damage/gi, 'inflige $1 de daño físico'],
    [/deals (.*?) Twilight damage/gi, 'inflige $1 de daño Crepuscular'],
    [/deals (.*?) Weapon damage/gi, 'inflige $1 de daño de arma'],
    [/deals (.*?) damage/gi, 'inflige $1 de daño'],
    
    [/Fire Damage/gi, 'daño de Fuego'],
    [/Fire damage/gi, 'daño de Fuego'],
    [/Frost Damage/gi, 'daño de Escarcha'],
    [/Frost damage/gi, 'daño de Escarcha'],
    [/Nature Damage/gi, 'daño de Naturaleza'],
    [/Nature damage/gi, 'daño de Naturaleza'],
    [/Shadow Damage/gi, 'daño de Sombras'],
    [/Shadow damage/gi, 'daño de Sombras'],
    [/Holy Damage/gi, 'daño Sagrado'],
    [/Holy damage/gi, 'daño Sagrado'],
    [/Arcane Damage/gi, 'daño Arcano'],
    [/Arcane damage/gi, 'daño Arcano'],
    [/Physical Damage/gi, 'daño físico'],
    [/Physical damage/gi, 'daño físico'],
    [/Twilight Damage/gi, 'daño Crepuscular'],
    [/Twilight damage/gi, 'daño Crepuscular'],
    [/Weapon Damage/gi, 'daño de arma'],
    [/Weapon damage/gi, 'daño de arma'],

    // Targets & scopes
    [/to nearby enemies/gi, 'a los enemigos cercanos'],
    [/to all nearby enemies/gi, 'a todos los enemigos cercanos'],
    [/to all enemies/gi, 'a todos los enemigos'],
    [/to the target and (\d+) nearby enemies/gi, 'al objetivo y a $1 enemigos cercanos'],
    [/to the target and (\d+) enemies/gi, 'al objetivo y a $1 enemigos'],
    [/to the target/gi, 'al objetivo'],
    [/to an enemy/gi, 'a un enemigo'],
    [/at an enemy/gi, 'a un enemigo'],
    [/to your target/gi, 'a tu objetivo'],
    [/to allies/gi, 'a los aliados'],
    [/to nearby allies/gi, 'a los aliados cercanos'],
    [/to the caster/gi, 'al lanzador'],

    // Durations & distances
    [/for up to (\d+)\s*(?:min|minute)/gi, 'durante hasta $1 min'],
    [/for up to (\d+)\s*sec/gi, 'durante hasta $1 s'],
    [/for (\d+)\s*sec/gi, 'durante $1 s'],
    [/for (\d+)\s*(?:min|minute)/gi, 'durante $1 min'],
    [/for (\d+)\s*s/gi, 'durante $1 s'],
    [/over (\d+)\s*sec/gi, 'durante $1 s'],
    [/over (\d+)\s*s/gi, 'durante $1 s'],
    [/every (\d+)\s*sec/gi, 'cada $1 s'],
    [/every (\d+)\s*s/gi, 'cada $1 s'],
    [/within (\d+)\s*yds of the target/gi, 'a menos de $1 m del objetivo'],
    [/within (\d+)\s*yds/gi, 'a menos de $1 m'],
    [/within (\d+)\s*yards/gi, 'a menos de $1 m'],
    [/up to (\d+) enemies/gi, 'hasta a $1 enemigos'],
    [/up to (\d+) nearby enemies/gi, 'hasta a $1 enemigos cercanos'],
    [/up to (\d+) targets/gi, 'hasta a $1 objetivos'],
    [/up to (\d+) allies/gi, 'hasta a $1 aliados'],

    // Stats & Modifiers
    [/increased by (\d+)%/gi, 'aumentado un $1%'],
    [/reduced by (\d+)%/gi, 'reducido un $1%'],
    [/increased based on distance traveled/gi, 'aumentado según la distancia recorrida'],
    [/Points Per Level/gi, 'p. por nivel'],
    [/cooldown/gi, 'tiempo de reutilización'],
    [/Can target corpses\.?/gi, 'Puede lanzarse sobre cadáveres.'],
    [/Passive/gi, 'Pasiva'],
    [/Spec Passive/gi, 'Pasiva de Especialización'],
    [/plus/gi, 'más'],
    [/and/gi, 'y']
  ];

  for (const [pat, rep] of replacements) {
    s = s.replace(pat, rep);
  }

  // Cleanup spaces and punctuation
  s = s.replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();
  return s;
}

// Translate all spells in coaSpellsData.json
const raw = fs.readFileSync('src/data/coaSpellsData.json', 'utf-8');
const data = JSON.parse(raw);

let count = 0;
for (const [clsName, spells] of Object.entries(data.spellsByClass)) {
  for (const sp of spells) {
    if (sp.descriptionEn) {
      sp.descriptionEs = translateSpell(sp.descriptionEn);
      count++;
    }
  }
}

fs.writeFileSync('src/data/coaSpellsData.json', JSON.stringify(data, null, 2), 'utf-8');
console.log(`Updated ${count} spell descriptions in src/data/coaSpellsData.json!`);

// Print sample Immolation Aura
const warlockSpells = data.spellsByClass['Knight of Xoroth'] || data.spellsByClass['Pyromancer'] || [];
const imm = warlockSpells.find(s => s.name === 'Immolation Aura');
console.log('Sample Immolation Aura:');
console.log(imm);
