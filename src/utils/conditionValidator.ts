import { ConditionBracket, ConditionRule, MacroBlock, TargetSelector } from '../types/macro';

export interface ConditionIssue {
  severity: 'error' | 'warning';
  title: string;
  description: string;
  suggestion?: string;
}

export interface BracketValidationResult {
  isValid: boolean;
  isImpossible: boolean;
  issues: ConditionIssue[];
  humanDescription: string;
}

/**
 * Returns a human-friendly Spanish description of what a single condition bracket evaluates
 */
export function translateBracketToHuman(bracket: ConditionBracket): string {
  const parts: string[] = [];

  // Check if empty bracket []
  const hasNoTarget = !bracket.target || bracket.target === '@none';
  const hasNoRules = !bracket.rules || bracket.rules.length === 0;

  if (hasNoTarget && hasNoRules) {
    return 'Acción por defecto (se ejecuta siempre si las prioridades anteriores no se cumplieron)';
  }

  // 1. Modifiers first
  const modRules = bracket.rules.filter(r => r.type === 'mod');
  for (const mod of modRules) {
    if (mod.isNegated) {
      parts.push('Sin pulsar modificadores (Shift/Ctrl/Alt)');
    } else if (mod.value) {
      parts.push(`Pulsando tecla ${mod.value.toUpperCase()}`);
    } else {
      parts.push('Pulsando cualquier tecla modificadora');
    }
  }

  // 2. Mouse button
  const btnRule = bracket.rules.find(r => r.type === 'btn');
  if (btnRule) {
    const btnMap: Record<string, string> = { '1': 'Click Izquierdo', '2': 'Click Derecho', '3': 'Click Central' };
    parts.push(`Haciendo ${btnMap[btnRule.value || '1'] || `Botón ${btnRule.value}`}`);
  }

  // 3. Player state conditions
  const combatRule = bracket.rules.find(r => r.type === 'combat');
  if (combatRule) {
    parts.push(combatRule.isNegated ? 'Fuera de combate' : 'En combate');
  }

  const stealthRule = bracket.rules.find(r => r.type === 'stealth');
  if (stealthRule) {
    parts.push(stealthRule.isNegated ? 'Fuera de sigilo' : 'En sigilo');
  }

  const mountedRule = bracket.rules.find(r => r.type === 'mounted');
  if (mountedRule) {
    parts.push(mountedRule.isNegated ? 'Desmontado' : 'Montado en montura');
  }

  const flyableRule = bracket.rules.find(r => r.type === 'flyable');
  if (flyableRule) {
    parts.push(flyableRule.isNegated ? 'Zona no volable' : 'Zona donde se permite volar');
  }

  const formRule = bracket.rules.find(r => r.type === 'form' || r.type === 'stance');
  if (formRule) {
    const formMap: Record<string, string> = {
      '0': 'Forma Normal / Caster',
      '1': 'Postura de Batalla / Oso',
      '2': 'Postura Defensiva / Acuática',
      '3': 'Postura Rabiosa / Felino',
      '4': 'Forma de Viaje',
      '5': 'Forma de Lechúcico / Voladora'
    };
    const formName = formMap[formRule.value || '1'] || `Forma ${formRule.value}`;
    parts.push(formRule.isNegated ? `No en ${formName}` : `En ${formName}`);
  }

  const equippedRule = bracket.rules.find(r => r.type === 'equipped');
  if (equippedRule) {
    const equipMap: Record<string, string> = {
      'Shields': 'Escudo',
      'Two-Hand': 'Arma de 2 Manos',
      'Daggers': 'Dagas',
      'One-Hand': 'Armas de 1 Mano',
      'Wands': 'Varita'
    };
    const eqName = equipMap[equippedRule.value || ''] || equippedRule.value || 'objeto';
    parts.push(equippedRule.isNegated ? `Sin ${eqName} equipado` : `Con ${eqName} equipado`);
  }

  const chanRule = bracket.rules.find(r => r.type === 'channeling');
  if (chanRule) {
    if (chanRule.isNegated) {
      parts.push(chanRule.value ? `No canalizando ${chanRule.value}` : 'No canalizando ningún hechizo');
    } else {
      parts.push(chanRule.value ? `Canalizando ${chanRule.value}` : 'Canalizando un hechizo');
    }
  }

  // 4. Target context & unit state
  let targetLabel = 'Objetivo actual';
  if (bracket.target === '@mouseover') targetLabel = 'Bajo el cursor (@mouseover)';
  else if (bracket.target === '@focus') targetLabel = 'Objetivo de Foco (@focus)';
  else if (bracket.target === '@player') targetLabel = 'Uno mismo (@player)';
  else if (bracket.target === '@pet') targetLabel = 'Tu mascota (@pet)';
  else if (bracket.target === '@cursor') targetLabel = 'Posición del ratón en suelo (@cursor)';
  else if (bracket.target === '@targettarget') targetLabel = 'Objetivo de tu objetivo (@targettarget)';
  else if (bracket.target === '@focustarget') targetLabel = 'Objetivo de tu foco (@focustarget)';

  const unitConditions: string[] = [];

  const existsRule = bracket.rules.find(r => r.type === 'exists');
  if (existsRule) {
    unitConditions.push(existsRule.isNegated ? 'no existe / sin unidad' : 'existe');
  }

  const harmRule = bracket.rules.find(r => r.type === 'harm');
  if (harmRule) {
    unitConditions.push(harmRule.isNegated ? 'es Aliado (help)' : 'es Enemigo (harm)');
  }

  const deadRule = bracket.rules.find(r => r.type === 'nodead');
  if (deadRule) {
    unitConditions.push(deadRule.isNegated ? 'está Muerto (dead)' : 'está Vivo (nodead)');
  }

  if (bracket.target && bracket.target !== '@none') {
    if (unitConditions.length > 0) {
      parts.push(`Unidad [${targetLabel}]: ${unitConditions.join(' y ')}`);
    } else {
      parts.push(`Apunta a [${targetLabel}]`);
    }
  } else if (unitConditions.length > 0) {
    parts.push(`Objetivo actual: ${unitConditions.join(' y ')}`);
  }

  return parts.join(' + ');
}

/**
 * Validates a single condition bracket for logical impossibilities and conflicting rules
 */
export function validateBracket(bracket: ConditionBracket): BracketValidationResult {
  const issues: ConditionIssue[] = [];

  const rules = bracket.rules || [];
  const target = bracket.target;

  // Rule Lookups
  const existsRule = rules.find(r => r.type === 'exists');
  const hasNoExists = existsRule && existsRule.isNegated; // [noexists]
  const hasExists = existsRule && !existsRule.isNegated;   // [exists]

  const harmRule = rules.find(r => r.type === 'harm');
  const hasHarm = harmRule && !harmRule.isNegated; // [harm]
  const hasHelp = harmRule && harmRule.isNegated;  // [help]

  const deadRule = rules.find(r => r.type === 'nodead');
  const hasNodead = deadRule && !deadRule.isNegated; // [nodead]
  const hasDead = deadRule && deadRule.isNegated;    // [dead]

  const combatRule = rules.find(r => r.type === 'combat');
  const hasCombat = combatRule && !combatRule.isNegated;
  const hasNoCombat = combatRule && combatRule.isNegated;

  const stealthRule = rules.find(r => r.type === 'stealth');
  const hasStealth = stealthRule && !stealthRule.isNegated;
  const hasNoStealth = stealthRule && stealthRule.isNegated;

  const mountedRule = rules.find(r => r.type === 'mounted');
  const hasMounted = mountedRule && !mountedRule.isNegated;
  const hasNoMounted = mountedRule && mountedRule.isNegated;

  const flyableRule = rules.find(r => r.type === 'flyable');
  const hasFlyable = flyableRule && !flyableRule.isNegated;
  const hasNoFlyable = flyableRule && flyableRule.isNegated;

  const modRules = rules.filter(r => r.type === 'mod');
  const hasNoMod = modRules.some(r => r.isNegated);
  const hasActiveMod = modRules.some(r => !r.isNegated);

  const chanRules = rules.filter(r => r.type === 'channeling');
  const hasChanneling = chanRules.some(r => !r.isNegated && !r.value);
  const hasNoChanneling = chanRules.some(r => r.isNegated && !r.value);

  // 1. CONFLICT: [noexists] combined with state properties of an existent unit (dead, nodead, harm, help)
  if (hasNoExists && (hasDead || hasNodead)) {
    issues.push({
      severity: 'error',
      title: 'Contradicción imposible: [noexists] con estado de vida',
      description: `Has combinado [noexists] (sin objetivo) con [${hasDead ? 'dead' : 'nodead'}]. Una unidad que no existe no puede estar ${hasDead ? 'muerta' : 'viva'}. Esta condición NUNCA se cumplirá.`,
      suggestion: 'Si querías ejecutar la acción si no existe objetivo O si está muerto, sepáralos en dos corchetes distintos (OR): [noexists][dead].'
    });
  }

  if (hasNoExists && (hasHarm || hasHelp)) {
    issues.push({
      severity: 'error',
      title: 'Contradicción imposible: [noexists] con facción',
      description: `Has combinado [noexists] con [${hasHarm ? 'harm' : 'help'}]. Una unidad inexistente no puede evaluarse como hostil ni amistosa.`,
      suggestion: 'Separa las condiciones en corchetes independientes si buscas una alternativa.'
    });
  }

  if (hasNoExists && hasExists) {
    issues.push({
      severity: 'error',
      title: 'Contradicción directa: [exists] y [noexists]',
      description: 'No se puede exigir simultáneamente que el objetivo exista y no exista.',
      suggestion: 'Elige solo una de las dos condiciones.'
    });
  }

  // 2. CONFLICT: [harm] and [help]
  if (hasHarm && hasHelp) {
    issues.push({
      severity: 'error',
      title: 'Contradicción directa: [harm] y [help]',
      description: 'Una unidad no puede ser hostil y amistosa a la vez.',
      suggestion: 'Si deseas que aplique a ambos, elimina la condición de facción o crea dos pasos separados.'
    });
  }

  // 3. CONFLICT: [dead] and [nodead]
  if (hasDead && hasNodead) {
    issues.push({
      severity: 'error',
      title: 'Contradicción directa: [dead] y [nodead]',
      description: 'Una unidad no puede estar viva y muerta simultáneamente.',
      suggestion: 'Elige si la condición aplica a vivos (nodead) o a muertos (dead).'
    });
  }

  // 4. CONFLICT: [combat] and [nocombat]
  if (hasCombat && hasNoCombat) {
    issues.push({
      severity: 'error',
      title: 'Contradicción directa: [combat] y [nocombat]',
      description: 'No puedes estar en combate y fuera de combate al mismo tiempo.',
      suggestion: 'Selecciona solo una de las dos opciones.'
    });
  }

  // 5. CONFLICT: [stealth] and [nostealth]
  if (hasStealth && hasNoStealth) {
    issues.push({
      severity: 'error',
      title: 'Contradicción directa: [stealth] y [nostealth]',
      description: 'No puedes estar en sigilo y fuera de sigilo al mismo tiempo.',
      suggestion: 'Selecciona solo una de las dos opciones.'
    });
  }

  // 6. CONFLICT: [mounted] and [nomounted]
  if (hasMounted && hasNoMounted) {
    issues.push({
      severity: 'error',
      title: 'Contradicción directa: [mounted] y [nomounted]',
      description: 'No puedes estar montado y desmontado al mismo tiempo.',
      suggestion: 'Selecciona solo una opción.'
    });
  }

  // 7. CONFLICT: [flyable] and [noflyable]
  if (hasFlyable && hasNoFlyable) {
    issues.push({
      severity: 'error',
      title: 'Contradicción directa: [flyable] y [noflyable]',
      description: 'Una zona no puede ser simultáneamente volable y no volable.',
      suggestion: 'Selecciona solo una opción.'
    });
  }

  // 8. CONFLICT: [nomod] with [mod:...]
  if (hasNoMod && hasActiveMod) {
    issues.push({
      severity: 'error',
      title: 'Contradicción directa: [nomod] y [mod]',
      description: '[nomod] exige que no se presione ninguna tecla modificadora, lo que anula a [mod].',
      suggestion: 'Usa [nomod] para cuando no se pulse tecla, o [mod:tecla] para cuando sí se pulse.'
    });
  }

  // 9. CONFLICT: [channeling] and [nochanneling]
  if (hasChanneling && hasNoChanneling) {
    issues.push({
      severity: 'error',
      title: 'Contradicción directa: [channeling] y [nochanneling]',
      description: 'No puedes estar canalizando y no canalizando al mismo tiempo.',
      suggestion: 'Selecciona solo una opción.'
    });
  }

  // 10. CONFLICT: @cursor with unit conditions
  if (target === '@cursor') {
    if (hasHarm || hasHelp || hasDead || hasNodead || hasExists || hasNoExists) {
      issues.push({
        severity: 'warning',
        title: 'Incompatibilidad de contexto: @cursor con condición de unidad',
        description: '@cursor apunta a una coordenada del suelo y no a una unidad viva. Las condiciones como [harm, help, dead, exists] serán ignoradas o fallarán en WoW.',
        suggestion: 'Elimina las comprobaciones de objetivo cuando uses @cursor.'
      });
    }
  }

  const isImpossible = issues.some(i => i.severity === 'error');
  const isValid = issues.length === 0;
  const humanDescription = translateBracketToHuman(bracket);

  return {
    isValid,
    isImpossible,
    issues,
    humanDescription
  };
}

/**
 * Validates all blocks in a macro and aggregates warnings/errors
 */
export function validateMacroBlocks(blocks: MacroBlock[]): ConditionIssue[] {
  const issues: ConditionIssue[] = [];

  blocks.forEach((block, bIdx) => {
    if (!block.enabled || !block.brackets) return;

    block.brackets.forEach((br, brIdx) => {
      const result = validateBracket(br);
      result.issues.forEach(issue => {
        issues.push({
          ...issue,
          title: `Línea ${bIdx + 1} (${block.command}), Paso ${brIdx + 1}: ${issue.title}`
        });
      });
    });
  });

  return issues;
}
