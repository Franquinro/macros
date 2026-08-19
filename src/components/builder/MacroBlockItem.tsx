import React, { useState, useRef, useEffect } from 'react';
import { MacroBlock } from '../../types/macro';
import { formatBracket } from '../../utils/macroGenerator';
import { validateBracket } from '../../utils/conditionValidator';
import { searchCoaSpells } from '../../data/coaSpells';
import { 
  ChevronUp, 
  ChevronDown, 
  SlidersHorizontal, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface MacroBlockItemProps {
  block: MacroBlock;
  index: number;
  totalBlocks: number;
  onUpdateBlock: (updated: MacroBlock) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (block: MacroBlock) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onOpenConditions: (block: MacroBlock) => void;
  onOpenCastSequence?: (block: MacroBlock) => void;
}

export const MacroBlockItem: React.FC<MacroBlockItemProps> = ({
  block,
  index,
  totalBlocks,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveUp,
  onMoveDown,
  onOpenConditions,
  onOpenCastSequence
}) => {
  const [showComment, setShowComment] = useState(!!block.comment);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string; className?: string; icon?: string; ranks: string[] }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSuggestions && block.argument && block.argument.trim().length >= 2) {
      const results = searchCoaSpells(block.argument, 8);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [block.argument, showSuggestions]);

  const handleArgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateBlock({
      ...block,
      argument: e.target.value
    });
    setShowSuggestions(true);
  };

  const handleSelectSpell = (spellName: string) => {
    onUpdateBlock({
      ...block,
      argument: spellName
    });
    setShowSuggestions(false);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateBlock({
      ...block,
      comment: e.target.value
    });
  };

  const handleToggleEnabled = () => {
    onUpdateBlock({
      ...block,
      enabled: !block.enabled
    });
  };

  const getCommandColor = (cmd: string) => {
    switch (cmd) {
      case '#showtooltip':
      case '#show':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case '/cast':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case '/castsequence':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case '/use':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case '/cancelaura':
      case '/cancelform':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case '/stopcasting':
      case '/stopattack':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case '/startattack':
        return 'text-lime-400 bg-lime-500/10 border-lime-500/30';
      case '/equip':
      case '/equipslot':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case '/target':
      case '/tar':
      case '/focus':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case '/petattack':
      case '/petfollow':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case '/ascension':
        return 'text-amber-500 bg-amber-500/20 border-amber-500/50';
      default:
        return 'text-gray-300 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 ${
        block.enabled
          ? 'bg-[#151c27] border-[#253243] hover:border-[#38485e] shadow-md'
          : 'bg-[#0f141c]/60 border-[#1a222e] opacity-50'
      }`}
    >
      {/* Block Main Row */}
      <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Left: Drag Handle, Number & Command */}
        <div className="flex items-center space-x-2">
          {/* Move Up / Down */}
          <div className="flex flex-col space-y-0.5">
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="text-gray-500 hover:text-amber-400 disabled:opacity-20 transition"
              title="Mover arriba"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === totalBlocks - 1}
              className="text-gray-500 hover:text-amber-400 disabled:opacity-20 transition"
              title="Mover abajo"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Index count */}
          <span className="text-[11px] font-mono text-gray-500 w-4 text-center">
            {index + 1}
          </span>

          {/* Command Pill */}
          <span
            className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border shadow-sm ${getCommandColor(
              block.command
            )}`}
          >
            {block.command}
          </span>
        </div>

        {/* Middle: Conditions & Argument Input */}
        <div className="flex-1 flex flex-wrap items-center gap-2">
          
          {/* Conditions Badges */}
          {block.brackets && block.brackets.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1">
              {block.brackets.map((br, bIdx) => {
                const brVal = validateBracket(br);
                return (
                  <button
                    key={br.id || bIdx}
                    onClick={() => onOpenConditions(block)}
                    className={`font-mono text-[11px] px-2 py-0.5 rounded transition flex items-center space-x-1 shadow-sm ${
                      brVal.isImpossible
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/60 shadow-glow-blood animate-pulse'
                        : brVal.issues.length > 0
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/60'
                        : 'bg-[#1e2a3b] hover:bg-[#27384f] text-sky-300 border border-sky-500/30'
                    }`}
                    title={brVal.issues.length > 0 ? brVal.issues.map(i => i.title).join(' | ') : 'Editar condición'}
                  >
                    <span>{formatBracket(br)}</span>
                    {brVal.isImpossible && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Add / Edit Condition Button */}
          <button
            onClick={() => onOpenConditions(block)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-medium border transition ${
              block.brackets && block.brackets.length > 0
                ? 'bg-[#182332] text-amber-300 border-amber-500/30 hover:bg-[#223044]'
                : 'bg-[#141c27] text-gray-400 border-dashed border-[#2f3e52] hover:text-gray-200 hover:border-gray-500'
            }`}
            title="Añadir modificadores [@mouseover, mod:shift, etc.]"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>
              {block.brackets && block.brackets.length > 0 ? 'Modificadores' : '+ Condición'}
            </span>
          </button>

          {/* Castsequence assistant button if applicable */}
          {block.command === '/castsequence' && onOpenCastSequence && (
            <button
              onClick={() => onOpenCastSequence(block)}
              className="flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-semibold border bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30 transition shadow-sm"
              title="Abrir editor visual de secuencia de habilidades"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Rotación</span>
            </button>
          )}

          {/* Argument Input with CoA Spell Autocomplete */}
          <div className="relative flex-1 min-w-[180px]" ref={dropdownRef}>
            <input
              type="text"
              value={block.argument}
              onChange={handleArgChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder={
                block.command === '/castsequence'
                  ? 'reset=combat/target/6 Spell1, Spell2'
                  : 'Nombre de habilidad, ítem o ranura (ej. Pyroblast, Surging Tonic, 13)'
              }
              className="w-full bg-[#0c1017] border border-[#263345] focus:border-amber-500/60 rounded-lg px-2.5 py-1 text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-mono transition"
            />

            {/* CoA Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-[#0d131c] border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                <div className="px-2.5 py-1 bg-[#141b26] border-b border-[#232f40] flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Habilidades CoA ({suggestions.length})
                  </span>
                  <span className="text-gray-400 font-normal">Clic para autocompletar</span>
                </div>
                <div className="p-1 space-y-0.5">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSpell(s.name);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-500/20 hover:text-amber-200 text-gray-200 text-xs flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium font-mono group-hover:text-amber-300">
                          {s.name}
                        </span>
                        {s.ranks && s.ranks.length > 0 && (
                          <span className="text-[10px] text-gray-500 font-sans">
                            ({s.ranks.length} {s.ranks.length === 1 ? 'rango' : 'rangos'})
                          </span>
                        )}
                      </div>
                      {s.className && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
                          {s.className}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions (Disable, Comment, Duplicate, Delete) */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 self-end sm:self-center">
          
          {/* Toggle Comment */}
          <button
            onClick={() => setShowComment(!showComment)}
            className={`p-1.5 rounded-md transition ${
              showComment || block.comment
                ? 'text-sky-400 bg-sky-500/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#1f2b3b]'
            }`}
            title="Añadir nota / comentario a la línea"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Enable / Disable */}
          <button
            onClick={handleToggleEnabled}
            className={`p-1.5 rounded-md transition ${
              block.enabled
                ? 'text-gray-400 hover:text-gray-200 hover:bg-[#1f2b3b]'
                : 'text-amber-500 bg-amber-500/10'
            }`}
            title={block.enabled ? 'Desactivar bloque' : 'Activar bloque'}
          >
            {block.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Duplicate Block */}
          <button
            onClick={() => onDuplicateBlock(block)}
            className="p-1.5 rounded-md text-gray-500 hover:text-sky-400 hover:bg-[#1f2b3b] transition"
            title="Duplicar bloque"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete Block */}
          <button
            onClick={() => onDeleteBlock(block.id)}
            className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Eliminar bloque"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Optional Comment Input */}
      {showComment && (
        <div className="px-3 pb-2.5 pt-0 flex items-center space-x-2">
          <span className="text-[10px] font-mono text-gray-500">--</span>
          <input
            type="text"
            value={block.comment || ''}
            onChange={handleCommentChange}
            placeholder="Nota explicativa (ej. 'Cancela Hand of Protection')"
            className="flex-1 bg-[#0b0e14] border border-[#202a38] rounded px-2 py-0.5 text-[11px] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
      )}
    </div>
  );
};
