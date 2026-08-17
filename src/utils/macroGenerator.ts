import { MacroBlock, MacroValidation, ConditionBracket, ConditionRule } from '../types/macro';

/**
 * Formats a single condition rule into 3.3.5a syntax
 */
export function formatRule(rule: ConditionRule): string {
  switch (rule.type) {
    case 'mod':
      if (rule.isNegated) return 'nomod';
      return rule.value ? `mod:${rule.value}` : 'mod';
    case 'harm':
      return rule.isNegated ? 'help' : 'harm';
    case 'nodead':
      return rule.isNegated ? 'dead' : 'nodead';
    case 'exists':
      return rule.isNegated ? 'noexists' : 'exists';
    case 'combat':
      return rule.isNegated ? 'nocombat' : 'combat';
    case 'stealth':
      return rule.isNegated ? 'nostealth' : 'stealth';
    case 'form':
    case 'stance':
      if (rule.isNegated) {
        return rule.value !== undefined ? `noform:${rule.value}` : 'noform';
      }
      return rule.value !== undefined ? `form:${rule.value}` : 'form';
    case 'equipped':
      return rule.isNegated ? `noequipped:${rule.value || ''}` : `equipped:${rule.value || ''}`;
    case 'channeling':
      if (rule.isNegated) {
        return rule.value ? `nochanneling:${rule.value}` : 'nochanneling';
      }
      return rule.value ? `channeling:${rule.value}` : 'channeling';
    case 'btn':
      return `btn:${rule.value || '1'}`;
    case 'flyable':
      return rule.isNegated ? 'noflyable' : 'flyable';
    case 'mounted':
      return rule.isNegated ? 'nomounted' : 'mounted';
    case 'custom':
      return rule.value || '';
    default:
      return rule.value ? `${rule.type}:${rule.value}` : rule.type;
  }
}

/**
 * Formats a single bracket group e.g. [@mouseover,help,nodead]
 */
export function formatBracket(bracket: ConditionBracket): string {
  const parts: string[] = [];

  if (bracket.target && bracket.target !== '@none') {
    parts.push(bracket.target);
  }

  for (const rule of bracket.rules) {
    const formatted = formatRule(rule);
    if (formatted) {
      parts.push(formatted);
    }
  }

  // If no parts inside, empty bracket [] represents unconditional fallback
  return `[${parts.join(',')}]`;
}

/**
 * Formats a single MacroBlock into one or more lines of WoW macro text
 */
export function formatBlock(block: MacroBlock, includeComments: boolean = false): string {
  if (!block.enabled) return '';

  let line = '';
  const command = block.command.trim();

  // If there's a comment and requested, prepend it
  const commentLine = includeComments && block.comment ? `-- ${block.comment}\n` : '';

  if (block.brackets && block.brackets.length > 0) {
    const bracketsText = block.brackets.map(formatBracket).join('');
    if (block.argument && block.argument.trim()) {
      line = `${command} ${bracketsText} ${block.argument.trim()}`;
    } else {
      line = `${command} ${bracketsText}`;
    }
  } else {
    if (block.argument && block.argument.trim()) {
      line = `${command} ${block.argument.trim()}`;
    } else {
      line = command;
    }
  }

  return commentLine + line;
}

/**
 * Generates full macro text and validates 3.3.5a constraints (255 characters limit)
 */
export function generateMacro(blocks: MacroBlock[], includeComments: boolean = false): MacroValidation {
  const activeBlocks = blocks.filter(b => b.enabled);
  const lines: string[] = [];

  for (const block of activeBlocks) {
    const line = formatBlock(block, includeComments);
    if (line) {
      lines.push(line);
    }
  }

  const cleanCode = lines.join('\n');
  const charCount = cleanCode.length;
  const isOverLimit = charCount > 255;

  const warnings: string[] = [];
  const tips: string[] = [];

  if (charCount === 0) {
    warnings.push('La macro está vacía. Añade al menos un bloque de comando.');
  }

  if (isOverLimit) {
    warnings.push(`¡La macro supera el límite de 255 caracteres de WoW 3.3.5a por ${charCount - 255} caracteres!`);
    tips.push('Consejo: Puedes usar el botón de dividir en múltiples macros o eliminar espacios/nombres redundantes.');
  }

  // Check if multiple /cast commands without instant cast or conditions
  const castBlocks = activeBlocks.filter(b => b.command === '/cast' || b.command === '/castsequence');
  if (castBlocks.length > 1) {
    tips.push('Nota: En WoW 3.3.5a, solo se puede lanzar un hechizo con GCD por pulsación a menos que uses /castsequence o hechizos fuera de GCD.');
  }

  // Split macros if over 255 limit
  let splitMacros: string[] | undefined = undefined;
  if (isOverLimit) {
    splitMacros = splitMacroLines(lines);
  }

  return {
    charCount,
    isOverLimit,
    warnings,
    tips,
    cleanCode,
    formattedCode: cleanCode,
    splitMacros
  };
}

/**
 * Splits a list of macro lines into chunks under 255 characters
 */
function splitMacroLines(lines: string[]): string[] {
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const line of lines) {
    const lineLen = line.length + (currentChunk.length > 0 ? 1 : 0);
    if (currentLength + lineLen <= 255) {
      currentChunk.push(line);
      currentLength += lineLen;
    } else {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
      }
      currentChunk = [line];
      currentLength = line.length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}
