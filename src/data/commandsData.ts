import { CommandCategory } from '../types/macro';

export interface CommandDefinition {
  command: string;
  name: string;
  category: CommandCategory;
  description: string;
  example: string;
  defaultArg: string;
  supportsConditionals: boolean;
  color: string;
  icon: string;
  tags: string[];
}

export const COMMANDS_CATALOG: CommandDefinition[] = [
  // Spell & Actions
  {
    command: '#showtooltip',
    name: 'Mostrar Tooltip (#showtooltip)',
    category: 'utility',
    description: 'Muestra el icono, coste de maná, rango y descripción emergente de la habilidad o ítem automáticamente según las condiciones actuales.',
    example: '#showtooltip [mod:shift] Flash of Light; Holy Shock',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
    icon: 'Eye',
    tags: ['tooltip', 'icon', 'info', 'show', 'showtooltip']
  },
  {
    command: '/cast',
    name: 'Lanzar Hechizo (/cast)',
    category: 'spell',
    description: 'Ejecuta un hechizo o habilidad según el objetivo o los modificadores indicados.',
    example: '/cast [@mouseover,help,nodead][@target,help,nodead][@player] Flash of Light',
    defaultArg: 'Flash of Light',
    supportsConditionals: true,
    color: 'text-sky-400 border-sky-500/40 bg-sky-950/20',
    icon: 'Sparkles',
    tags: ['hechizo', 'spell', 'cast', 'lanzar', 'habilidad', 'curar', 'dps']
  },
  {
    command: '/castsequence',
    name: 'Secuencia de Hechizos (/castsequence)',
    category: 'spell',
    description: 'Ejecuta una rotación ordenada de hechizos al pulsar sucesivamente la macro. Permite condiciones de reseteo (tiempo, combate, cambio de target).',
    example: '/castsequence reset=combat/target/8 Rend, Overpower, Mortal Strike',
    defaultArg: 'reset=combat/target/6 Rend, Overpower',
    supportsConditionals: true,
    color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/20',
    icon: 'ListOrdered',
    tags: ['combo', 'secuencia', 'rotacion', 'castsequence', 'reset']
  },
  {
    command: '/castrandom',
    name: 'Lanzar Hechizo Aleatorio (/castrandom)',
    category: 'spell',
    description: 'Lanza uno de los hechizos especificados de forma aleatoria (útil para monturas aleatorias o habilidades equivalentes).',
    example: '/castrandom Invincible, Time-Lost Proto-Drake, Mimiron\'s Head',
    defaultArg: 'Spell1, Spell2',
    supportsConditionals: true,
    color: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
    icon: 'Shuffle',
    tags: ['random', 'aleatorio', 'castrandom', 'montura']
  },
  {
    command: '/use',
    name: 'Usar Objeto / Abalorio (/use)',
    category: 'equipment',
    description: 'Utiliza un objeto del inventario, poción, o un abalorio equipado por número de casilla (13 = Primer Abalorio, 14 = Segundo Abalorio, 10 = Guantes/Ingeniería, 6 = Cinturón, 8 = Botas).',
    example: '/use 13',
    defaultArg: '13',
    supportsConditionals: true,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
    icon: 'ShieldAlert',
    tags: ['trinket', 'abalorio', 'usar', 'pocion', 'item', '13', '14', 'guantes']
  },
  {
    command: '/cancelaura',
    name: 'Cancelar Buff / Aura (/cancelaura)',
    category: 'utility',
    description: 'Cancela un buff inmediatamente. Muy usado para cancelar Hand of Protection, Blessing of Protection, Ice Block, Divine Shield o Levitate al instante.',
    example: '/cancelaura Hand of Protection',
    defaultArg: 'Hand of Protection',
    supportsConditionals: true,
    color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
    icon: 'Ban',
    tags: ['cancel', 'buff', 'aura', 'bop', 'ice block', 'cancelaura', 'burbuja']
  },
  {
    command: '/cancelform',
    name: 'Cancelar Forma / Postura (/cancelform)',
    category: 'utility',
    description: 'Elimina de inmediato cualquier cambio de forma (Druida, Sombras, etc.) para volver a la forma de lanzador sin coste.',
    example: '/cancelform',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-orange-400 border-orange-500/40 bg-orange-950/20',
    icon: 'RefreshCw',
    tags: ['druid', 'forma', 'stance', 'cancelform', 'caster']
  },
  {
    command: '/dismount',
    name: 'Desmontar (/dismount)',
    category: 'utility',
    description: 'Fuerza a desmontar si vas subido a una montura.',
    example: '/dismount [mounted]',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-amber-300 border-amber-500/30 bg-amber-950/20',
    icon: 'Footprints',
    tags: ['montura', 'bajar', 'dismount']
  },
  {
    command: '/stopcasting',
    name: 'Detener Lanzamiento (/stopcasting)',
    category: 'utility',
    description: 'Interrumpe al instante cualquier hechizo en curso para reaccionar de inmediato con un silencio (Counterspell/Pummel/Kick) o defensa.',
    example: '/stopcasting',
    defaultArg: '',
    supportsConditionals: false,
    color: 'text-red-400 border-red-500/40 bg-red-950/20',
    icon: 'OctagonAlert',
    tags: ['stop', 'interrumpir', 'corte', 'reaccion', 'stopcasting']
  },
  {
    command: '/stopattack',
    name: 'Detener Ataque Automático (/stopattack)',
    category: 'utility',
    description: 'Para de golpear cuerpo a cuerpo o a distancia. Crucial para no romper efectos de control (Polymorph, Gouge, Sap, Blind).',
    example: '/stopattack',
    defaultArg: '',
    supportsConditionals: false,
    color: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/20',
    icon: 'Pause',
    tags: ['stop', 'parar', 'cc', 'stopattack']
  },
  {
    command: '/startattack',
    name: 'Iniciar Ataque Automático (/startattack)',
    category: 'utility',
    description: 'Garantiza que el personaje comience a golpear automáticamente al objetivo sin reiniciar el swing ni fallar si no hay energía/ira.',
    example: '/startattack',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-lime-400 border-lime-500/40 bg-lime-950/20',
    icon: 'Swords',
    tags: ['atacar', 'autoattack', 'startattack', 'melee']
  },

  // Targeting & Focus
  {
    command: '/target',
    name: 'Seleccionar Objetivo (/target)',
    category: 'targeting',
    description: 'Fija el objetivo en la unidad o nombre especificado (exacto o aproximado).',
    example: '/target [nodead] Totem',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-teal-400 border-teal-500/40 bg-teal-950/20',
    icon: 'Crosshair',
    tags: ['target', 'objetivo', 'seleccionar']
  },
  {
    command: '/targetexact',
    name: 'Seleccionar Objetivo Exacto (/targetexact)',
    category: 'targeting',
    description: 'Selecciona solo una unidad cuyo nombre coincida exactamente con el texto (evita seleccionar npcs o jugadores parecidos).',
    example: '/targetexact Tremor Totem',
    defaultArg: 'Tremor Totem',
    supportsConditionals: true,
    color: 'text-teal-300 border-teal-500/40 bg-teal-950/20',
    icon: 'Target',
    tags: ['targetexact', 'totem', 'exacto']
  },
  {
    command: '/focus',
    name: 'Fijar Objetivo de Foco (/focus)',
    category: 'targeting',
    description: 'Establece la unidad especificada (o el objetivo actual / mouseover) como foco secundario para control y cortes.',
    example: '/focus [@mouseover,exists][@target]',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
    icon: 'ScanEye',
    tags: ['focus', 'foco', 'arena', 'pvp']
  },
  {
    command: '/clearfocus',
    name: 'Limpiar Foco (/clearfocus)',
    category: 'targeting',
    description: 'Borra el objetivo de foco actual.',
    example: '/clearfocus',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20',
    icon: 'ScanEye',
    tags: ['clearfocus', 'borrar', 'foco']
  },
  {
    command: '/cleartarget',
    name: 'Limpiar Objetivo (/cleartarget)',
    category: 'targeting',
    description: 'Deselecciona el objetivo actual.',
    example: '/cleartarget [dead]',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-slate-400 border-slate-500/40 bg-slate-950/20',
    icon: 'UserX',
    tags: ['cleartarget', 'deseleccionar']
  },
  {
    command: '/targetlasttarget',
    name: 'Volver a Último Objetivo (/targetlasttarget)',
    category: 'targeting',
    description: 'Vuelve a seleccionar el objetivo previo inmediatamente.',
    example: '/targetlasttarget',
    defaultArg: '',
    supportsConditionals: false,
    color: 'text-teal-200 border-teal-500/30 bg-teal-950/20',
    icon: 'Undo2',
    tags: ['lasttarget', 'anterior', 'target']
  },

  // Equipment & Weapon Swapping (Huge in 3.3.5a & CoA)
  {
    command: '/equip',
    name: 'Equipar Objeto (/equip)',
    category: 'equipment',
    description: 'Equipa un arma o pieza de equipo por su nombre exacto.',
    example: '/equip [equipped:Shields] Shadowmourne; Wrathful Gladiator\'s Sunderer',
    defaultArg: 'Nombre del Arma',
    supportsConditionals: true,
    color: 'text-amber-500 border-amber-500/40 bg-amber-950/20',
    icon: 'Shield',
    tags: ['equip', 'arma', 'escudo', 'weapon swap', 'equipslot']
  },
  {
    command: '/equipslot',
    name: 'Equipar en Casilla Específica (/equipslot)',
    category: 'equipment',
    description: 'Equipa un objeto en una ranura concreta (16 = Mano Principal, 17 = Mano Secundaria / Escudo, 18 = A Distancia). Indispensable para cambio rápido de arma de 1 Mano + Escudo para defensivas.',
    example: '/equipslot 17 Wrathful Gladiator\'s Shield Wall',
    defaultArg: '17 Nombre del Escudo',
    supportsConditionals: true,
    color: 'text-yellow-500 border-yellow-500/40 bg-yellow-950/20',
    icon: 'ShieldCheck',
    tags: ['equipslot', '16', '17', '18', 'mano principal', 'escudo', 'offhand']
  },

  // Pet Commands
  {
    command: '/petattack',
    name: 'Mascota: Atacar (/petattack)',
    category: 'pet',
    description: 'Ordena a la mascota atacar al objetivo indicado o al mouseover de inmediato.',
    example: '/petattack [@mouseover,harm][@target,harm]',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/20',
    icon: 'Dog',
    tags: ['pet', 'mascota', 'petattack', 'hunter', 'warlock', 'dk']
  },
  {
    command: '/petfollow',
    name: 'Mascota: Seguir (/petfollow)',
    category: 'pet',
    description: 'Hace que la mascota regrese inmediatamente a tu lado y deje de atacar.',
    example: '/petfollow',
    defaultArg: '',
    supportsConditionals: true,
    color: 'text-emerald-200 border-emerald-500/30 bg-emerald-950/20',
    icon: 'Footprints',
    tags: ['petfollow', 'retirar', 'mascota']
  },
  {
    command: '/petpassive',
    name: 'Mascota: Modo Pasivo (/petpassive)',
    category: 'pet',
    description: 'Pone a la mascota en modo pasivo.',
    example: '/petpassive',
    defaultArg: '',
    supportsConditionals: false,
    color: 'text-green-500 border-green-500/30 bg-green-950/20',
    icon: 'ShieldOff',
    tags: ['petpassive', 'pasivo']
  },

  // Chat & Communication
  {
    command: '/say',
    name: 'Decir en Chat (/say)',
    category: 'chat',
    description: 'Envía un mensaje al canal local /decir.',
    example: '/say ¡Lanzando Polymorph a %t!',
    defaultArg: '¡Lanzando habilidad a %t!',
    supportsConditionals: false,
    color: 'text-zinc-300 border-zinc-500/30 bg-zinc-950/20',
    icon: 'MessageSquare',
    tags: ['chat', 'say', 'decir']
  },
  {
    command: '/yell',
    name: 'Gritar (/yell)',
    category: 'chat',
    description: 'Grita un mensaje en el área circundante.',
    example: '/yell ¡Heroísmo / Bloodlust Activo!',
    defaultArg: '¡Defensiva activada!',
    supportsConditionals: false,
    color: 'text-rose-300 border-rose-500/30 bg-rose-950/20',
    icon: 'Megaphone',
    tags: ['yell', 'gritar', 'alerta']
  },
  {
    command: '/party',
    name: 'Aviso a Grupo (/party)',
    category: 'chat',
    description: 'Envía un aviso al chat de grupo /party.',
    example: '/party He lanzado [Innervate] a %t',
    defaultArg: 'Interrumpiendo a %t',
    supportsConditionals: false,
    color: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
    icon: 'Users',
    tags: ['party', 'grupo']
  },
  {
    command: '/raid',
    name: 'Aviso a Banda (/raid)',
    category: 'chat',
    description: 'Envía un aviso a todos los miembros de la banda.',
    example: '/raid Tauntando al Boss!',
    defaultArg: 'Cooldown defensivo usado',
    supportsConditionals: false,
    color: 'text-orange-400 border-orange-500/30 bg-orange-950/20',
    icon: 'UsersRound',
    tags: ['raid', 'banda']
  },

  // Script & Lua
  {
    command: '/run',
    name: 'Script Lua (/run o /script)',
    category: 'utility',
    description: 'Ejecuta una línea de código Lua nativo de WoW 3.3.5a (mensajes condicionales, clicks en interfaces, etc.).',
    example: '/run UIErrorsFrame:Clear()',
    defaultArg: 'UIErrorsFrame:Clear()',
    supportsConditionals: false,
    color: 'text-pink-400 border-pink-500/40 bg-pink-950/20',
    icon: 'Code2',
    tags: ['lua', 'script', 'run', 'avanzado']
  },

  // Project Ascension / CoA Specific
  {
    command: '/ascension',
    name: 'Comando Ascension (/ascension)',
    category: 'ascension',
    description: 'Comandos y utilidades específicas del servidor Project Ascension.',
    example: '/ascension',
    defaultArg: '',
    supportsConditionals: false,
    color: 'text-amber-500 border-amber-500/60 bg-amber-950/40',
    icon: 'Zap',
    tags: ['ascension', 'coa', 'conquest', 're', 'custom']
  }
];
