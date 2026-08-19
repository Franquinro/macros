import fs from 'fs';

function translateWoWDescription(text) {
  if (!text) return '';
  let es = text.trim();

  // Rule 0: Clean conditional math expressions cleanly if present
  es = es.replace(/COND\(GT\((\w+),\s*(\w+)\),\s*([^,]+),\s*([^)]+)\)/g, '($3 / $4)');

  // Sentence-level full patterns
  const fullSentences = [
    // Tinker
    [/Removes the cooldown of (.*?)(?:\.|$)/gi, 'Elimina el tiempo de reutilización de $1.'],
    [/Teaches you (Build:.*?)\.?\s*(Build:.*?),\s*the latest in regenerative technology,\s*to aid you in healing allies until dismissed(?:\.|$)/gi, 'Te enseña $1. $2, lo último en tecnología regenerativa, para ayudarte a sanar aliados hasta ser despedido.'],
    [/Teaches you (.*?)(?:\.|$)/gi, 'Te enseña $1.'],
    [/Teaches (Build:.*?)\s*and reduces the cooldown of (.*?)\s*by\s*(\d+(?:\.\d+)?)\s*sec(?:\.|$)/gi, 'Te enseña $1 y reduce el tiempo de reutilización de $2 en $3 s.'],
    [/Teaches (.*?)\s*and reduces the cooldown of (.*?)\s*by\s*(\d+(?:\.\d+)?)\s*sec(?:\.|$)/gi, 'Te enseña $1 y reduce el tiempo de reutilización de $2 en $3 s.'],
    [/Throw a bomb that sticks to the enemy for (\d+)\s*sec\.\s*At the end of the duration the bomb will explode,\s*dealing (.*?) to the target and (\d+) enemies within (\d+)\s*yds of the target\.\s*Can target corpses(?:\.|$)/gi, 'Lanza una bomba que se adhiere al enemigo durante $1 s. Al finalizar la duración la bomba explotará, infligiendo $2 al objetivo y a $3 enemigos a menos de $4 m del objetivo. Puede lanzarse sobre cadáveres.'],
    [/Fire a powerful rocket at an enemy that deals (.*?)(?:\.|$)/gi, 'Dispara un potente cohete a un enemigo que inflige $1.'],
    [/Launch (\d+) Deathballs in a line,\s*increasing in speed the further they travel\.\s*They explode when they come into contact with an enemy,\s*dealing (.*?) to nearby enemies,\s*increased based on distance traveled\.\s*Build abilities reduce the cooldown of this ability by (\d+)\s*sec(?:\.|$)/gi, 'Lanza $1 Bolas de la Muerte en línea recta, aumentando su velocidad a mayor distancia. Explotan al entrar en contacto con un enemigo infligiendo $2 a los enemigos cercanos, aumentado según la distancia recorrida. Las habilidades de Ensamblaje reducen el tiempo de reutilización de esta habilidad en $3 s.'],
    
    // Core combat patterns
    [/Reduces the cast time of (.*?) by (\d+)% and removes your spell pushback suffered from taking damage(?:\.|$)/gi, 'Reduce el tiempo de lanzamiento de $1 un $2% y elimina el retroceso de lanzamiento al recibir daño.'],
    [/Reduces the cast time of (.*?) by (\d+)%(?:\.|$)/gi, 'Reduce el tiempo de lanzamiento de $1 un $2%.'],
    [/Increases your movement speed by (\d+)% for (\d+)\s*sec(?:\.|$)/gi, 'Aumenta tu velocidad de movimiento un $1% durante $2 s.'],
    [/Increases your maximum (Energy|Mana|Health|Rage) by (\d+)%(?:\.|$)/gi, 'Aumenta tu $1 máxima un $2%.'],
    [/Increases your (critical strike chance|haste|attack power|spell power) by (\d+)%(?:\.|$)/gi, 'Aumenta tu $1 un $2%.'],
    [/Reduces the cooldown of (.*?) by (\d+(?:\.\d+)?)\s*sec(?:\.|$)/gi, 'Reduce el tiempo de reutilización de $1 en $2 s.'],
    [/Reduces the cooldown of (.*?) by (\d+(?:\.\d+)?)\s*s(?:\.|$)/gi, 'Reduce el tiempo de reutilización de $1 en $2 s.'],
    [/Your next attack within the duration will consume the effect to impale your target,\s*causing them to Bleed for (.*?) every (\d+)\s*sec for (\d+)\s*sec(?:\.|$)/gi, 'Tu siguiente ataque dentro de la duración consumirá el efecto para empalar al objetivo, haciéndolo sangrar por $1 cada $2 s durante $3 s.'],
    [/Your next attack causes you to swing violently at an enemy and up to (\d+) nearby enemies,\s*dealing (.*?)(?:\.|$)/gi, 'Tu siguiente ataque te hace golpear violentamente a un enemigo y hasta $1 enemigos cercanos, infligiendo $2.'],
    [/Whirl in a barbaric fury,\s*striking up to (\d+) nearby enemies with both weapons,\s*dealing (.*?)(?:\.|$)/gi, 'Gira con furia bárbara, golpeando hasta a $1 enemigos cercanos con ambas armas, infligiendo $2.'],
    [/Summons a field of crackling energy at a random target's location\.\s*This field deals (.*?) to all enemies within (\d+)\s*yards of that location(?:\.|$)/gi, 'Invoca un campo de energía crepitante en la ubicación de un objetivo. Inflige $1 a todos los enemigos a menos de $2 m.'],
    [/Grants (.*?) and the ability to manipulate a (.*?)\./gi, 'Otorga $1 y la habilidad de manipular un $2.'],
    [/You have a magical (.*?) that fills up over time,\s*granting you (\d+) stack of (.*?) every (\d+)\s*sec(?:\.|$)/gi, 'Tienes un $1 mágico que se llena con el tiempo, otorgándote $2 acumulación de $3 cada $4 s.'],
    [/Some of your other abilities empty your (.*?) to trigger with a reduced cooldown(?:\.|$)/gi, 'Algunas de tus otras habilidades vacían tu $1 para activarse con un tiempo de reutilización reducido.']
  ];

  for (const [pattern, rep] of fullSentences) {
    es = es.replace(pattern, rep);
  }

  // Phrase and vocabulary replacements
  const phrases = [
    // Requirements
    [/Requires Melee Weapon/gi, 'Requiere arma cuerpo a cuerpo'],
    [/Requires Ranged Weapon/gi, 'Requiere arma a distancia'],
    [/Requires Shield/gi, 'Requiere escudo'],
    [/Requires Two-Handed/gi, 'Requiere arma de dos manos'],
    [/Requires One-Handed/gi, 'Requiere arma de una mano'],
    
    // Mechanics
    [/striking up to (\d+) nearby enemies/gi, 'golpeando hasta a $1 enemigos cercanos'],
    [/dealing (.*?) damage/gi, 'infligiendo $1 de daño'],
    [/dealing/gi, 'infligiendo'],
    [/deals (.*?) damage/gi, 'inflige $1 de daño'],
    [/deals/gi, 'inflige'],
    [/over (\d+)\s*sec/gi, 'durante $1 s'],
    [/over (\d+)\s*s/gi, 'durante $1 s'],
    [/for (\d+)\s*sec/gi, 'durante $1 s'],
    [/for (\d+)\s*s/gi, 'durante $1 s'],
    [/every (\d+)\s*sec/gi, 'cada $1 s'],
    [/every (\d+)\s*s/gi, 'cada $1 s'],
    [/within (\d+)\s*yds of the target/gi, 'a menos de $1 m del objetivo'],
    [/within (\d+)\s*yds/gi, 'a menos de $1 m'],
    [/within (\d+)\s*yards/gi, 'a menos de $1 m'],
    [/Can target corpses\.?/gi, 'Puede seleccionarse en cadáveres.'],
    [/to nearby enemies/gi, 'a los enemigos cercanos'],
    [/to the target and (\d+) enemies/gi, 'al objetivo y a $1 enemigos'],
    [/to the target/gi, 'al objetivo'],
    [/to an enemy/gi, 'a un enemigo'],
    [/to all enemies/gi, 'a todos los enemigos'],
    [/at an enemy/gi, 'a un enemigo'],
    [/increased based on distance traveled/gi, 'aumentado según la distancia recorrida'],
    [/Points Per Level/gi, 'p. por nivel'],
    [/plus/gi, 'más'],
    [/the cooldown of/gi, 'el tiempo de reutilización de'],
    [/cooldown/gi, 'tiempo de reutilización'],
    [/Instant/gi, 'Instantáneo'],
    
    // Schools
    [/Fire damage/gi, 'daño de Fuego'],
    [/Frost damage/gi, 'daño de Escarcha'],
    [/Nature damage/gi, 'daño de Naturaleza'],
    [/Shadow damage/gi, 'daño de Sombras'],
    [/Holy damage/gi, 'daño Sagrado'],
    [/Arcane damage/gi, 'daño Arcano'],
    [/Physical damage/gi, 'daño físico'],
    [/Twilight Damage/gi, 'daño Crepuscular'],
    [/Twilight damage/gi, 'daño Crepuscular'],
    [/Weapon Damage/gi, 'daño de arma'],
    [/Weapon damage/gi, 'daño de arma'],
    
    // Clean up double translations or glitches
    [/the tiempo de reutilización of/gi, 'el tiempo de reutilización de'],
    [/the tiempo de reutilización de/gi, 'el tiempo de reutilización de'],
    [/tiempo de reutilización of/gi, 'tiempo de reutilización de'],
    [/durante (\d+) s\. At the end of the duration/gi, 'durante $1 s. Al finalizar la duración'],
    [/daño de Fuego to the target/gi, 'daño de Fuego al objetivo'],
    [/\.\s*\./g, '.']
  ];

  for (const [pattern, rep] of phrases) {
    es = es.replace(pattern, rep);
  }

  // Clean trailing spaces and double periods
  es = es.replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();
  return es;
}

// Re-translate all spells in coaSpellsData.json
const raw = fs.readFileSync('src/data/coaSpellsData.json', 'utf-8');
const data = JSON.parse(raw);

let count = 0;
for (const [clsName, spells] of Object.entries(data.spellsByClass)) {
  for (const sp of spells) {
    if (sp.descriptionEn) {
      sp.descriptionEs = translateWoWDescription(sp.descriptionEn);
      count++;
    }
  }
}

fs.writeFileSync('src/data/coaSpellsData.json', JSON.stringify(data, null, 2), 'utf-8');
console.log(`Re-translated ${count} spells cleanly!`);
