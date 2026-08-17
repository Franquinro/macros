import { MacroData } from '../types/macro';

export const DEFAULT_PRESETS: MacroData[] = [
  {
    id: 'preset-smart-heal',
    name: 'Smart Mouseover Heal / Dispel',
    description: 'Prioridad inteligente: Cura al objetivo bajo el ratón si es amigo y está vivo, luego al objetivo actual, y si no hay ninguno, se auto-cura a uno mismo.',
    icon: 'Sparkles',
    category: 'pve',
    blocks: [
      {
        id: 'b1',
        command: '#showtooltip',
        brackets: [],
        argument: '',
        enabled: true
      },
      {
        id: 'b2',
        command: '/cast',
        brackets: [
          {
            id: 'br1',
            target: '@mouseover',
            rules: [
              { id: 'r1', type: 'harm', isNegated: true }, // help
              { id: 'r2', type: 'nodead', isNegated: false } // nodead
            ]
          },
          {
            id: 'br2',
            target: '@target',
            rules: [
              { id: 'r3', type: 'harm', isNegated: true }, // help
              { id: 'r4', type: 'nodead', isNegated: false } // nodead
            ]
          },
          {
            id: 'br3',
            target: '@player',
            rules: []
          }
        ],
        argument: 'Flash of Light',
        enabled: true
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'preset-burst-cooldowns',
    name: 'One-Shot Burst Cooldown Stacker',
    description: 'Activa ambos abalorios de daño (13 y 14), guantes de ingeniería (10), habilidad racial / buff de daño y lanza el hechizo de apertura.',
    icon: 'Flame',
    category: 'pvp',
    blocks: [
      {
        id: 'b1',
        command: '#showtooltip',
        brackets: [],
        argument: 'Combustion',
        enabled: true
      },
      {
        id: 'b2',
        command: '/stopcasting',
        brackets: [],
        argument: '',
        enabled: true
      },
      {
        id: 'b3',
        command: '/use',
        brackets: [],
        argument: '10',
        enabled: true,
        comment: 'Guantes de Ingeniería'
      },
      {
        id: 'b4',
        command: '/use',
        brackets: [],
        argument: '13',
        enabled: true,
        comment: 'Abalorio 1'
      },
      {
        id: 'b5',
        command: '/use',
        brackets: [],
        argument: '14',
        enabled: true,
        comment: 'Abalorio 2'
      },
      {
        id: 'b6',
        command: '/cast',
        brackets: [],
        argument: 'Blood Fury',
        enabled: true,
        comment: 'Racial Orc o Buff'
      },
      {
        id: 'b7',
        command: '/cast',
        brackets: [
          {
            id: 'br1',
            target: '@target',
            rules: [
              { id: 'r1', type: 'harm', isNegated: false },
              { id: 'r2', type: 'nodead', isNegated: false }
            ]
          }
        ],
        argument: 'Combustion',
        enabled: true
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'preset-focus-interrupt',
    name: 'Focus / Target Smart Interrupt',
    description: 'Corta instantáneamente el lanzamiento actual con /stopcasting y lanza el silencio al Foco si pulsas Shift, o al objetivo actual si no pulsas modificador.',
    icon: 'OctagonAlert',
    category: 'pvp',
    blocks: [
      {
        id: 'b1',
        command: '#showtooltip',
        brackets: [],
        argument: 'Counterspell',
        enabled: true
      },
      {
        id: 'b2',
        command: '/stopcasting',
        brackets: [],
        argument: '',
        enabled: true
      },
      {
        id: 'b3',
        command: '/cast',
        brackets: [
          {
            id: 'br1',
            target: '@focus',
            rules: [
              { id: 'r1', type: 'mod', value: 'shift' },
              { id: 'r2', type: 'harm', isNegated: false },
              { id: 'r3', type: 'nodead', isNegated: false }
            ]
          },
          {
            id: 'br2',
            target: '@mouseover',
            rules: [
              { id: 'r4', type: 'harm', isNegated: false },
              { id: 'r5', type: 'nodead', isNegated: false }
            ]
          },
          {
            id: 'br3',
            target: '@target',
            rules: [
              { id: 'r6', type: 'harm', isNegated: false },
              { id: 'r7', type: 'nodead', isNegated: false }
            ]
          }
        ],
        argument: 'Counterspell',
        enabled: true
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'preset-anti-clipping',
    name: 'Anti-Clipping Spammable Channeling',
    description: 'Permite spamear un hechizo canalizado (Arcane Missiles, Mind Flay, Penance, Drain Soul, Eye Beam) sin cancelarlo accidentalmente antes de tiempo.',
    icon: 'Shield',
    category: 'pve',
    blocks: [
      {
        id: 'b1',
        command: '#showtooltip',
        brackets: [],
        argument: 'Arcane Missiles',
        enabled: true
      },
      {
        id: 'b2',
        command: '/cast',
        brackets: [
          {
            id: 'br1',
            rules: [
              { id: 'r1', type: 'channeling', value: 'Arcane Missiles', isNegated: true } // nochanneling:Arcane Missiles
            ]
          }
        ],
        argument: 'Arcane Missiles',
        enabled: true
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'preset-smart-mount',
    name: 'Smart Dynamic Mount (Flyable / Ground / Dismount)',
    description: 'Si vas montado se desmonta (/dismount). Si estás en zona donde se puede volar invoca la montura voladora, y en mazmorras o Azeroth invoca la montura terrestre.',
    icon: 'Footprints',
    category: 'qol',
    blocks: [
      {
        id: 'b1',
        command: '#showtooltip',
        brackets: [
          {
            id: 'br1',
            rules: [{ id: 'r1', type: 'flyable', isNegated: false }]
          }
        ],
        argument: 'Time-Lost Proto-Drake; Swift Spectral Tiger',
        enabled: true
      },
      {
        id: 'b2',
        command: '/dismount',
        brackets: [
          {
            id: 'br2',
            rules: [{ id: 'r2', type: 'mounted', isNegated: false }]
          }
        ],
        argument: '',
        enabled: true
      },
      {
        id: 'b3',
        command: '/cast',
        brackets: [
          {
            id: 'br3',
            rules: [
              { id: 'r3', type: 'flyable', isNegated: false },
              { id: 'r4', type: 'combat', isNegated: true } // nocombat
            ]
          }
        ],
        argument: 'Time-Lost Proto-Drake',
        enabled: true
      },
      {
        id: 'b4',
        command: '/cast',
        brackets: [
          {
            id: 'br4',
            rules: [
              { id: 'r5', type: 'combat', isNegated: true } // nocombat
            ]
          }
        ],
        argument: 'Swift Spectral Tiger',
        enabled: true
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'preset-weapon-swap-shield',
    name: 'Instant Weapon Swap (1H + Escudo / 2H)',
    description: 'Cambia dinámicamente entre arma de 2 Manos para hacer daño, o 1 Mano + Escudo para lanzar Muro de Escudo / Reflejo de Hechizos.',
    icon: 'ShieldAlert',
    category: 'ascension_coa',
    blocks: [
      {
        id: 'b1',
        command: '#showtooltip',
        brackets: [],
        argument: 'Shield Wall',
        enabled: true
      },
      {
        id: 'b2',
        command: '/equipslot',
        brackets: [],
        argument: '16 Wrathful Gladiator\'s Sunderer',
        enabled: true,
        comment: 'Arma 1 Mano'
      },
      {
        id: 'b3',
        command: '/equipslot',
        brackets: [],
        argument: '17 Wrathful Gladiator\'s Shield Wall',
        enabled: true,
        comment: 'Escudo'
      },
      {
        id: 'b4',
        command: '/cast',
        brackets: [
          {
            id: 'br1',
            rules: [{ id: 'r1', type: 'equipped', value: 'Shields' }]
          }
        ],
        argument: 'Shield Wall',
        enabled: true
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'preset-castsequence-rotation',
    name: 'Castsequence con Reset Timers',
    description: 'Rotación secuencial de hechizos o sangrados con temporizador de reseteo automático al cambiar de objetivo o salir de combate.',
    icon: 'ListOrdered',
    category: 'pve',
    blocks: [
      {
        id: 'b1',
        command: '#showtooltip',
        brackets: [],
        argument: 'Rend',
        enabled: true
      },
      {
        id: 'b2',
        command: '/startattack',
        brackets: [],
        argument: '',
        enabled: true
      },
      {
        id: 'b3',
        command: '/castsequence',
        brackets: [],
        argument: 'reset=combat/target/6 Rend, Overpower, Mortal Strike',
        enabled: true
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'preset-pet-burst',
    name: 'Pet Attack + Focus CC Combo',
    description: 'Envía a la mascota a atacar a tu objetivo principal mientras lanzas control de masas al mouseover o foco.',
    icon: 'Dog',
    category: 'pvp',
    blocks: [
      {
        id: 'b1',
        command: '#showtooltip',
        brackets: [],
        argument: 'Intimidation',
        enabled: true
      },
      {
        id: 'b2',
        command: '/petattack',
        brackets: [
          {
            id: 'br1',
            target: '@mouseover',
            rules: [{ id: 'r1', type: 'harm', isNegated: false }]
          },
          {
            id: 'br2',
            target: '@target',
            rules: [{ id: 'r2', type: 'harm', isNegated: false }]
          }
        ],
        argument: '',
        enabled: true
      },
      {
        id: 'b3',
        command: '/cast',
        brackets: [],
        argument: 'Intimidation',
        enabled: true
      },
      {
        id: 'b4',
        command: '/startattack',
        brackets: [],
        argument: '',
        enabled: true
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];
