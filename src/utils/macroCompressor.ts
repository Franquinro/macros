import { MacroBlock, ConditionBracket } from '../types/macro';
import { formatBracket } from './macroGenerator';

export interface CompressOptions {
  useInsteadOfCast?: boolean;     // Replace /cast with /use (saves 1 char per line)
  shortenTargetCommands?: boolean; // Replace /target with /tar
  compactBrackets?: boolean;       // Remove any whitespace inside brackets
  stripComments?: boolean;         // Remove comment lines
  stripRedundantShowtooltip?: boolean; // Remove #showtooltip if first action specifies spell
}

export interface CompressionResult {
  originalCode: string;
  compressedCode: string;
  originalChars: number;
  compressedChars: number;
  savedChars: number;
  savingsPercent: number;
  optimizationsApplied: string[];
}

/**
 * Optimizes and shortens WoW 3.3.5a macro code to fit within the strict 255 character limit.
 */
export function compressMacroCode(
  blocks: MacroBlock[],
  options: CompressOptions = {
    useInsteadOfCast: true,
    shortenTargetCommands: true,
    compactBrackets: true,
    stripComments: true,
    stripRedundantShowtooltip: false
  }
): CompressionResult {
  const activeBlocks = blocks.filter(b => b.enabled);
  const optimizations: string[] = [];

  // Generate standard uncompressed version first
  const originalLines: string[] = [];
  for (const b of activeBlocks) {
    let line = b.command.trim();
    if (b.brackets && b.brackets.length > 0) {
      line += ' ' + b.brackets.map(formatBracket).join('');
    }
    if (b.argument && b.argument.trim()) {
      line += ' ' + b.argument.trim();
    }
    if (b.comment) {
      originalLines.push(`-- ${b.comment}`);
    }
    originalLines.push(line);
  }
  const originalCode = originalLines.join('\n');
  const originalChars = originalCode.length;

  // Generate compressed version
  const compressedLines: string[] = [];
  let castReplacedCount = 0;
  let targetReplacedCount = 0;

  for (let i = 0; i < activeBlocks.length; i++) {
    const b = activeBlocks[i];
    let cmd = b.command.trim();

    // Check #showtooltip redundancy
    if (options.stripRedundantShowtooltip && i === 0 && (cmd === '#showtooltip' || cmd === '#show') && !b.argument) {
      const nextBlock = activeBlocks[1];
      if (nextBlock && (nextBlock.command === '/cast' || nextBlock.command === '/use')) {
        optimizations.push('Eliminado #showtooltip redundante (el juego ya muestra el primer hechizo automáticamente)');
        continue;
      }
    }

    // 1. /cast -> /use optimization
    if (options.useInsteadOfCast && cmd === '/cast') {
      cmd = '/use';
      castReplacedCount++;
    }

    // 2. /target -> /tar optimization
    if (options.shortenTargetCommands && cmd === '/target') {
      cmd = '/tar';
      targetReplacedCount++;
    }

    // 3. Compact brackets
    let bracketsText = '';
    if (b.brackets && b.brackets.length > 0) {
      bracketsText = b.brackets.map(br => formatBracket(br)).join('');
    }

    // 4. Assemble line
    let line = cmd;
    if (bracketsText) {
      if (b.argument && b.argument.trim()) {
        line = `${cmd} ${bracketsText} ${b.argument.trim()}`;
      } else {
        line = `${cmd} ${bracketsText}`;
      }
    } else {
      if (b.argument && b.argument.trim()) {
        line = `${cmd} ${b.argument.trim()}`;
      } else {
        line = cmd;
      }
    }

    // 5. Comments
    if (!options.stripComments && b.comment) {
      compressedLines.push(`-- ${b.comment}`);
    }

    compressedLines.push(line);
  }

  if (castReplacedCount > 0) {
    optimizations.push(`Sustituido /cast por /use (${castReplacedCount} veces) -> -${castReplacedCount} caracteres`);
  }
  if (targetReplacedCount > 0) {
    optimizations.push(`Abreviado /target por /tar (${targetReplacedCount} veces) -> -${targetReplacedCount * 3} caracteres`);
  }
  if (options.stripComments) {
    const commentsCount = activeBlocks.filter(b => !!b.comment).length;
    if (commentsCount > 0) {
      optimizations.push(`Omitidas notas y comentarios -> ahorro adicional`);
    }
  }

  const compressedCode = compressedLines.join('\n');
  const compressedChars = compressedCode.length;
  const savedChars = Math.max(0, originalChars - compressedChars);
  const savingsPercent = originalChars > 0 ? Math.round((savedChars / originalChars) * 100) : 0;

  return {
    originalCode,
    compressedCode,
    originalChars,
    compressedChars,
    savedChars,
    savingsPercent,
    optimizationsApplied: optimizations
  };
}
