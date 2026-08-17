import { MacroBlock, ConditionBracket, ConditionRule, TargetSelector } from '../types/macro';

/**
 * Parses a single bracket content like "@mouseover,help,nodead,mod:shift" into a ConditionBracket
 */
export function parseBracketContent(content: string, bracketId: string): ConditionBracket {
  const parts = content.split(',').map(s => s.trim()).filter(Boolean);
  let target: TargetSelector | undefined = undefined;
  const rules: ConditionRule[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('@') || part.startsWith('target=')) {
      const targetVal = part.startsWith('@') ? part : `@${part.replace('target=', '')}`;
      target = targetVal as TargetSelector;
      continue;
    }

    // Check rules
    if (part === 'harm') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'harm', isNegated: false });
    } else if (part === 'help' || part === 'noharm') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'harm', isNegated: true });
    } else if (part === 'nodead') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'nodead', isNegated: false });
    } else if (part === 'dead') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'nodead', isNegated: true });
    } else if (part === 'exists') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'exists', isNegated: false });
    } else if (part === 'noexists') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'exists', isNegated: true });
    } else if (part === 'combat') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'combat', isNegated: false });
    } else if (part === 'nocombat') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'combat', isNegated: true });
    } else if (part === 'stealth') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'stealth', isNegated: false });
    } else if (part === 'nostealth') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'stealth', isNegated: true });
    } else if (part === 'nomod' || part === 'nomodifier') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'mod', isNegated: true });
    } else if (part.startsWith('mod:') || part.startsWith('modifier:')) {
      const val = part.split(':')[1] || '';
      rules.push({ id: `r_${bracketId}_${i}`, type: 'mod', value: val, isNegated: false });
    } else if (part === 'mod') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'mod', value: '', isNegated: false });
    } else if (part.startsWith('form:') || part.startsWith('stance:')) {
      const val = part.split(':')[1] || '1';
      rules.push({ id: `r_${bracketId}_${i}`, type: 'form', value: val, isNegated: false });
    } else if (part.startsWith('noform:') || part.startsWith('nostance:')) {
      const val = part.split(':')[1] || '1';
      rules.push({ id: `r_${bracketId}_${i}`, type: 'form', value: val, isNegated: true });
    } else if (part.startsWith('equipped:') || part.startsWith('worn:')) {
      const val = part.split(':')[1] || '';
      rules.push({ id: `r_${bracketId}_${i}`, type: 'equipped', value: val, isNegated: false });
    } else if (part.startsWith('noequipped:') || part.startsWith('noworn:')) {
      const val = part.split(':')[1] || '';
      rules.push({ id: `r_${bracketId}_${i}`, type: 'equipped', value: val, isNegated: true });
    } else if (part.startsWith('channeling:') || part === 'channeling') {
      const val = part.includes(':') ? part.split(':')[1] : '';
      rules.push({ id: `r_${bracketId}_${i}`, type: 'channeling', value: val, isNegated: false });
    } else if (part.startsWith('nochanneling:') || part === 'nochanneling') {
      const val = part.includes(':') ? part.split(':')[1] : '';
      rules.push({ id: `r_${bracketId}_${i}`, type: 'channeling', value: val, isNegated: true });
    } else if (part.startsWith('btn:') || part.startsWith('button:')) {
      const val = part.split(':')[1] || '1';
      rules.push({ id: `r_${bracketId}_${i}`, type: 'btn', value: val });
    } else if (part === 'flyable') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'flyable', isNegated: false });
    } else if (part === 'noflyable') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'flyable', isNegated: true });
    } else if (part === 'mounted') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'mounted', isNegated: false });
    } else if (part === 'nomounted') {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'mounted', isNegated: true });
    } else {
      rules.push({ id: `r_${bracketId}_${i}`, type: 'custom', value: part });
    }
  }

  return {
    id: bracketId,
    target,
    rules
  };
}

/**
 * Parses raw WoW macro text and reconstructs MacroBlock[] structure
 */
export function parseMacroText(rawText: string): MacroBlock[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks: MacroBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const blockId = `block_${Date.now()}_${i}`;

    // Check if line is a comment
    if (line.startsWith('--') || line.startsWith('//')) {
      continue;
    }

    // Extract command (first word)
    const match = line.match(/^(\/[a-zA-Z0-9]+|#[a-zA-Z0-9]+)\s*(.*)$/);
    if (!match) {
      // Fallback block
      blocks.push({
        id: blockId,
        command: '/cast',
        brackets: [],
        argument: line,
        enabled: true
      });
      continue;
    }

    const command = match[1];
    const rest = match[2] || '';

    // Parse brackets e.g. [@mouseover,harm][@target,harm] Spell Name
    const brackets: ConditionBracket[] = [];
    let currentRest = rest;
    let bracketIndex = 0;

    while (currentRest.startsWith('[')) {
      const closeIndex = currentRest.indexOf(']');
      if (closeIndex === -1) break;

      const bracketContent = currentRest.substring(1, closeIndex);
      brackets.push(parseBracketContent(bracketContent, `br_${blockId}_${bracketIndex}`));
      bracketIndex++;
      currentRest = currentRest.substring(closeIndex + 1).trim();
    }

    blocks.push({
      id: blockId,
      command,
      brackets,
      argument: currentRest,
      enabled: true
    });
  }

  return blocks;
}
