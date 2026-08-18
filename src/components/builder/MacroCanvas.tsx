import React from 'react';
import { MacroData, MacroBlock, ConditionBracket } from '../../types/macro';
import { MacroBlockItem } from './MacroBlockItem';
import { CommandDefinition } from '../../data/commandsData';
import { 
  Sparkles, 
  Layers, 
  Plus, 
  Trash2, 
  FileText, 
  Tag, 
  HelpCircle,
  Zap,
  Flame,
  ShieldAlert,
  Sliders,
  RotateCcw,
  VolumeX
} from 'lucide-react';

interface MacroCanvasProps {
  macro: MacroData;
  onUpdateMacro: (updated: MacroData) => void;
  onOpenConditions: (block: MacroBlock) => void;
  onOpenCastSequence: (block: MacroBlock) => void;
  onQuickAddBlock: (cmd: string, arg?: string) => void;
}

export const MacroCanvas: React.FC<MacroCanvasProps> = ({
  macro,
  onUpdateMacro,
  onOpenConditions,
  onOpenCastSequence,
  onQuickAddBlock
}) => {
  const handleUpdateBlock = (updatedBlock: MacroBlock) => {
    const newBlocks = macro.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b);
    onUpdateMacro({ ...macro, blocks: newBlocks, updatedAt: Date.now() });
  };

  const handleDeleteBlock = (blockId: string) => {
    const newBlocks = macro.blocks.filter(b => b.id !== blockId);
    onUpdateMacro({ ...macro, blocks: newBlocks, updatedAt: Date.now() });
  };

  const handleDuplicateBlock = (block: MacroBlock) => {
    const newBlock: MacroBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `block_${Date.now()}_${Math.random()}`
    };
    const index = macro.blocks.findIndex(b => b.id === block.id);
    const newBlocks = [...macro.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onUpdateMacro({ ...macro, blocks: newBlocks, updatedAt: Date.now() });
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newBlocks = [...macro.blocks];
    const temp = newBlocks[index - 1];
    newBlocks[index - 1] = newBlocks[index];
    newBlocks[index] = temp;
    onUpdateMacro({ ...macro, blocks: newBlocks, updatedAt: Date.now() });
  };

  const handleMoveDown = (index: number) => {
    if (index >= macro.blocks.length - 1) return;
    const newBlocks = [...macro.blocks];
    const temp = newBlocks[index + 1];
    newBlocks[index + 1] = newBlocks[index];
    newBlocks[index] = temp;
    onUpdateMacro({ ...macro, blocks: newBlocks, updatedAt: Date.now() });
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que deseas vaciar todos los bloques de esta macro?')) {
      onUpdateMacro({ ...macro, blocks: [], updatedAt: Date.now() });
    }
  };

  return (
    <div className="bg-[#121820] border border-[#232c37] rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      
      {/* Canvas Header: Macro Name & Metadata */}
      <div className="p-4 border-b border-[#232c37] bg-[#161f2b]/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Macro Name */}
          <div className="flex-1">
            <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Nombre de la Macro
            </label>
            <input
              type="text"
              value={macro.name}
              onChange={(e) => onUpdateMacro({ ...macro, name: e.target.value, updatedAt: Date.now() })}
              placeholder="Ej: Smart Heal Focus, Burst CoA..."
              className="w-full bg-[#0a0e14] border border-[#2a3749] focus:border-amber-500 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
          </div>

          {/* Category Selector */}
          <div className="w-full sm:w-48">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Categoría
            </label>
            <select
              value={macro.category}
              onChange={(e) => onUpdateMacro({ ...macro, category: e.target.value as any, updatedAt: Date.now() })}
              className="w-full bg-[#0a0e14] border border-[#2a3749] rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
            >
              <option value="general">General / Utilidad</option>
              <option value="pvp">PvP & Arenas</option>
              <option value="pve">PvE & Bandas</option>
              <option value="ascension_coa">Ascension - CoA</option>
              <option value="qol">Quality of Life</option>
            </select>
          </div>

        </div>

        {/* Macro Description */}
        <div>
          <input
            type="text"
            value={macro.description || ''}
            onChange={(e) => onUpdateMacro({ ...macro, description: e.target.value, updatedAt: Date.now() })}
            placeholder="Descripción corta de lo que hace esta macro..."
            className="w-full bg-[#0c1017] border border-[#222d3d] focus:border-sky-500/50 rounded-md px-3 py-1 text-xs text-gray-400 placeholder-gray-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="px-4 py-2 bg-[#0e131b] border-b border-[#202936] flex items-center justify-between overflow-x-auto">
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] font-semibold text-gray-400 mr-1 hidden sm:inline">
            Insertar Rápido:
          </span>
          <button
            onClick={() => onQuickAddBlock('#showtooltip')}
            className="px-2 py-1 rounded bg-[#161f2b] hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono transition"
          >
            #showtooltip
          </button>
          <button
            onClick={() => onQuickAddBlock('/cast', 'Spell Name')}
            className="px-2 py-1 rounded bg-[#161f2b] hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-mono transition"
          >
            /cast
          </button>
          <button
            onClick={() => onQuickAddBlock('/castsequence', 'reset=combat/target/6 Spell1, Spell2')}
            className="px-2 py-1 rounded bg-[#161f2b] hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono transition"
          >
            /castsequence
          </button>
          <button
            onClick={() => onQuickAddBlock('/use', '13')}
            className="px-2 py-1 rounded bg-[#161f2b] hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono transition"
          >
            /use 13 (Trinket)
          </button>
          <button
            onClick={() => onQuickAddBlock('/startattack')}
            className="px-2 py-1 rounded bg-[#161f2b] hover:bg-lime-500/20 text-lime-300 border border-lime-500/30 text-[11px] font-mono transition"
          >
            /startattack
          </button>
          <button
            onClick={() => onQuickAddBlock('/stopcasting')}
            className="px-2 py-1 rounded bg-[#161f2b] hover:bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-mono transition"
          >
            /stopcasting
          </button>
          <button
            onClick={() => onQuickAddBlock('/run', 'UIErrorsFrame:Clear()')}
            className="px-2 py-1 rounded bg-[#161f2b] hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[11px] font-mono transition flex items-center space-x-1"
            title="Limpia texto de error en pantalla al spamear la macro"
          >
            <ShieldAlert className="w-3 h-3 text-pink-400" />
            <span>🔇 Anti-Error</span>
          </button>
        </div>

        {macro.blocks.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[11px] text-gray-500 hover:text-red-400 flex items-center space-x-1 transition ml-2 whitespace-nowrap"
            title="Borrar todos los bloques"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden md:inline">Vaciar</span>
          </button>
        )}
      </div>

      {/* Blocks List */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)]">
        {macro.blocks.length === 0 ? (
          <div className="p-8 my-6 text-center border-2 border-dashed border-[#232f3f] rounded-2xl bg-[#0f141c]/50">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-200 font-display">
              Tu macro está vacía
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 mb-4">
              Selecciona comandos desde el catálogo de la izquierda o pulsa los botones de inserción rápida para armar tu super macro.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => onQuickAddBlock('#showtooltip')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition"
              >
                + Añadir #showtooltip
              </button>
              <button
                onClick={() => onQuickAddBlock('/cast', 'Flash of Light')}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-semibold hover:bg-sky-500/30 transition"
              >
                + Añadir /cast
              </button>
              <button
                onClick={() => onQuickAddBlock('/castsequence', 'reset=combat/target/6 Spell1, Spell2')}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold hover:bg-indigo-500/30 transition"
              >
                + Añadir /castsequence
              </button>
            </div>
          </div>
        ) : (
          macro.blocks.map((block, idx) => (
            <MacroBlockItem
              key={block.id}
              block={block}
              index={idx}
              totalBlocks={macro.blocks.length}
              onUpdateBlock={handleUpdateBlock}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onOpenConditions={onOpenConditions}
              onOpenCastSequence={onOpenCastSequence}
            />
          ))
        )}
      </div>

    </div>
  );
};
