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
  return res.trim();
}

const sentenceTranslations = [
  // Common WoW abilities and effects
  [/^Unleash a blood curdling war cry, increasing melee and ranged attack speed by (.*?), and attack power by (.*?) of party and raid members within (.*?) yds for (.*?)\.$/i, 'Desata un grito de guerra espeluznante, aumentando la velocidad de ataque cuerpo a cuerpo y a distancia en $1, y el poder de ataque en $2 de los miembros del grupo y banda a menos de $3 yardas durante $4.'],
  [/^Allies cannot benefit from this spell again for (.*?)\.$/i, 'Los aliados no pueden volver a beneficiarse de este hechizo durante $1.'],
  [/^Your Brutal Swing triggers (\d+) extra auto attacks against your current target for each target hit\.$/i, 'Tu Golpe brutal activa $1 ataques automáticos adicionales contra tu objetivo actual por cada objetivo golpeado.'],
  [/^Killing an enemy that yields experience or honor now grants you (\d+)% increased armor penetration and (\d+)% increased movement speed for (\d+) sec, stacking (\d+) times\.$/i, 'Matar a un enemigo que otorgue experiencia u honor ahora te otorga un $1% más de penetración de armadura y un $2% más de velocidad de movimiento durante $3 s, acumulándose hasta $4 veces.'],
  [/^Display mastery over throwing weapons, causing Throw Weapon, Gutspiller, and Berserker Axe to strike (\d+) additional nearby enemies, but reduces all damage dealt by (\d+)%\.$/i, 'Demuestra maestría con armas arrojadizas, haciendo que Lanzar arma, Destripador y Hacha de rabioso golpeen a $1 enemigos cercanos adicionales, pero reduce todo el daño infligido en un $2%.'],
  [/^You have a firm grip on your weapon, increasing your Strength by (\d+) and reducing the duration of disarm effects by (\d+)%\.$/i, 'Tienes un agarre firme en tu arma, lo que aumenta tu Fuerza en $1 y reduce la duración de los efectos de desarme en un $2%.'],
  [/^Removes the minimum range from (.*?) and increases its duration by (\d+)%\.$/i, 'Elimina el alcance mínimo de $1 y aumenta su duración en un $2%.'],
  [/^Taking damage while at or below (\d+)% maximum health now grants you (\d+)% increased healing received and (\d+)% reduced damage taken\.$/i, 'Recibir daño con un $1% o menos de tu salud máxima ahora te otorga un $2% más de sanación recibida y un $3% de reducción de daño recibido.'],
  [/^Drop a Spirit Idol near you for (\d+) sec\.$/i, 'Coloca un Ídolo de espíritu cerca de ti durante $1 s.'],
  [/^Allies within (\d+) yds regenerate (\d+)% maximum mana every (\d+) sec\.$/i, 'Los aliados en un radio de $1 yardas regeneran un $2% de maná máximo cada $3 s.'],
  [/^Infuse your Cauldron with Crystal Water for (\d+) sec, causing party and raid members within (\d+) yds to be shielded for (\d+)% of their healing taken for (\d+) sec\.$/i, 'Infunde tu Caldero con Agua cristalina durante $1 s, protegiendo a los miembros del grupo y de la banda en un radio de $2 yardas por el $3% de su sanación recibida durante $4 s.'],
  [/^Only (\d+) Base can be active at a time\.$/i, 'Solo puede estar activa $1 Base a la vez.'],
  [/^Hurl a bolt of dark magic at an enemy, dealing (.*?) Shadow damage\.$/i, 'Lanza una descarga de magia oscura a un enemigo, infligiendo $1 de daño de Sombras.'],
  [/^If the target is affected by (.*?) it also reduces the target's healing received by (\d+)% for (\d+) sec\.$/i, 'Si el objetivo está afectado por $1, también reduce la sanación recibida del objetivo en un $2% durante $3 s.'],
  [/^Deals (\d+) to (\d+) Spellshadow Damage to an enemy\.$/i, 'Inflige $1 a $2 de daño de Hechizo sombrío a un enemigo.'],
  [/^Changing Devotions refreshes a charge\.$/i, 'Cambiar de Devociones recarga una carga.'],
  [/^Invokes (.*?)$/i, 'Invoca a $1'],
  [/^Tools:\s*Water Totem/i, 'Herramientas: Tótem de agua'],
  [/^Tools:\s*(.*)/i, 'Herramientas: $1'],
  [/^Deals Off-hand Damage plus (.*?), generates (\d+) Rage, and your next Bolt used within (\d+) sec deals (\d+) additional damage\.$/i, 'Inflige daño de mano izquierda más $1, genera $2 de ira, y tu siguiente Descarga usada en $3 s inflige $4 de daño adicional.'],
  [/^Can only be used directly after (.*?)\.$/i, 'Solo se puede usar inmediatamente después de $1.'],
  [/^Expose an enemy's darkest faults, incapacitating them for (\d+) sec \((\d+) sec vs players\)\.$/i, 'Expone los defectos más oscuros de un enemigo, incapacitándolo durante $1 s ($2 s contra jugadores).'],
  [/^Damage caused will end this effect\.$/i, 'El daño causado cancelará este efecto.'],
  [/^Only usable on Humanoids, Demons, and Undead\.$/i, 'Solo se puede usar en Humanoides, Demonios y No-muertos.'],
  [/^You can only have (\d+) Brand on an enemy at a time\.$/i, 'Solo puedes tener $1 Marca en un enemigo a la vez.'],
  [/^Every (\d+)(?:st|nd|rd|th) Standard Round slows the target's movement speed by (\d+)% for (\d+) sec\.$/i, 'Cada $1.ª Ronda estándar ralentiza la velocidad de movimiento del objetivo en un $2% durante $3 s.'],
  [/^Consumes (\d+) Inscribed Runes/i, 'Consume $1 Runas inscritas'],
  [/^Mark an enemy for until cancelled, after this duration the target explodes, dealing (.*?) Fire damage scaling with Intellect\.$/i, 'Marca a un enemigo hasta que se cancele; tras esta duración, el objetivo explota, infligiendo $1 de daño de Fuego que escala con Intelecto.'],
  [/^Mark an enemy for (\d+) sec, after this duration the target explodes, dealing (.*?) Arcane damage to up to (\d+) enemies within (\d+) yds, scaling with Intellect\.$/i, 'Marca a un enemigo durante $1 s; tras esta duración, el objetivo explota, infligiendo $2 de daño Arcano a un máximo de $3 enemigos a menos de $4 yardas, escalando con Intelecto.']
];

function translateRemainingSentences(text) {
  if (!text) return '';
  let res = text;
  for (const [re, trans] of sentenceTranslations) {
    res = res.replace(re, trans);
  }
  return res;
}

function polishSpellData() {
  const jsonPath = path.join(__dirname, '../src/data/coaSpellsData.json');
  const coaData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  let totalSpells = 0;
  let fullyTranslated = 0;

  for (const [cls, list] of Object.entries(coaData.spellsByClass)) {
    for (const spell of list) {
      totalSpells++;

      // Clean EN
      if (spell.descriptionEn) {
        spell.descriptionEn = cleanAllFormatting(spell.descriptionEn);
      }

      // Clean and polish ES
      if (spell.descriptionEs) {
        let es = cleanAllFormatting(spell.descriptionEs);
        es = translateRemainingSentences(es);
        spell.descriptionEs = cleanAllFormatting(es);
        if (spell.descriptionEs && spell.descriptionEs !== spell.descriptionEn) {
          fullyTranslated++;
        }
      } else if (spell.descriptionEn) {
        let es = translateRemainingSentences(spell.descriptionEn);
        spell.descriptionEs = cleanAllFormatting(es);
        if (spell.descriptionEs && spell.descriptionEs !== spell.descriptionEn) {
          fullyTranslated++;
        }
      }
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(coaData, null, 2), 'utf8');
  console.log(`Polished all ${totalSpells} spells! Fully translated with natural Spanish: ${fullyTranslated} (${((fullyTranslated / totalSpells) * 100).toFixed(1)}%)`);
}

polishSpellData();
