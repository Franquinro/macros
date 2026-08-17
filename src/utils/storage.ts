import { MacroData } from '../types/macro';
import { DEFAULT_PRESETS } from '../data/defaultPresets';

const STORAGE_KEY = 'macrowolk_saved_macros';
const ACTIVE_MACRO_KEY = 'macrowolk_active_macro';

export function getSavedMacros(): MacroData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Save default presets to initialize
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESETS));
      return DEFAULT_PRESETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_PRESETS;
  } catch (e) {
    console.error('Error loading saved macros:', e);
    return DEFAULT_PRESETS;
  }
}

export function saveMacros(macros: MacroData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(macros));
  } catch (e) {
    console.error('Error saving macros to localStorage:', e);
  }
}

export function saveMacroItem(macro: MacroData): void {
  const all = getSavedMacros();
  const index = all.findIndex(m => m.id === macro.id);
  if (index >= 0) {
    all[index] = { ...macro, updatedAt: Date.now() };
  } else {
    all.unshift({ ...macro, createdAt: Date.now(), updatedAt: Date.now() });
  }
  saveMacros(all);
}

export function deleteMacroItem(macroId: string): MacroData[] {
  const all = getSavedMacros();
  const filtered = all.filter(m => m.id !== macroId);
  saveMacros(filtered);
  return filtered;
}

export function getActiveMacro(): MacroData | null {
  try {
    const raw = localStorage.getItem(ACTIVE_MACRO_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setActiveMacro(macro: MacroData): void {
  try {
    localStorage.setItem(ACTIVE_MACRO_KEY, JSON.stringify(macro));
  } catch (e) {
    console.error('Error setting active macro:', e);
  }
}

export function exportMacrosToJSON(): string {
  const all = getSavedMacros();
  return JSON.stringify({
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    generator: 'MacroWolk - WoW 3.3.5a / Project Ascension (CoA)',
    macros: all
  }, null, 2);
}

export function importMacrosFromJSON(jsonString: string): MacroData[] {
  try {
    const data = JSON.parse(jsonString);
    if (data && Array.isArray(data.macros)) {
      const current = getSavedMacros();
      // Merge unique
      const existingIds = new Set(current.map(m => m.id));
      const newItems: MacroData[] = [];
      for (const item of data.macros) {
        if (!existingIds.has(item.id)) {
          newItems.push(item);
        } else {
          // Replace or clone with new id
          newItems.push({
            ...item,
            id: `${item.id}_imported_${Date.now()}`
          });
        }
      }
      const merged = [...newItems, ...current];
      saveMacros(merged);
      return merged;
    }
    throw new Error('Formato JSON inválido');
  } catch (e) {
    console.error('Import error:', e);
    throw e;
  }
}
