// Auto-generated CoA Spells database from Ascension Database (7.12 to 7.32)
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
}

export interface CoaClassSpellGroup {
  classNum: number;
  className: string;
  spellCount: number;
}

export const COA_CLASSES_LIST: CoaClassSpellGroup[] = coaData.classes;

export const COA_UNIQUE_SPELL_NAMES: string[] = coaData.uniqueSpellNames;

export const COA_SPELLS_BY_CLASS: Record<string, CoaSpellItem[]> = coaData.spellsByClass as any;

// Fast lookup Set for Macro syntax highlighting
const COA_SPELL_SET = new Set(COA_UNIQUE_SPELL_NAMES.map(s => s.toLowerCase()));

/**
 * Check if a spell name is a recognized Ascension CoA spell
 */
export function isCoaSpell(spellName: string): boolean {
  if (!spellName) return false;
  return COA_SPELL_SET.has(spellName.trim().toLowerCase());
}

/**
 * Search CoA spells by query for autocomplete suggestions
 */
export function searchCoaSpells(query: string, limit = 10): { name: string; className?: string; icon?: string; rank?: string }[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();
  const results: { name: string; className?: string; icon?: string; rank?: string }[] = [];
  const seen = new Set<string>();

  for (const [className, spells] of Object.entries(COA_SPELLS_BY_CLASS)) {
    for (const sp of spells) {
      if (sp.name.toLowerCase().includes(q)) {
        const key = sp.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            name: sp.name,
            className,
            icon: sp.icon,
            rank: sp.rank
          });
          if (results.length >= limit) return results;
        }
      }
    }
  }

  return results;
}
