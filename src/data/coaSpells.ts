// Auto-generated CoA Spells database with Tooltips from Ascension Database (7.12 to 7.32)
import coaData from './coaSpellsData.json';

export interface CoaSpellItem {
  id: number;
  name: string;
  rank?: string;
  icon?: string;
  level?: number;
  school?: number;
  cat?: number;
  className?: string;
  classNum?: number;
  cost?: string;
  castTime?: string;
  cooldown?: string;
  range?: string;
  descriptionEn?: string;
  descriptionEs?: string;
}

export interface CoaClassSpellGroup {
  classNum: number;
  className: string;
  spellCount: number;
}

export interface CoaGroupedSpell {
  name: string;
  className: string;
  classNum?: number;
  icon?: string;
  ranks: string[];
  maxLevel: number;
  cost?: string;
  castTime?: string;
  cooldown?: string;
  range?: string;
  descriptionEn?: string;
  descriptionEs?: string;
}

export const COA_CLASSES_LIST: CoaClassSpellGroup[] = coaData.classes;

export const COA_UNIQUE_SPELL_NAMES: string[] = coaData.uniqueSpellNames;

export const COA_SPELLS_BY_CLASS: Record<string, CoaSpellItem[]> = coaData.spellsByClass as any;

// Fast lookup Set for Macro syntax highlighting
const COA_SPELL_SET = new Set(COA_UNIQUE_SPELL_NAMES.map(s => s.toLowerCase()));

/**
 * Check if a spell name is a recognized Ascension CoA spell (handles base name or name with (Rank X))
 */
export function isCoaSpell(spellName: string): boolean {
  if (!spellName) return false;
  const clean = spellName.replace(/\s*\(Rank\s*\d+\)/i, '').trim().toLowerCase();
  return COA_SPELL_SET.has(clean);
}

/**
 * Get icon URL for a WoW / Ascension spell icon
 */
export function getSpellIconUrl(icon?: string): string {
  if (!icon || icon === 'inv_misc_questionmark') {
    return 'https://db.ascension.gg/static/images/wow/icons/medium/inv_misc_questionmark.jpg';
  }
  return `https://db.ascension.gg/static/images/wow/icons/medium/${icon.toLowerCase()}.jpg`;
}

/**
 * Get grouped spells (unique by base name, with list of ranks and tooltips)
 */
export function getGroupedCoaSpells(classNameFilter?: string): CoaGroupedSpell[] {
  const map = new Map<string, CoaGroupedSpell>();

  const processSpells = (spells: CoaSpellItem[], clsName: string) => {
    for (const sp of spells) {
      const key = `${clsName}:::${sp.name}`;
      let item = map.get(key);
      if (!item) {
        item = {
          name: sp.name,
          className: clsName,
          classNum: sp.classNum,
          icon: sp.icon,
          ranks: [],
          maxLevel: sp.level || 0,
          cost: sp.cost,
          castTime: sp.castTime,
          cooldown: sp.cooldown,
          range: sp.range,
          descriptionEn: sp.descriptionEn,
          descriptionEs: sp.descriptionEs
        };
        map.set(key, item);
      }

      if (sp.rank && sp.rank.trim() && !item.ranks.includes(sp.rank.trim())) {
        item.ranks.push(sp.rank.trim());
      }
      if ((sp.level || 0) > item.maxLevel) {
        item.maxLevel = sp.level || 0;
      }
      if (!item.icon && sp.icon) item.icon = sp.icon;
      if (!item.descriptionEn && sp.descriptionEn) {
        item.descriptionEn = sp.descriptionEn;
        item.descriptionEs = sp.descriptionEs;
        item.cost = sp.cost;
        item.castTime = sp.castTime;
        item.cooldown = sp.cooldown;
        item.range = sp.range;
      }
    }
  };

  if (!classNameFilter || classNameFilter === 'all') {
    for (const [clsName, spells] of Object.entries(COA_SPELLS_BY_CLASS)) {
      processSpells(spells, clsName);
    }
  } else {
    const classSpells = COA_SPELLS_BY_CLASS[classNameFilter] || [];
    processSpells(classSpells, classNameFilter);
  }

  // Sort ranks naturally (Rank 1, Rank 2, Rank 10)
  for (const item of map.values()) {
    item.ranks.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }

  return Array.from(map.values());
}

/**
 * Search CoA spells by query for autocomplete suggestions
 */
export function searchCoaSpells(query: string, limit = 10): { name: string; className?: string; icon?: string; ranks: string[]; descriptionEs?: string }[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();
  const allGrouped = getGroupedCoaSpells('all');
  const results: { name: string; className?: string; icon?: string; ranks: string[]; descriptionEs?: string }[] = [];

  for (const sp of allGrouped) {
    if (sp.name.toLowerCase().includes(q)) {
      results.push({
        name: sp.name,
        className: sp.className,
        icon: sp.icon,
        ranks: sp.ranks,
        descriptionEs: sp.descriptionEs
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}
