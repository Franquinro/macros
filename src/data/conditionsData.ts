import { TargetSelector } from '../types/macro';

export interface TargetDefinition {
  value: TargetSelector;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  color: string;
}

export const TARGET_SELECTORS: TargetDefinition[] = [
  {
    value: '@mouseover',
    label: '@mouseover (Cursor sobre objetivo/marco)',
    shortLabel: 'Mouseover',
    description: 'Apunta a la unidad o cuadro de banda/grupo bajo el cursor sin perder tu objetivo actual.',
    icon: 'MousePointer2',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    value: '@focus',
    label: '@focus (Objetivo de Foco)',
    shortLabel: 'Focus',
    description: 'Apunta a tu objetivo de foco configurado (ideal para cortes y CC en arenas).',
    icon: 'ScanEye',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    value: '@player',
    label: '@player (Uno mismo)',
    shortLabel: 'Player (Yo)',
    description: 'Auto-lanzamiento sobre tu propio personaje inmediatamente.',
    icon: 'User',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    value: '@target',
    label: '@target (Objetivo actual)',
    shortLabel: 'Target',
    description: 'Apunta a tu objetivo seleccionado actualmente.',
    icon: 'Crosshair',
    color: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
  },
  {
    value: '@targettarget',
    label: '@targettarget (Objetivo de mi objetivo)',
    shortLabel: 'Target of Target',
    description: 'Apunta a quien esté mirando tu objetivo (ej: curar al tanque que el boss está atacando).',
    icon: 'Split',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    value: '@cursor',
    label: '@cursor (Posición del ratón en suelo)',
    shortLabel: 'Cursor (Suelo)',
    description: 'Lanza áreas dirigidas al suelo (Blizzard, Death and Decay, Flare) al instante donde esté el ratón sin mostrar el círculo verde.',
    icon: 'LocateFixed',
    color: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
  },
  {
    value: '@pet',
    label: '@pet (Mascota)',
    shortLabel: 'Pet',
    description: 'Apunta a tu mascota activa.',
    icon: 'Dog',
    color: 'bg-lime-500/20 text-lime-300 border-lime-500/30'
  },
  {
    value: '@focustarget',
    label: '@focustarget (Objetivo de mi foco)',
    shortLabel: 'Focus Target',
    description: 'Apunta al objetivo que tiene seleccionado tu foco.',
    icon: 'ArrowUpRight',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  }
];

export interface ConditionTypeDefinition {
  type: string;
  name: string;
  category: 'modifier' | 'status' | 'relation' | 'form' | 'equipment' | 'environment';
  description: string;
  hasValue: boolean;
  valueType?: 'select' | 'text' | 'number';
  valueOptions?: { label: string; value: string }[];
  allowNegation: boolean;
  negationLabel?: string;
  defaultPositive: string;
  defaultNegative: string;
}

export const CONDITION_TYPES: ConditionTypeDefinition[] = [
  // Modifiers (Shift, Ctrl, Alt)
  {
    type: 'mod',
    name: 'Tecla Modificadora (mod)',
    category: 'modifier',
    description: 'Se activa solo si se mantiene pulsada una tecla (Shift, Ctrl, Alt).',
    hasValue: true,
    valueType: 'select',
    valueOptions: [
      { label: 'Cualquier modificador (mod)', value: '' },
      { label: 'Shift (mod:shift)', value: 'shift' },
      { label: 'Ctrl (mod:ctrl)', value: 'ctrl' },
      { label: 'Alt (mod:alt)', value: 'alt' },
      { label: 'Shift o Alt (mod:shift/alt)', value: 'shift/alt' },
      { label: 'Ctrl o Shift (mod:ctrl/shift)', value: 'ctrl/shift' }
    ],
    allowNegation: true,
    negationLabel: 'Sin modificador (nomod)',
    defaultPositive: 'mod:shift',
    defaultNegative: 'nomod'
  },
  // Relation (Harm / Help)
  {
    type: 'harm',
    name: 'Objetivo Hostil / Amistoso (harm / help)',
    category: 'relation',
    description: 'Comprueba si el objetivo es enemigo o amigo.',
    hasValue: false,
    allowNegation: true,
    negationLabel: 'Es Amistoso (help)',
    defaultPositive: 'harm',
    defaultNegative: 'help'
  },
  // Status (Nodead / Dead)
  {
    type: 'nodead',
    name: 'Estado de Vida (nodead / dead)',
    category: 'status',
    description: 'Comprueba si el objetivo está vivo o muerto.',
    hasValue: false,
    allowNegation: true,
    negationLabel: 'Está Muerto (dead)',
    defaultPositive: 'nodead',
    defaultNegative: 'dead'
  },
  // Exists / Noexists
  {
    type: 'exists',
    name: 'Existencia de Objetivo (exists / noexists)',
    category: 'status',
    description: 'Comprueba si existe la unidad especificada (muy útil con @mouseover o @focus).',
    hasValue: false,
    allowNegation: true,
    negationLabel: 'No existe (noexists)',
    defaultPositive: 'exists',
    defaultNegative: 'noexists'
  },
  // State: Combat
  {
    type: 'combat',
    name: 'En Combate (combat / nocombat)',
    category: 'status',
    description: 'Verifica si tú estás actualmente en combate.',
    hasValue: false,
    allowNegation: true,
    negationLabel: 'Fuera de Combate (nocombat)',
    defaultPositive: 'combat',
    defaultNegative: 'nocombat'
  },
  // State: Stealth
  {
    type: 'stealth',
    name: 'En Sigilo (stealth / nostealth)',
    category: 'status',
    description: 'Verifica si estás en sigilo / invisibilidad (Pícaro, Druida en acecho, etc.).',
    hasValue: false,
    allowNegation: true,
    negationLabel: 'Fuera de Sigilo (nostealth)',
    defaultPositive: 'stealth',
    defaultNegative: 'nostealth'
  },
  // Stance / Form
  {
    type: 'form',
    name: 'Forma o Postura (form / stance)',
    category: 'form',
    description: 'Evalúa la postura de Guerrero / Forma de Druida / Sombras / CoA Stances.',
    hasValue: true,
    valueType: 'select',
    valueOptions: [
      { label: 'Forma Humana / Caster (form:0)', value: '0' },
      { label: 'Postura de Batalla / Oso (form:1)', value: '1' },
      { label: 'Postura Defensiva / Acuática (form:2)', value: '2' },
      { label: 'Postura Rabiosa / Felino (form:3)', value: '3' },
      { label: 'Forma de Viaje (form:4)', value: '4' },
      { label: 'Forma Lechúcico Lunar / Voladora (form:5)', value: '5' }
    ],
    allowNegation: true,
    negationLabel: 'No en esta forma (noform:X)',
    defaultPositive: 'form:1',
    defaultNegative: 'noform:1'
  },
  // Equipment check
  {
    type: 'equipped',
    name: 'Objeto / Tipo Equipado (equipped:X)',
    category: 'equipment',
    description: 'Condición activa según lo que lleves equipado (Escudo, Dagas, Dos Manos, etc.).',
    hasValue: true,
    valueType: 'select',
    valueOptions: [
      { label: 'Escudo (equipped:Shields)', value: 'Shields' },
      { label: 'Arma de Dos Manos (equipped:Two-Hand)', value: 'Two-Hand' },
      { label: 'Dagas (equipped:Daggers)', value: 'Daggers' },
      { label: 'Armas de Una Mano (equipped:One-Hand)', value: 'One-Hand' },
      { label: 'Varita / Rango (equipped:Wands)', value: 'Wands' }
    ],
    allowNegation: true,
    negationLabel: 'No equipado (noequipped:X)',
    defaultPositive: 'equipped:Shields',
    defaultNegative: 'noequipped:Shields'
  },
  // Channeling check
  {
    type: 'channeling',
    name: 'Canalizando Hechizo (channeling / nochanneling)',
    category: 'status',
    description: 'Evita cancelar o pisar un hechizo canalizado como Arcane Missiles, Drain Soul, Penance, Blizzard.',
    hasValue: true,
    valueType: 'text',
    allowNegation: true,
    negationLabel: 'No canalizando (nochanneling)',
    defaultPositive: 'channeling',
    defaultNegative: 'nochanneling'
  },
  // Mouse button click
  {
    type: 'btn',
    name: 'Botón del Ratón (btn:1/2/3)',
    category: 'modifier',
    description: 'Diferencia si haces click con botón izquierdo (1), derecho (2) o central (3) sobre la macro.',
    hasValue: true,
    valueType: 'select',
    valueOptions: [
      { label: 'Click Izquierdo (btn:1)', value: '1' },
      { label: 'Click Derecho (btn:2)', value: '2' },
      { label: 'Click Central (btn:3)', value: '3' }
    ],
    allowNegation: false,
    defaultPositive: 'btn:2',
    defaultNegative: ''
  },
  // Environment (Flyable, Mounted)
  {
    type: 'flyable',
    name: 'Zona de Vuelo Permitida (flyable)',
    category: 'environment',
    description: 'Distingue si te encuentras en una zona donde se permite volar (Terrallende, Rasganorte con Cold Weather Flying).',
    hasValue: false,
    allowNegation: true,
    negationLabel: 'Zona no volable (noflyable)',
    defaultPositive: 'flyable',
    defaultNegative: 'noflyable'
  },
  {
    type: 'mounted',
    name: 'Montado en Montura (mounted)',
    category: 'environment',
    description: 'Comprueba si vas montado actualmente.',
    hasValue: false,
    allowNegation: true,
    negationLabel: 'Desmontado (nomounted)',
    defaultPositive: 'mounted',
    defaultNegative: 'nomounted'
  }
];
