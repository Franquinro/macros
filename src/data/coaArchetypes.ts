export interface CoAArchetype {
  id: string;
  name: string;
  role: 'DPS' | 'Healer' | 'Tank' | 'Hybrid';
  themeColor: string;
  icon: string;
  description: string;
  signatureSpells: string[];
  recommendedMacros: {
    title: string;
    description: string;
    macroCode: string;
  }[];
}

export const COA_ARCHETYPES: CoAArchetype[] = [
  {
    id: 'chronomancer',
    name: 'Chronomancer',
    role: 'Healer',
    themeColor: 'from-amber-400 to-yellow-600',
    icon: 'Hourglass',
    description: 'Manipulador del tiempo que revierte el daño recibido, acelera el tiempo de lanzamiento y cura mediante paradojas temporales.',
    signatureSpells: ['Rewind', 'Time Warp', 'Temporal Anomaly', 'Paradox', 'Chronoshift', 'Deceleration'],
    recommendedMacros: [
      {
        title: 'Smart Mouseover Rewind (Sanación Temporal Inversa)',
        description: 'Lanza Rewind sobre el aliado bajo el cursor, o tu objetivo, o a ti mismo si no hay nadie seleccionado.',
        macroCode: '#showtooltip Rewind\n/cast [@mouseover,help,nodead][@target,help,nodead][@player] Rewind'
      },
      {
        title: 'Burst Temporal + Trinkets (Aceleración Extrema)',
        description: 'Activa abalorios de celeridad, Time Warp y lanza la cura más potente al instante.',
        macroCode: '#showtooltip Time Warp\n/use 13\n/use 14\n/cast Time Warp\n/cast [@mouseover,help,nodead][@player] Paradox'
      }
    ]
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    role: 'DPS',
    themeColor: 'from-emerald-500 to-teal-800',
    icon: 'Skull',
    description: 'Maestro de la peste, invocaciones no-muertas y sacrificios de esbirros para potenciar daño de sombras y venenos.',
    signatureSpells: ['Raise Skeleton', 'Corpse Explosion', 'Death Coil', 'Plague Strike', 'Bone Armor', 'Soul Harvest'],
    recommendedMacros: [
      {
        title: 'Corpse Explosion con Mouseover',
        description: 'Hace explotar un cadáver bajo el ratón o directamente en tu objetivo actual sin perder el target principal.',
        macroCode: '#showtooltip Corpse Explosion\n/cast [@mouseover,harm,dead][@mouseover,help,dead][@target,dead][] Corpse Explosion'
      },
      {
        title: 'Empower Minion + Pet Attack Combo',
        description: 'Ordena a tus no-muertos atacar mientras aplicas sobrecargas de peste.',
        macroCode: '#showtooltip Plague Strike\n/petattack [@mouseover,harm][@target,harm]\n/cast Plague Strike\n/startattack'
      }
    ]
  },
  {
    id: 'tinker',
    name: 'Tinker',
    role: 'Hybrid',
    themeColor: 'from-orange-400 to-amber-700',
    icon: 'Wrench',
    description: 'Ingeniero militar que despliega torretas, morteros, botas cohete y armamento pesado a vapor.',
    signatureSpells: ['Deploy Turret', 'Mortar Shot', 'Steam Armor', 'Rocket Barrage', 'Overcharge Gadget', 'Flash Bomb'],
    recommendedMacros: [
      {
        title: 'Despliegue Rápido de Mortero en Cursor (@cursor)',
        description: 'Lanza el mortero / torreta exactamente en la posición del ratón en el suelo sin esperar el círculo de apuntado.',
        macroCode: '#showtooltip Mortar Shot\n/use 10\n/cast [@cursor] Mortar Shot'
      },
      {
        title: 'Overcharge + Cohetes de Ingeniería',
        description: 'Activa los guantes de ingeniería (ranura 10), abalorio y ráfaga de cohetes para daño explosivo instantáneo.',
        macroCode: '#showtooltip Rocket Barrage\n/use 10\n/use 13\n/cast Rocket Barrage'
      }
    ]
  },
  {
    id: 'barbarian',
    name: 'Barbarian',
    role: 'DPS',
    themeColor: 'from-red-600 to-orange-800',
    icon: 'Axe',
    description: 'Guerrero salvaje enfocado en empuñar armas dobles masivas, rabia inagotable, saltos brutales y frenesí sanguíneo.',
    signatureSpells: ['Blood Rage', 'Primal Leap', 'Whirlwind', 'Execute', 'Berserker Stance', 'Titan\'s Grip'],
    recommendedMacros: [
      {
        title: 'Primal Leap + StartAttack Spammable',
        description: 'Salto a la yugular con activación inmediata del auto-ataque para no perder ningún swing blanco.',
        macroCode: '#showtooltip Primal Leap\n/cast Primal Leap\n/startattack'
      },
      {
        title: 'Burst de Furia Bárbara (Blood Rage + Trinket + Execute)',
        description: 'Usa abalorio 13, activa Blood Rage e intenta ejecutar con prioridad.',
        macroCode: '#showtooltip Execute\n/use 13\n/cast Blood Rage\n/cast Execute\n/startattack'
      }
    ]
  },
  {
    id: 'pyromancer',
    name: 'Pyromancer',
    role: 'DPS',
    themeColor: 'from-amber-500 to-red-600',
    icon: 'Flame',
    description: 'Especialista en igniciones devastadoras, bombas vivientes, combustiones instantáneas y olas de calor.',
    signatureSpells: ['Combustion', 'Living Bomb', 'Pyroblast', 'Flame Wave', 'Fire Blast', 'Heat Wave'],
    recommendedMacros: [
      {
        title: 'Smart Living Bomb Multi-Target (Mouseover)',
        description: 'Aplica bomba viva a múltiples enemigos rápidamente pasando el cursor sobre ellos en combate de área.',
        macroCode: '#showtooltip Living Bomb\n/cast [@mouseover,harm,nodead][@target,harm,nodead][] Living Bomb'
      },
      {
        title: 'One-Shot Pyromancer Combo (Combustion + Pyroblast)',
        description: 'Activa abalorio de daño con hechizos, Combustion y lanza Piroexplosión instantánea.',
        macroCode: '#showtooltip Combustion\n/stopcasting\n/use 13\n/use 14\n/cast Combustion\n/cast Pyroblast'
      }
    ]
  },
  {
    id: 'witch_doctor',
    name: 'Witch Doctor',
    role: 'Hybrid',
    themeColor: 'from-purple-500 to-emerald-700',
    icon: 'FlaskConical',
    description: 'Chamán vudú que utiliza tótems oscuros, maldiciones tribales, espíritus sanadores y maleficios.',
    signatureSpells: ['Hex', 'Voodoo Totem', 'Spirit Ward', 'Shadow Shock', 'Fetish Ward', 'Bloodlust'],
    recommendedMacros: [
      {
        title: 'Smart Hex con Modificador de Foco (Shift = Focus, Normal = Target)',
        description: 'Lanza Hex al foco si pulsas Shift, o al objetivo actual si no pulsas ninguna tecla.',
        macroCode: '#showtooltip Hex\n/stopcasting\n/cast [mod:shift,@focus,harm,nodead][@mouseover,harm,nodead][@target,harm,nodead] Hex'
      },
      {
        title: 'Spirit Ward de Emergencia (Mouseover)',
        description: 'Escudo espiritual instantáneo al aliado en peligro.',
        macroCode: '#showtooltip Spirit Ward\n/cast [@mouseover,help,nodead][@target,help,nodead][@player] Spirit Ward'
      }
    ]
  },
  {
    id: 'demon_hunter',
    name: 'Demon Hunter',
    role: 'DPS',
    themeColor: 'from-emerald-400 to-purple-800',
    icon: 'EyeOff',
    description: 'Ágil luchador que canaliza energía vil, visión espectral, saltos fel y cortes con gujas dobles.',
    signatureSpells: ['Fel Rush', 'Chaos Strike', 'Eye Beam', 'Metamorphosis', 'Spectral Sight', 'Immolation Aura'],
    recommendedMacros: [
      {
        title: 'Eye Beam Anti-Interrupt (No-Cancel Channeling)',
        description: 'Permite spamear el botón de Eye Beam sin cancelar la canalización antes de que termine.',
        macroCode: '#showtooltip Eye Beam\n/cast [nochanneling:Eye Beam] Eye Beam'
      },
      {
        title: 'Metamorphosis Burst Combo + Trinkets',
        description: 'Activa la transformación vil, abalorios y Aura de Inmolación de golpe.',
        macroCode: '#showtooltip Metamorphosis\n/use 13\n/cast Metamorphosis\n/cast Immolation Aura\n/startattack'
      }
    ]
  },
  {
    id: 'sunwalker',
    name: 'Sunwalker',
    role: 'Tank',
    themeColor: 'from-amber-300 to-yellow-500',
    icon: 'Sun',
    description: 'Paladín solar Tauren enfocado en defensa inquebrantable, juicio del sol y luz radiante.',
    signatureSpells: ['Solar Flare', 'Sun Shield', 'Radiant Judgment', 'Solar Hammer', 'Aura of the Sun', 'Righteous Fury'],
    recommendedMacros: [
      {
        title: 'Instant 1H + Shield Wall Swap',
        description: 'Equipa instantáneamente arma de una mano y escudo y activa la habilidad defensiva.',
        macroCode: '#showtooltip Sun Shield\n/equipslot 16 Sunwalker Blade\n/equipslot 17 Sunwalker Bastion\n/cast Sun Shield'
      },
      {
        title: 'Taunt / Solar Flare a Mouseover',
        description: 'Agarra agro de un enemigo suelto apuntándolo con el cursor sin cambiar tu objetivo principal.',
        macroCode: '#showtooltip Solar Flare\n/cast [@mouseover,harm,nodead][@target,harm,nodead][] Solar Flare'
      }
    ]
  },
  {
    id: 'reaper',
    name: 'Reaper',
    role: 'DPS',
    themeColor: 'from-indigo-600 to-violet-900',
    icon: 'Ghost',
    description: 'Segador de almas que empuña guadañas o mandobles, cosechando esencias vitales y drenando existencia.',
    signatureSpells: ['Soul Scythe', 'Harvest Souls', 'Reaper\'s Mark', 'Grim Grasp', 'Soul Armor', 'Death Grip'],
    recommendedMacros: [
      {
        title: 'Grim Grasp + Soul Scythe Combo',
        description: 'Atrae al enemigo hacia ti y aplica la marca de la cosecha con auto-ataque iniciado.',
        macroCode: '#showtooltip Grim Grasp\n/cast Grim Grasp\n/startattack\n/castsequence reset=6 Soul Scythe, Harvest Souls'
      }
    ]
  }
];
