import React, { useState } from 'react';
import { COA_ARCHETYPES, CoAArchetype } from '../../data/coaArchetypes';
import { parseMacroText } from '../../utils/macroParser';
import { MacroData } from '../../types/macro';
import { 
  X, 
  Zap, 
  Search, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface CoaHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCoaMacro: (macro: MacroData) => void;
}

export const CoaHubModal: React.FC<CoaHubModalProps> = ({
  isOpen,
  onClose,
  onLoadCoaMacro
}) => {
  const [search, setSearch] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<CoAArchetype>(COA_ARCHETYPES[0]);

  if (!isOpen) return null;

  const filteredArchetypes = COA_ARCHETYPES.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase()) ||
    a.signatureSpells.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const handleApplyMacro = (rec: { title: string; description: string; macroCode: string }) => {
    const blocks = parseMacroText(rec.macroCode);
    const newMacro: MacroData = {
      id: `coa_${Date.now()}`,
      name: `${selectedArchetype.name}: ${rec.title}`,
      description: rec.description,
      icon: 'Zap',
      category: 'ascension_coa',
      coaArchetype: selectedArchetype.name,
      blocks,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    onLoadCoaMacro(newMacro);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121822] border border-[#2b394a] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[#232c37] bg-gradient-to-r from-[#141b25] via-[#1b2533] to-[#141b25] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-emerald-500 rounded-lg text-black font-black shadow-glow-gold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-gray-100 font-display">
                  Project Ascension – Hub de Clases Conquest of Azeroth (CoA)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  21 Arquetipos
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Macros personalizadas, rotaciones de hechizos y combinaciones de armas para las clases de CoA.
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

        {/* Content Body: Sidebar List + Detail Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Archetypes List */}
          <div className="w-full md:w-72 bg-[#0d121a] border-r border-[#202936] flex flex-col">
            <div className="p-3 border-b border-[#202936]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar clase (Pyromancer, Tinker...)"
                  className="w-full pl-8 pr-3 py-1.5 bg-[#141c27] border border-[#273445] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredArchetypes.map((arch) => {
                const isSelected = selectedArchetype.id === arch.id;
                return (
                  <button
                    key={arch.id}
                    onClick={() => setSelectedArchetype(arch)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'bg-[#131923] text-gray-300 hover:bg-[#18212e] border border-transparent'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-display">{arch.name}</div>
                      <div className="text-[10px] text-gray-400">{arch.role}</div>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        arch.role === 'DPS'
                          ? 'bg-red-500/20 text-red-300'
                          : arch.role === 'Healer'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {arch.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail Panel */}
          <div className="flex-1 p-5 overflow-y-auto bg-[#121822] space-y-5">
            
            {/* Archetype Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#182230] to-[#121822] border border-[#273547]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-amber-300 font-display tracking-wide">
                  {selectedArchetype.name}
                </h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Rol: {selectedArchetype.role}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {selectedArchetype.description}
              </p>

              {/* Signature Spells */}
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Habilidades y Hechizos Insignia:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedArchetype.signatureSpells.map((spell, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-[#0d121a] text-sky-300 border border-sky-500/30 rounded text-[11px] font-mono font-medium"
                    >
                      {spell}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Macros */}
            <div>
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-display mb-3 flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Macros Recomendadas para {selectedArchetype.name}:</span>
              </h3>

              <div className="space-y-3">
                {selectedArchetype.recommendedMacros.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#151c27] border border-[#253243] hover:border-amber-500/40 transition space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-100">
                          {rec.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {rec.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleApplyMacro(rec)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition shadow-sm ml-3 shrink-0"
                      >
                        <span>Cargar Macro</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <pre className="p-2.5 rounded-lg bg-[#0b0e14] border border-[#1e2736] font-mono text-[11px] text-sky-300/90 whitespace-pre-wrap">
                      {rec.macroCode}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
