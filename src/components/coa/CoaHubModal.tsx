import React, { useState } from 'react';
import { COA_ARCHETYPES, CoAArchetype } from '../../data/coaArchetypes';
import { COA_CLASSES_LIST, getGroupedCoaSpells, CoaGroupedSpell, getSpellIconUrl } from '../../data/coaSpells';
import { parseMacroText } from '../../utils/macroParser';
import { MacroData } from '../../types/macro';
import { 
  X, 
  Zap, 
  Search, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  ExternalLink, 
  BookOpen, 
  Plus, 
  Check
} from 'lucide-react';

interface CoaHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCoaMacro: (macro: MacroData) => void;
  onAddSpellBlock?: (spellName: string) => void;
}

interface SpellCardProps {
  spell: CoaGroupedSpell;
  lang: 'es' | 'en';
  onAddSpell: (spellText: string) => void;
  isRecentlyAdded: boolean;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, lang, onAddSpell, isRecentlyAdded }) => {
  const [selectedRank, setSelectedRank] = useState<string>('');
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    const spellText = selectedRank ? `${spell.name}(${selectedRank})` : spell.name;
    onAddSpell(spellText);
  };

  const iconSrc = imgError 
    ? 'https://db.ascension.gg/static/images/wow/icons/medium/inv_misc_questionmark.jpg' 
    : getSpellIconUrl(spell.icon);

  const activeDescription = lang === 'es' 
    ? (spell.descriptionEs || spell.descriptionEn) 
    : (spell.descriptionEn || spell.descriptionEs);

  return (
    <div className="p-3.5 rounded-xl bg-[#141b26] border border-[#222f42] hover:border-emerald-500/50 transition flex flex-col justify-between group shadow-md hover:shadow-lg">
      
      {/* Top Header: Icon + Name + Class + Cast Info */}
      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5">
          {/* Spell Icon */}
          <div className="relative w-11 h-11 rounded-lg overflow-hidden border-2 border-[#2b3a4e] group-hover:border-emerald-500/60 shrink-0 bg-[#090d13] shadow-inner transition">
            <img
              src={iconSrc}
              alt={spell.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
              loading="lazy"
            />
          </div>

          {/* Name & Badges */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1.5">
              <h4 className="text-xs font-bold text-gray-100 group-hover:text-emerald-300 transition font-display leading-tight">
                {spell.name}
              </h4>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold uppercase shrink-0">
                {spell.className}
              </span>
            </div>

            {/* Combat Parameters (Cost / Cast / CD / Range) */}
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400 flex-wrap font-mono">
              {spell.cost && (
                <span className="text-sky-300 font-semibold">
                  {spell.cost}
                </span>
              )}
              {spell.castTime && (
                <span className="text-gray-400">
                  • {spell.castTime}
                </span>
              )}
              {spell.cooldown && (
                <span className="text-amber-300 font-semibold">
                  • {spell.cooldown}
                </span>
              )}
              {spell.range && (
                <span className="text-gray-500">
                  • {spell.range}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Direct Spell Description in Card (No tooltips) */}
        <div className="p-2.5 rounded-lg bg-[#0c121a] border border-[#1c2738] min-h-[58px] flex items-center">
          {activeDescription ? (
            <p className="text-[11px] text-gray-200 leading-relaxed">
              {activeDescription}
            </p>
          ) : (
            <p className="text-[11px] text-gray-500 italic">
              {lang === 'es' ? 'Habilidad instantánea / pasiva de combate.' : 'Instant or passive combat ability.'}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls: Rank Selector + Add Button */}
      <div className="flex items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-[#1e2b3c]">
        {spell.ranks && spell.ranks.length > 0 ? (
          <div className="flex-1 min-w-0">
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="w-full bg-[#090d14] border border-[#273548] hover:border-emerald-500/50 rounded-lg px-2 py-1.5 text-[11px] text-amber-200 focus:outline-none focus:border-emerald-500 font-mono transition truncate"
              title="Seleccionar rango específico (por defecto se usa el rango máximo)"
            >
              <option value="">Rango Máx (Auto)</option>
              {spell.ranks.map((r, rIdx) => (
                <option key={rIdx} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex-1 text-[11px] text-gray-500 font-mono pl-1">
            Rango único
          </div>
        )}

        <button
          type="button"
          onClick={handleAdd}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center justify-center space-x-1.5 shrink-0 min-w-[84px] ${
            isRecentlyAdded
              ? 'bg-emerald-500 text-black border-emerald-400 shadow-glow-fel'
              : 'bg-[#1b2738] text-gray-100 border-[#2f425b] hover:bg-emerald-500 hover:text-black hover:border-emerald-400 shadow-sm'
          }`}
          title="Añadir a la macro activa (/cast)"
        >
          {isRecentlyAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Añadido</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const CoaHubModal: React.FC<CoaHubModalProps> = ({
  isOpen,
  onClose,
  onLoadCoaMacro,
  onAddSpellBlock
}) => {
  const [activeTab, setActiveTab] = useState<'spellbook' | 'archetypes'>('spellbook');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [search, setSearch] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<CoAArchetype>(COA_ARCHETYPES[0]);
  
  // Spellbook tab state
  const [selectedSpellClass, setSelectedSpellClass] = useState<string>('all');
  const [spellSearch, setSpellSearch] = useState('');
  const [recentlyAddedSpell, setRecentlyAddedSpell] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter archetypes
  const filteredArchetypes = COA_ARCHETYPES.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase()) ||
    a.signatureSpells.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  // Grouped unique spells
  const groupedSpells = getGroupedCoaSpells(selectedSpellClass);
  const filteredGroupedSpells = groupedSpells.filter(s => {
    if (!spellSearch) return true;
    const q = spellSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.descriptionEs && s.descriptionEs.toLowerCase().includes(q)) ||
      (s.descriptionEn && s.descriptionEn.toLowerCase().includes(q)) ||
      s.ranks.some(r => r.toLowerCase().includes(q))
    );
  });

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

  const handleAddSpell = (spellText: string) => {
    if (onAddSpellBlock) {
      onAddSpellBlock(spellText);
      setRecentlyAddedSpell(spellText);
      setTimeout(() => setRecentlyAddedSpell(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121822] border border-[#2b394a] rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[#232c37] bg-gradient-to-r from-[#141b25] via-[#1b2533] to-[#141b25] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-emerald-500 rounded-lg text-black font-black shadow-glow-gold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-gray-100 font-display">
                  Project Ascension – Conquest of Azeroth (CoA) Hub
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  21 Clases (7.12 - 7.32)
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Base de datos completa con iconos oficiales, descripciones integradas y macros listas para usar.
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

        {/* Tab Switcher + Global Language Toggle Bar */}
        <div className="px-5 py-2.5 bg-[#0d121a] border-b border-[#202936] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('spellbook')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'spellbook'
                  ? 'bg-emerald-500 text-black shadow-glow-fel'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#182330]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grimorio de Hechizos ({groupedSpells.length} Habilidades)</span>
            </button>

            <button
              onClick={() => setActiveTab('archetypes')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'archetypes'
                  ? 'bg-amber-500 text-black shadow-glow-gold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#182330]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Arquetipos y Macros ({COA_ARCHETYPES.length})</span>
            </button>
          </div>

          {/* Right Controls: Global Language Switcher */}
          <div className="flex items-center space-x-2">
            {activeTab === 'spellbook' && (
              <div className="flex items-center bg-[#131b26] border border-[#27384d] rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setLang('es')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
                    lang === 'es'
                      ? 'bg-amber-500 text-black shadow-sm font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Mostrar descripciones en Español"
                >
                  <span>🇪🇸 Español</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
                    lang === 'en'
                      ? 'bg-amber-500 text-black shadow-sm font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Mostrar descripciones originales en Inglés"
                >
                  <span>🇬🇧 English</span>
                </button>
              </div>
            )}

            <a
              href="https://db.ascension.gg/?spells=7.12"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1 text-xs text-amber-400/80 hover:text-amber-300 hover:underline px-2 py-1"
            >
              <span>Ascension DB</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* TAB 1: COMPLETE COA SPELLBOOK EXPLORER WITH EMBEDDED DESCRIPTIONS */}
        {activeTab === 'spellbook' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Class Filter */}
            <div className="w-full md:w-64 bg-[#0d121a] border-r border-[#202936] flex flex-col">
              <div className="p-3 border-b border-[#202936] text-xs font-bold text-gray-300 flex items-center justify-between">
                <span>Clases CoA (21)</span>
                <span className="text-[10px] text-emerald-400 font-mono">7.12 - 7.32</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedSpellClass('all')}
                  className={`w-full p-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition ${
                    selectedSpellClass === 'all'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#141b26]'
                  }`}
                >
                  <span>Todas las Clases</span>
                  <span className="text-[10px] bg-[#1a2332] px-1.5 py-0.5 rounded text-gray-400 font-mono">
                    {getGroupedCoaSpells('all').length}
                  </span>
                </button>

                {COA_CLASSES_LIST.map((cls) => {
                  const isSel = selectedSpellClass === cls.className;
                  const count = getGroupedCoaSpells(cls.className).length;
                  return (
                    <button
                      key={cls.classNum}
                      type="button"
                      onClick={() => setSelectedSpellClass(cls.className)}
                      className={`w-full p-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition ${
                        isSel
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#141b26]'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="text-[10px] text-gray-500 font-mono w-4">
                          {cls.classNum}
                        </span>
                        <span className="truncate">{cls.className}</span>
                      </div>
                      <span className="text-[10px] bg-[#1a2332] px-1.5 py-0.5 rounded text-gray-400 font-mono shrink-0 ml-1">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Spell Grid */}
            <div className="flex-1 p-4 overflow-y-auto bg-[#121822] flex flex-col space-y-3">
              
              {/* Search and summary */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-[#232c37]">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={spellSearch}
                    onChange={(e) => setSpellSearch(e.target.value)}
                    placeholder="Buscar por nombre o descripción (ej. sangrado, fuego, daño...)"
                    className="w-full pl-9 pr-3 py-1.5 bg-[#141c27] border border-[#273445] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="text-xs text-gray-400">
                  Mostrando <strong className="text-emerald-400">{filteredGroupedSpells.length}</strong> habilidades ({lang === 'es' ? '🇪🇸 Español' : '🇬🇧 English'})
                </div>
              </div>

              {/* Spells Grid with Integrated Descriptions and Clean Alignment */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 pr-1">
                {filteredGroupedSpells.slice(0, 300).map((spell, sIdx) => (
                  <SpellCard
                    key={`${spell.className}_${spell.name}_${sIdx}`}
                    spell={spell}
                    lang={lang}
                    onAddSpell={handleAddSpell}
                    isRecentlyAdded={recentlyAddedSpell === spell.name || (recentlyAddedSpell?.startsWith(spell.name) ?? false)}
                  />
                ))}
              </div>

              {filteredGroupedSpells.length > 300 && (
                <div className="p-2 bg-[#0d121a] rounded-lg text-center text-xs text-gray-400 border border-[#202936]">
                  Mostrando las primeras 300 habilidades de {filteredGroupedSpells.length}. Usa el buscador para filtrar más específicamente.
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: ARCHETYPES & RECOMMENDED MACROS */}
        {activeTab === 'archetypes' && (
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
                    Habilidades Insignia:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedArchetype.signatureSpells.map((spell, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddSpell(spell)}
                        className="px-2 py-0.5 bg-[#0d121a] hover:bg-amber-500/20 hover:text-amber-200 text-sky-300 border border-sky-500/30 rounded text-[11px] font-mono font-medium flex items-center space-x-1 transition group"
                        title="Clic para añadir /cast a la macro"
                      >
                        <span>{spell}</span>
                        <Plus className="w-2.5 h-2.5 text-gray-500 group-hover:text-amber-400" />
                      </button>
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
        )}

      </div>
    </div>
  );
};
