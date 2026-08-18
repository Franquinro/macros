import React, { useState } from 'react';
import { MacroData, MacroValidation } from '../../types/macro';
import { generateMacro } from '../../utils/macroGenerator';
import { compressMacroCode, CompressionResult } from '../../utils/macroCompressor';
import { MacroCodeHighlighter } from './MacroCodeHighlighter';
import { 
  Copy, 
  Check, 
  AlertTriangle, 
  FileCode, 
  Info, 
  Code2, 
  Scissors,
  Zap,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MacroPreviewProps {
  macro: MacroData;
  onOpenImportText: () => void;
}

export const MacroPreview: React.FC<MacroPreviewProps> = ({
  macro,
  onOpenImportText
}) => {
  const [includeComments, setIncludeComments] = useState(false);
  const [isCompressed, setIsCompressed] = useState(false);
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedSplitIndex, setCopiedSplitIndex] = useState<number | null>(null);

  const validation: MacroValidation = generateMacro(macro.blocks, includeComments);
  const compression: CompressionResult = compressMacroCode(macro.blocks, {
    useInsteadOfCast: true,
    shortenTargetCommands: true,
    compactBrackets: true,
    stripComments: !includeComments,
    stripRedundantShowtooltip: false
  });

  const activeCode = isCompressed ? compression.compressedCode : validation.cleanCode;
  const activeChars = isCompressed ? compression.compressedChars : validation.charCount;
  const isOverLimit = activeChars > 255;

  const handleCopy = (text: string, isSplit: boolean = false, splitIdx: number = 0) => {
    if (!text) return;
    navigator.clipboard.writeText(text);

    if (isSplit) {
      setCopiedSplitIndex(splitIdx);
      setTimeout(() => setCopiedSplitIndex(null), 2000);
    } else {
      setCopiedMain(true);
      setTimeout(() => setCopiedMain(false), 2000);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f3b006', '#38bdf8', '#22c55e', '#a855f7']
      });
    } catch (e) {
      // ignore
    }
  };

  // Color for 255 character gauge
  const getProgressColor = () => {
    if (activeChars > 255) return 'bg-red-500 shadow-glow-blood';
    if (activeChars > 210) return 'bg-amber-500 shadow-glow-gold';
    return 'bg-emerald-500 shadow-glow-fel';
  };

  const percentage = Math.min(100, Math.round((activeChars / 255) * 100));

  return (
    <div className="bg-[#121820] border border-[#232c37] rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      
      {/* Header */}
      <div className="p-3.5 border-b border-[#232c37] bg-[#161f2b]/70 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider font-display">
            Código WoW 3.3.5a
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Shorten / Compression Toggle */}
          <button
            onClick={() => setIsCompressed(!isCompressed)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center space-x-1.5 transition ${
              isCompressed
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-glow-gold'
                : 'bg-[#172230] border-[#293a4f] text-gray-400 hover:text-gray-200 hover:bg-[#1f2e42]'
            }`}
            title="Optimizar y acortar macro (/cast -> /use, /target -> /tar, etc.) para ahorrar caracteres"
          >
            <Zap className={`w-3.5 h-3.5 ${isCompressed ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}`} />
            <span>{isCompressed ? 'Comprimido' : 'Comprimir'}</span>
            {isCompressed && compression.savedChars > 0 && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-mono font-bold">
                -{compression.savedChars}
              </span>
            )}
          </button>

          <button
            onClick={onOpenImportText}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1 transition px-2 py-1 rounded bg-[#16202c] hover:bg-[#1d2b3c] border border-[#26374a]"
            title="Importar macro existente pegando texto"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Importar</span>
          </button>
        </div>
      </div>

      {/* 255 Character Counter Gauge */}
      <div className="px-4 py-2.5 bg-[#0d121a] border-b border-[#202936]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-medium">Límite de Caracteres:</span>
            <span className="font-mono font-bold text-gray-200">
              {activeChars} / 255
            </span>
            {isCompressed && compression.savedChars > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Ahorro: -{compression.savedChars} chars ({compression.savingsPercent}%)
              </span>
            )}
          </div>
          {isOverLimit ? (
            <span className="text-red-400 font-bold flex items-center space-x-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>+{activeChars - 255} sobre el límite</span>
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">
              {255 - activeChars} restantes
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[#1b2533] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Code Viewer with Syntax Highlighter */}
      <div className="flex-1 p-3 bg-[#080b0f] flex flex-col justify-between overflow-y-auto">
        <div className="space-y-2">
          
          <div className="relative font-mono text-xs bg-[#0d1117] p-3 rounded-lg border border-[#232c37] overflow-x-auto min-h-[160px]">
            <MacroCodeHighlighter code={activeCode} />
          </div>

          {/* Applied optimizations pill list if compressed */}
          {isCompressed && compression.optimizationsApplied.length > 0 && (
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 space-y-0.5">
              <div className="font-bold flex items-center space-x-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Optimizaciones de compresión aplicadas:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-300 font-mono">
                {compression.optimizationsApplied.map((opt, oIdx) => (
                  <li key={oIdx}>{opt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings & Tips */}
          {validation.warnings.length > 0 && (
            <div className="space-y-1">
              {validation.warnings.map((warn, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-[11px] flex items-start space-x-2 shadow-sm"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{warn}</span>
                </div>
              ))}
            </div>
          )}

          {validation.tips.length > 0 && (
            <div className="space-y-1">
              {validation.tips.map((tip, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-sky-950/30 border border-sky-500/30 text-sky-200 text-[11px] flex items-start space-x-2"
                >
                  <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Split Macros Preview if > 255 chars */}
          {isOverLimit && validation.splitMacros && validation.splitMacros.length > 1 && (
            <div className="mt-3 p-3 bg-[#131b26] border border-amber-500/40 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-xs">
                <Scissors className="w-4 h-4" />
                <span>División Automática en Múltiples Macros (&lt;255 chars)</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Dado que WoW limita las macros estándar a 255 caracteres, se ha dividido en las siguientes partes:
              </p>

              {validation.splitMacros.map((chunk, idx) => (
                <div key={idx} className="p-2 bg-[#0a0e14] rounded-lg border border-[#253243] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono text-amber-300 uppercase">
                      Parte {idx + 1} ({chunk.length} caracteres)
                    </span>
                    <button
                      onClick={() => handleCopy(chunk, true, idx)}
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-[10px] font-bold transition flex items-center space-x-1"
                    >
                      {copiedSplitIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSplitIndex === idx ? 'Copiado' : 'Copiar Parte ' + (idx + 1)}</span>
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap">{chunk}</pre>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Copy & Controls Bottom Bar */}
        <div className="pt-3 mt-2 border-t border-[#1e2736] space-y-2">
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-[11px] text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-[#0a0e14] border-[#2b3848] text-amber-500 focus:ring-0"
              />
              <span>Incluir notas / comentarios</span>
            </label>

            <span className="text-[10px] text-gray-500">Formato compatible WoW 3.3.5a</span>
          </div>

          {/* Main Copy Button */}
          <button
            onClick={() => handleCopy(activeCode)}
            disabled={!activeCode}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg ${
              copiedMain
                ? 'bg-emerald-500 text-black shadow-glow-fel'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-glow-gold'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {copiedMain ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡Copiado al Portapapeles! Listo para WoW</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2.5]" />
                <span>Copiar Macro para el Juego (Ctrl+V)</span>
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
};
