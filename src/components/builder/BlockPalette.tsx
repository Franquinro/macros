import React, { useState } from 'react';
import { COMMANDS_CATALOG, CommandDefinition } from '../../data/commandsData';
import { CommandCategory } from '../../types/macro';
import { 
  Sparkles, 
  Search, 
  Plus, 
  ShieldAlert, 
  Crosshair, 
  Dog, 
  MessageSquare, 
  Wrench, 
  Zap, 
  Flame, 
  Info,
  Layers
} from 'lucide-react';

interface BlockPaletteProps {
  onAddCommand: (commandDef: CommandDefinition) => void;
}

const CATEGORY_TABS: { key: 'all' | CommandCategory; label: string; icon: any }[] = [
  { key: 'all', label: 'Todos', icon: Layers },
  { key: 'spell', label: 'Hechizos', icon: Sparkles },
  { key: 'equipment', label: 'Equipo / Swap', icon: ShieldAlert },
  { key: 'targeting', label: 'Objetivos', icon: Crosshair },
  { key: 'pet', label: 'Mascotas', icon: Dog },
  { key: 'utility', label: 'Utilidad', icon: Wrench },
  { key: 'ascension', label: 'Ascension', icon: Zap },
  { key: 'chat', label: 'Chat', icon: MessageSquare },
];

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddCommand }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | CommandCategory>('all');

  const filteredCommands = COMMANDS_CATALOG.filter(cmd => {
    const matchesCategory = activeCategory === 'all' || cmd.category === activeCategory;
    const matchesSearch = 
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.command.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()) ||
      cmd.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#121820] border border-[#232c37] rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      {/* Palette Header */}
      <div className="p-3 border-b border-[#232c37] bg-[#161f2b]/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider font-display">
              Catálogo de Bloques
            </h2>
          </div>
          <span className="text-[10px] text-gray-400 font-mono bg-[#0d121a] px-2 py-0.5 rounded border border-[#253243]">
            {filteredCommands.length} disponibles
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar /cast, /use, mouseover..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#0a0e14] border border-[#2a3749] focus:border-amber-500/60 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 transition"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center space-x-1 mt-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-[#182230] text-gray-400 hover:text-gray-200 hover:bg-[#202d40] border border-transparent'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commands List */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        {filteredCommands.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-xs">
            No se encontraron comandos para &quot;{search}&quot;.
          </div>
        ) : (
          filteredCommands.map((cmd) => (
            <div
              key={cmd.command}
              className="group p-2.5 rounded-lg bg-[#151c27] hover:bg-[#1c2635] border border-[#253243] hover:border-amber-500/30 transition-all duration-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {cmd.command}
                  </span>
                  <span className="text-xs font-semibold text-gray-200">
                    {cmd.name.replace(/\(.*\)/, '')}
                  </span>
                </div>
                
                <button
                  onClick={() => onAddCommand(cmd)}
                  className="flex items-center space-x-1 px-2 py-1 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black font-semibold rounded-md border border-amber-500/40 hover:border-transparent transition text-[11px]"
                  title="Añadir este bloque a la macro"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir</span>
                </button>
              </div>

              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                {cmd.description}
              </p>

              {cmd.example && (
                <div className="mt-2 text-[10px] font-mono text-gray-400 bg-[#0c1017] p-1.5 rounded border border-[#1e2836] overflow-x-auto whitespace-nowrap text-sky-300/80">
                  <span className="text-gray-500 select-none mr-1.5">ej:</span>
                  {cmd.example}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
