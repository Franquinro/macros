export type CommandCategory = 
  | 'spell'
  | 'equipment'
  | 'targeting'
  | 'pet'
  | 'utility'
  | 'chat'
  | 'ascension';

export type TargetSelector = 
  | '@target'
  | '@mouseover'
  | '@focus'
  | '@player'
  | '@pet'
  | '@cursor'
  | '@targettarget'
  | '@focustarget'
  | '@none';

export interface ConditionRule {
  id: string;
  type: string; // 'mod' | 'combat' | 'harm' | 'help' | 'dead' | 'stealth' | 'form' | 'stance' | 'btn' | 'equipped' | 'channeling' | 'flyable' | 'mounted' | 'custom'
  value?: string; // e.g. 'shift', 'ctrl', 'alt', '1', 'Shields', etc.
  isNegated?: boolean; // e.g. 'nocombat', 'nodead', 'nostealth', 'nomod', etc.
}

export interface ConditionBracket {
  id: string;
  target?: TargetSelector;
  rules: ConditionRule[];
}

export interface MacroBlock {
  id: string;
  command: string; // e.g., '#showtooltip', '/cast', '/castsequence', '/use', '/cancelaura', etc.
  brackets: ConditionBracket[];
  argument: string; // e.g. 'Flash of Light', '13', 'reset=combat/target/6 Rend, Overpower', etc.
  comment?: string;
  enabled: boolean;
  extraOptions?: Record<string, any>;
}

export interface MacroData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'general' | 'pvp' | 'pve' | 'qol' | 'ascension_coa';
  coaArchetype?: string;
  blocks: MacroBlock[];
  createdAt: number;
  updatedAt: number;
}

export interface MacroValidation {
  charCount: number;
  isOverLimit: boolean;
  warnings: string[];
  tips: string[];
  cleanCode: string;
  formattedCode: string;
  splitMacros?: string[];
}

export interface SimulationState {
  hasTarget: boolean;
  targetIsHarm: boolean;
  targetIsDead: boolean;
  hasMouseover: boolean;
  mouseoverIsHarm: boolean;
  mouseoverIsDead: boolean;
  hasFocus: boolean;
  focusIsHarm: boolean;
  inCombat: boolean;
  inStealth: boolean;
  isMounted: boolean;
  isFlyable: boolean;
  modShift: boolean;
  modCtrl: boolean;
  modAlt: boolean;
  currentForm: number; // 0 = caster, 1 = bear/cat/stance 1, 2 = stance 2, etc.
  buttonClick: number; // 1 = left, 2 = right, etc.
}
