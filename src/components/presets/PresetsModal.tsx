import React, { useState } from 'react';
import { MacroData } from '../../types/macro';
import { DEFAULT_PRESETS } from '../../data/defaultPresets';
import { generateMacro } from '../../utils/macroGenerator';
import { 
  X, 
  Flame, 
  Search, 
  Check, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Swords, 
  Zap, 
  Footprints 
} from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: MacroData) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: 'Todas las Plantillas' },
    { key: 'pvp', label: 'PvP & Arenas' },
    { key: 'pve', label: 'PvE & Bandas' },
    { key: 'ascension_coa', label: 'Ascension & CoA' },
    { key: 'qol', label: 'Quality of Life' },
  ];

  const filteredPresets = DEFAULT_PRESETS.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121822] border border-[#2b394a] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-[#232c37] bg-[#161f2b] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-md">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100 font-display">
                Biblioteca de Plantillas Pro (WoW 3.3.5a & Ascension)
              </h3>
              <p className="text-xs text-gray-400">
                Selecciona una plantilla optimizada lista para usar o modificar en el editor visual.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#202b3a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-3 bg-[#0d121a] border-b border-[#202936] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar plantilla (ej. mouseover, burst...)"
              className="w-full pl-9 pr-3 py-1.5 bg-[#141c27] border border-[#273445] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === c.key
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-[#151d28] text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Presets Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPresets.map((preset) => {
            const validation = generateMacro(preset.blocks, false);
            return (
              <div
                key={preset.id}
                className="bg-[#141b25] border border-[#253243] hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-glow-gold group"
              >
                <div>
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="text-sm font-bold text-gray-100 group-hover:text-amber-300 transition">
                      {preset.name}
                    </h4>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0d121a] text-gray-400 border border-[#253243]">
                      {validation.charCount} chars
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="bg-[#0b0e14] p-2.5 rounded-lg border border-[#1e2736] font-mono text-[11px] text-sky-300/90 whitespace-pre-wrap max-h-24 overflow-y-auto mb-3">
                    {validation.cleanCode}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e2736] flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
                    {preset.category}
                  </span>
                  
                  <button
                    onClick={() => {
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition shadow-sm"
                  >
                    <span>Cargar en Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
