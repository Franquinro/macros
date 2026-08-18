import React, { useState } from 'react';
import { 
  ConditionBracket, 
  ConditionRule, 
  MacroBlock, 
  TargetSelector 
} from '../../types/macro';
import { TARGET_SELECTORS } from '../../data/conditionsData';
import { formatBracket } from '../../utils/macroGenerator';
import { validateBracket, BracketValidationResult } from '../../utils/conditionValidator';
import { 
  X, 
  Plus, 
  Trash2, 
  SlidersHorizontal, 
  Check, 
  HelpCircle, 
  MousePointer2, 
  Layers,
  ArrowRight,
  AlertTriangle,
  Info,
  Shield,
  Heart,
  Skull,
  Swords,
  Crosshair,
  User,
  Sparkles,
  Keyboard,
  Compass,
  AlertCircle
} from 'lucide-react';

interface ConditionModalProps {
  block: MacroBlock;
  isOpen: boolean;
  onClose: () => void;
  onSave: (brackets: ConditionBracket[]) => void;
}

export const ConditionModal: React.FC<ConditionModalProps> = ({
  block,
  isOpen,
  onClose,
  onSave
}) => {
  const [brackets, setBrackets] = useState<ConditionBracket[]>(
    block.brackets && block.brackets.length > 0
      ? JSON.parse(JSON.stringify(block.brackets))
      : [
          {
            id: `br_${Date.now()}_0`,
            target: undefined,
            rules: []
          }
        ]
  );

  const [activeBracketIndex, setActiveBracketIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentBracket = brackets[activeBracketIndex] || brackets[0] || {
    id: `br_${Date.now()}`,
    target: undefined,
    rules: []
  };

  const validation: BracketValidationResult = validateBracket(currentBracket);

  // Helper getters for current bracket state
  const getHarmState = (): 'none' | 'harm' | 'help' => {
    const r = currentBracket.rules.find(rule => rule.type === 'harm');
    if (!r) return 'none';
    return r.isNegated ? 'help' : 'harm';
  };

  const getLifeState = (): 'none' | 'nodead' | 'dead' => {
    const r = currentBracket.rules.find(rule => rule.type === 'nodead');
    if (!r) return 'none';
    return r.isNegated ? 'dead' : 'nodead';
  };

  const getExistsState = (): 'none' | 'exists' | 'noexists' => {
    const r = currentBracket.rules.find(rule => rule.type === 'exists');
    if (!r) return 'none';
    return r.isNegated ? 'noexists' : 'exists';
  };

  const getModState = (): 'none' | 'nomod' | 'shift' | 'ctrl' | 'alt' | 'any' => {
    const r = currentBracket.rules.find(rule => rule.type === 'mod');
    if (!r) return 'none';
    if (r.isNegated) return 'nomod';
    if (r.value === 'shift') return 'shift';
    if (r.value === 'ctrl') return 'ctrl';
    if (r.value === 'alt') return 'alt';
    return 'any';
  };

  const getCombatState = (): 'none' | 'combat' | 'nocombat' => {
    const r = currentBracket.rules.find(rule => rule.type === 'combat');
    if (!r) return 'none';
    return r.isNegated ? 'nocombat' : 'combat';
  };

  const getStealthState = (): 'none' | 'stealth' | 'nostealth' => {
    const r = currentBracket.rules.find(rule => rule.type === 'stealth');
    if (!r) return 'none';
    return r.isNegated ? 'nostealth' : 'stealth';
  };

  const getMountedState = (): 'none' | 'mounted' | 'nomounted' => {
    const r = currentBracket.rules.find(rule => rule.type === 'mounted');
    if (!r) return 'none';
    return r.isNegated ? 'nomounted' : 'mounted';
  };

  const getFlyableState = (): 'none' | 'flyable' | 'noflyable' => {
    const r = currentBracket.rules.find(rule => rule.type === 'flyable');
    if (!r) return 'none';
    return r.isNegated ? 'noflyable' : 'flyable';
  };

  const getBtnState = (): 'none' | '1' | '2' | '3' => {
    const r = currentBracket.rules.find(rule => rule.type === 'btn');
    if (!r) return 'none';
    return (r.value as '1' | '2' | '3') || 'none';
  };

  const getFormRule = () => currentBracket.rules.find(r => r.type === 'form' || r.type === 'stance');
  const getEquippedRule = () => currentBracket.rules.find(r => r.type === 'equipped');
  const getChannelingRule = () => currentBracket.rules.find(r => r.type === 'channeling');

  // Mutation Handlers
  const updateCurrentBracket = (updater: (bracket: ConditionBracket) => void) => {
    const updated = [...brackets];
    if (!updated[activeBracketIndex]) {
      updated[activeBracketIndex] = {
        id: `br_${Date.now()}`,
        target: undefined,
        rules: []
      };
    }
    updater(updated[activeBracketIndex]);
    setBrackets(updated);
  };

  const handleSetTarget = (target: TargetSelector) => {
    updateCurrentBracket((br) => {
      br.target = br.target === target ? undefined : target;
    });
  };

  const handleSetHarm = (val: 'none' | 'harm' | 'help') => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'harm');
      if (val !== 'none') {
        br.rules.push({
          id: `r_${Date.now()}_harm`,
          type: 'harm',
          isNegated: val === 'help'
        });
      }
    });
  };

  const handleSetLife = (val: 'none' | 'nodead' | 'dead') => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'nodead');
      if (val !== 'none') {
        br.rules.push({
          id: `r_${Date.now()}_life`,
          type: 'nodead',
          isNegated: val === 'dead'
        });
      }
    });
  };

  const handleSetExists = (val: 'none' | 'exists' | 'noexists') => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'exists');
      if (val !== 'none') {
        br.rules.push({
          id: `r_${Date.now()}_exists`,
          type: 'exists',
          isNegated: val === 'noexists'
        });
        // If selecting noexists, clean impossible life and faction properties
        if (val === 'noexists') {
          br.rules = br.rules.filter(r => r.type !== 'nodead' && r.type !== 'harm');
        }
      }
    });
  };

  const handleSetMod = (val: 'none' | 'nomod' | 'shift' | 'ctrl' | 'alt' | 'any') => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'mod');
      if (val === 'nomod') {
        br.rules.push({ id: `r_${Date.now()}_mod`, type: 'mod', isNegated: true });
      } else if (val === 'any') {
        br.rules.push({ id: `r_${Date.now()}_mod`, type: 'mod', value: '', isNegated: false });
      } else if (val !== 'none') {
        br.rules.push({ id: `r_${Date.now()}_mod`, type: 'mod', value: val, isNegated: false });
      }
    });
  };

  const handleSetCombat = (val: 'none' | 'combat' | 'nocombat') => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'combat');
      if (val !== 'none') {
        br.rules.push({ id: `r_${Date.now()}_combat`, type: 'combat', isNegated: val === 'nocombat' });
      }
    });
  };

  const handleSetStealth = (val: 'none' | 'stealth' | 'nostealth') => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'stealth');
      if (val !== 'none') {
        br.rules.push({ id: `r_${Date.now()}_stealth`, type: 'stealth', isNegated: val === 'nostealth' });
      }
    });
  };

  const handleSetMounted = (val: 'none' | 'mounted' | 'nomounted') => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'mounted');
      if (val !== 'none') {
        br.rules.push({ id: `r_${Date.now()}_mounted`, type: 'mounted', isNegated: val === 'nomounted' });
      }
    });
  };

  const handleSetFlyable = (val: 'none' | 'flyable' | 'noflyable') => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'flyable');
      if (val !== 'none') {
        br.rules.push({ id: `r_${Date.now()}_flyable`, type: 'flyable', isNegated: val === 'noflyable' });
      }
    });
  };

  const handleSetBtn = (val: 'none' | '1' | '2' | '3') => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'btn');
      if (val !== 'none') {
        br.rules.push({ id: `r_${Date.now()}_btn`, type: 'btn', value: val });
      }
    });
  };

  // Advanced toggles
  const handleToggleForm = (enabled: boolean, formVal: string = '1', isNegated: boolean = false) => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'form' && r.type !== 'stance');
      if (enabled) {
        br.rules.push({ id: `r_${Date.now()}_form`, type: 'form', value: formVal, isNegated });
      }
    });
  };

  const handleToggleEquipped = (enabled: boolean, itemVal: string = 'Shields', isNegated: boolean = false) => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'equipped');
      if (enabled) {
        br.rules.push({ id: `r_${Date.now()}_eq`, type: 'equipped', value: itemVal, isNegated });
      }
    });
  };

  const handleToggleChanneling = (enabled: boolean, spellName: string = '', isNegated: boolean = true) => {
    updateCurrentBracket((br) => {
      br.rules = br.rules.filter(r => r.type !== 'channeling');
      if (enabled) {
        br.rules.push({ id: `r_${Date.now()}_chan`, type: 'channeling', value: spellName, isNegated });
      }
    });
  };

  // Bracket navigation & creation (OR logic between tabs)
  const handleAddBracket = () => {
    const newBracket: ConditionBracket = {
      id: `br_${Date.now()}_${brackets.length}`,
      target: undefined,
      rules: []
    };
    const updated = [...brackets, newBracket];
    setBrackets(updated);
    setActiveBracketIndex(updated.length - 1);
  };

  const handleAddFallbackBracket = () => {
    const fallbackBracket: ConditionBracket = {
      id: `br_${Date.now()}_fallback`,
      target: undefined,
      rules: []
    };
    const updated = [...brackets, fallbackBracket];
    setBrackets(updated);
    setActiveBracketIndex(updated.length - 1);
  };

  const handleRemoveBracket = (index: number) => {
    if (brackets.length <= 1) {
      setBrackets([{ id: `br_${Date.now()}`, target: undefined, rules: [] }]);
      setActiveBracketIndex(0);
      return;
    }
    const updated = brackets.filter((_, i) => i !== index);
    setBrackets(updated);
    if (activeBracketIndex >= updated.length) {
      setActiveBracketIndex(updated.length - 1);
    }
  };

  const handleClearCurrentStep = () => {
    updateCurrentBracket((br) => {
      br.target = undefined;
      br.rules = [];
    });
  };

  const handleSaveAndClose = () => {
    onSave(brackets);
    onClose();
  };

  const formRule = getFormRule();
  const equippedRule = getEquippedRule();
  const chanRule = getChannelingRule();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#101620] border border-[#273547] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1f2a3a] bg-[#141c28] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-gray-100 font-display">
                  Editor Visual de Condiciones
                </h3>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {block.command} {block.argument}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Define cuándo, a quién y bajo qué circunstancias se ejecutará esta acción.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#202d3f] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Educational Logic Banner (AND vs OR) */}
        <div className="px-4 py-2.5 bg-[#0a0f16] border-b border-[#1c2635] flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>
              <strong className="text-sky-300 font-semibold">Dentro de este paso (AND):</strong> Todas las opciones seleccionadas abajo deben cumplirse a la vez.
            </span>
          </div>
          <span className="hidden md:inline-flex items-center space-x-1.5 text-amber-400/90 font-mono text-[11px] bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            <span>[Paso 1][Paso 2]</span>
            <span className="text-gray-400">➔</span>
            <span>O (OR) alternativas</span>
          </span>
        </div>

        {/* Priority Tabs (OR Fallback groups: [Step 1][Step 2][Fallback]) */}
        <div className="px-4 py-2.5 bg-[#0d131c] border-b border-[#1f2a3a] flex items-center justify-between overflow-x-auto gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-400 flex items-center space-x-1 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Prioridades:</span>
            </span>

            {brackets.map((br, idx) => {
              const brVal = validateBracket(br);
              const isSelected = activeBracketIndex === idx;
              const formatted = formatBracket(br);
              return (
                <div
                  key={br.id || idx}
                  onClick={() => setActiveBracketIndex(idx)}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center space-x-2 transition ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-glow-gold'
                      : 'bg-[#151c28] border-[#263447] text-gray-400 hover:text-gray-200 hover:bg-[#1a2433]'
                  }`}
                >
                  <span className="font-sans font-semibold text-gray-300">
                    Paso {idx + 1}:
                  </span>
                  <span className="text-[11px] text-sky-300">
                    {formatted}
                  </span>
                  {brVal.isImpossible && (
                    <span title="Condición imposible">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                    </span>
                  )}
                  {brackets.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBracket(idx);
                      }}
                      className="hover:text-red-400 text-gray-500 ml-1 transition"
                      title="Eliminar este paso"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleAddBracket}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#182333] hover:bg-[#223147] text-xs font-semibold text-amber-300 border border-amber-500/30 transition shadow-sm whitespace-nowrap"
              title="Añade un corchete adicional que se evaluará si este paso no se cumple (OR)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Añadir Alternativa (OR)</span>
            </button>
            <button
              onClick={handleAddFallbackBracket}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#131a24] hover:bg-[#1c2635] text-[11px] font-mono text-gray-400 hover:text-gray-200 border border-[#273547] transition whitespace-nowrap"
              title="Añade corchetes vacíos [] para acción por defecto"
            >
              <span>+ Fallback []</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-6 scrollbar-thin">
          
          {/* SECTION 1: Objetivo / Unidad (@target) */}
          <div className="bg-[#131a24] border border-[#222e3f] rounded-xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
                <MousePointer2 className="w-4 h-4 text-sky-400" />
                <span>1. Objetivo de la Acción (@target)</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {currentBracket.target ? `Seleccionado: ${currentBracket.target}` : 'Sin selección (apunta al objetivo actual del juego)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TARGET_SELECTORS.map((t) => {
                const isSelected = currentBracket.target === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => handleSetTarget(t.value)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-glow-frost ring-1 ring-sky-400'
                        : 'bg-[#0f151e] border-[#222f40] text-gray-300 hover:bg-[#16202c] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold">{t.shortLabel}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-sky-400" />
                      ) : (
                        <span className="text-[10px] text-gray-500">{t.value}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 line-clamp-1">{t.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Filtros de Unidad (Mutuamente Excluyentes) */}
          <div className="bg-[#131a24] border border-[#222e3f] rounded-xl p-3.5 sm:p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <span>2. Filtros de la Unidad / Objetivo</span>
              </label>
              <span className="text-[11px] text-gray-400">
                Opciones mutuamente excluyentes (previenen contradicciones)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Relación (harm / help) */}
              <div className="p-3 bg-[#0e141d] rounded-lg border border-[#1f2b3b]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
                    <Swords className="w-3.5 h-3.5 text-rose-400" />
                    <span>Facción / Relación</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-[#090d13] p-1 rounded-lg border border-[#1a2432]">
                  <button
                    onClick={() => handleSetHarm('none')}
                    className={`py-1 text-[11px] font-medium rounded transition ${
                      getHarmState() === 'none'
                        ? 'bg-[#1e2a3b] text-gray-200 font-bold shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Cualquiera
                  </button>
                  <button
                    onClick={() => handleSetHarm('harm')}
                    className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center space-x-1 ${
                      getHarmState() === 'harm'
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold shadow-sm'
                        : 'text-rose-400/70 hover:text-rose-300'
                    }`}
                  >
                    <span>⚔️ Hostil (harm)</span>
                  </button>
                  <button
                    onClick={() => handleSetHarm('help')}
                    className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center space-x-1 ${
                      getHarmState() === 'help'
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold shadow-sm'
                        : 'text-emerald-400/70 hover:text-emerald-300'
                    }`}
                  >
                    <span>💚 Aliado (help)</span>
                  </button>
                </div>
              </div>

              {/* Vida (nodead / dead) */}
              <div className="p-3 bg-[#0e141d] rounded-lg border border-[#1f2b3b]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span>Estado de Vida</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-[#090d13] p-1 rounded-lg border border-[#1a2432]">
                  <button
                    onClick={() => handleSetLife('none')}
                    className={`py-1 text-[11px] font-medium rounded transition ${
                      getLifeState() === 'none'
                        ? 'bg-[#1e2a3b] text-gray-200 font-bold shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Cualquiera
                  </button>
                  <button
                    onClick={() => handleSetLife('nodead')}
                    className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center space-x-1 ${
                      getLifeState() === 'nodead'
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold shadow-sm'
                        : 'text-emerald-400/70 hover:text-emerald-300'
                    }`}
                  >
                    <span>💖 Vivo (nodead)</span>
                  </button>
                  <button
                    onClick={() => handleSetLife('dead')}
                    className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center space-x-1 ${
                      getLifeState() === 'dead'
                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 font-bold shadow-sm'
                        : 'text-purple-400/70 hover:text-purple-300'
                    }`}
                  >
                    <span>💀 Muerto (dead)</span>
                  </button>
                </div>
              </div>

              {/* Existencia (exists / noexists) */}
              <div className="p-3 bg-[#0e141d] rounded-lg border border-[#1f2b3b]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-300 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Existencia de Unidad</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-[#090d13] p-1 rounded-lg border border-[#1a2432]">
                  <button
                    onClick={() => handleSetExists('none')}
                    className={`py-1 text-[11px] font-medium rounded transition ${
                      getExistsState() === 'none'
                        ? 'bg-[#1e2a3b] text-gray-200 font-bold shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Cualquiera
                  </button>
                  <button
                    onClick={() => handleSetExists('exists')}
                    className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center space-x-1 ${
                      getExistsState() === 'exists'
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                        : 'text-cyan-400/70 hover:text-cyan-300'
                    }`}
                  >
                    <span>🎯 Existe (exists)</span>
                  </button>
                  <button
                    onClick={() => handleSetExists('noexists')}
                    className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center space-x-1 ${
                      getExistsState() === 'noexists'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold shadow-sm'
                        : 'text-amber-400/70 hover:text-amber-300'
                    }`}
                  >
                    <span>🚫 No existe (noexists)</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 3: Modificadores de Teclado y Clic */}
          <div className="bg-[#131a24] border border-[#222e3f] rounded-xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
                <Keyboard className="w-4 h-4 text-amber-400" />
                <span>3. Teclas Modificadoras y Botón de Ratón</span>
              </label>
              <span className="text-[11px] text-gray-400">
                Permite alternar habilidades con Shift, Ctrl o Alt
              </span>
            </div>

            {/* Modifiers Pill Group */}
            <div>
              <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                Tecla requerida para disparar la acción:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 bg-[#0a0f16] p-1.5 rounded-lg border border-[#1d2737]">
                {[
                  { key: 'none', label: 'Sin filtro' },
                  { key: 'nomod', label: '❌ Sin teclas (nomod)' },
                  { key: 'shift', label: '⌨️ Shift (mod:shift)' },
                  { key: 'ctrl', label: '⌨️ Ctrl (mod:ctrl)' },
                  { key: 'alt', label: '⌨️ Alt (mod:alt)' },
                  { key: 'any', label: '⌨️ Cualquiera (mod)' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSetMod(item.key as any)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-md transition ${
                      getModState() === item.key
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#16202c]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mouse Click Pill Group */}
            <div>
              <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                Botón del ratón con el que se hace clic sobre el icono de la macro:
              </span>
              <div className="grid grid-cols-4 gap-1.5 bg-[#0a0f16] p-1.5 rounded-lg border border-[#1d2737]">
                {[
                  { key: 'none', label: 'Cualquier clic' },
                  { key: '1', label: '🖱️ Clic Izquierdo (btn:1)' },
                  { key: '2', label: '🖱️ Clic Derecho (btn:2)' },
                  { key: '3', label: '🖱️ Clic Central (btn:3)' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSetBtn(item.key as any)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-md transition ${
                      getBtnState() === item.key
                        ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50 font-bold shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#16202c]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: Estado del Jugador (Combate, Sigilo, Montura, Vuelo) */}
          <div className="bg-[#131a24] border border-[#222e3f] rounded-xl p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>4. Estado de tu Personaje</span>
              </label>
              <span className="text-[11px] text-gray-400">
                Condiciones del entorno y estado propio
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Combate */}
              <div className="p-2.5 bg-[#0e141d] rounded-lg border border-[#1f2b3b]">
                <span className="text-[11px] font-semibold text-gray-300 block mb-1.5">⚔️ Estado de Combate</span>
                <div className="grid grid-cols-3 gap-1 bg-[#080c12] p-1 rounded border border-[#1a2432]">
                  <button
                    onClick={() => handleSetCombat('none')}
                    className={`py-1 text-[10px] rounded ${getCombatState() === 'none' ? 'bg-[#1e2a3b] text-white font-bold' : 'text-gray-400'}`}
                  >
                    Filtro OFF
                  </button>
                  <button
                    onClick={() => handleSetCombat('combat')}
                    className={`py-1 text-[10px] rounded ${getCombatState() === 'combat' ? 'bg-rose-500/30 text-rose-300 font-bold' : 'text-gray-400'}`}
                  >
                    En Combate
                  </button>
                  <button
                    onClick={() => handleSetCombat('nocombat')}
                    className={`py-1 text-[10px] rounded ${getCombatState() === 'nocombat' ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-gray-400'}`}
                  >
                    Fuera
                  </button>
                </div>
              </div>

              {/* Sigilo */}
              <div className="p-2.5 bg-[#0e141d] rounded-lg border border-[#1f2b3b]">
                <span className="text-[11px] font-semibold text-gray-300 block mb-1.5">🥷 Sigilo / Invisibilidad</span>
                <div className="grid grid-cols-3 gap-1 bg-[#080c12] p-1 rounded border border-[#1a2432]">
                  <button
                    onClick={() => handleSetStealth('none')}
                    className={`py-1 text-[10px] rounded ${getStealthState() === 'none' ? 'bg-[#1e2a3b] text-white font-bold' : 'text-gray-400'}`}
                  >
                    Filtro OFF
                  </button>
                  <button
                    onClick={() => handleSetStealth('stealth')}
                    className={`py-1 text-[10px] rounded ${getStealthState() === 'stealth' ? 'bg-purple-500/30 text-purple-300 font-bold' : 'text-gray-400'}`}
                  >
                    En Sigilo
                  </button>
                  <button
                    onClick={() => handleSetStealth('nostealth')}
                    className={`py-1 text-[10px] rounded ${getStealthState() === 'nostealth' ? 'bg-sky-500/30 text-sky-300 font-bold' : 'text-gray-400'}`}
                  >
                    Fuera
                  </button>
                </div>
              </div>

              {/* Montura */}
              <div className="p-2.5 bg-[#0e141d] rounded-lg border border-[#1f2b3b]">
                <span className="text-[11px] font-semibold text-gray-300 block mb-1.5">🐎 Montura</span>
                <div className="grid grid-cols-3 gap-1 bg-[#080c12] p-1 rounded border border-[#1a2432]">
                  <button
                    onClick={() => handleSetMounted('none')}
                    className={`py-1 text-[10px] rounded ${getMountedState() === 'none' ? 'bg-[#1e2a3b] text-white font-bold' : 'text-gray-400'}`}
                  >
                    Filtro OFF
                  </button>
                  <button
                    onClick={() => handleSetMounted('mounted')}
                    className={`py-1 text-[10px] rounded ${getMountedState() === 'mounted' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-gray-400'}`}
                  >
                    Montado
                  </button>
                  <button
                    onClick={() => handleSetMounted('nomounted')}
                    className={`py-1 text-[10px] rounded ${getMountedState() === 'nomounted' ? 'bg-teal-500/30 text-teal-300 font-bold' : 'text-gray-400'}`}
                  >
                    Desmontado
                  </button>
                </div>
              </div>

              {/* Zona Volable */}
              <div className="p-2.5 bg-[#0e141d] rounded-lg border border-[#1f2b3b]">
                <span className="text-[11px] font-semibold text-gray-300 block mb-1.5">🦅 Zona de Vuelo</span>
                <div className="grid grid-cols-3 gap-1 bg-[#080c12] p-1 rounded border border-[#1a2432]">
                  <button
                    onClick={() => handleSetFlyable('none')}
                    className={`py-1 text-[10px] rounded ${getFlyableState() === 'none' ? 'bg-[#1e2a3b] text-white font-bold' : 'text-gray-400'}`}
                  >
                    Filtro OFF
                  </button>
                  <button
                    onClick={() => handleSetFlyable('flyable')}
                    className={`py-1 text-[10px] rounded ${getFlyableState() === 'flyable' ? 'bg-sky-500/30 text-sky-300 font-bold' : 'text-gray-400'}`}
                  >
                    Permitido
                  </button>
                  <button
                    onClick={() => handleSetFlyable('noflyable')}
                    className={`py-1 text-[10px] rounded ${getFlyableState() === 'noflyable' ? 'bg-rose-500/30 text-rose-300 font-bold' : 'text-gray-400'}`}
                  >
                    No Volable
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 5: Opciones Avanzadas (Forma, Equipo, Canalización) */}
          <div className="bg-[#131a24] border border-[#222e3f] rounded-xl p-3.5 sm:p-4 space-y-3">
            <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>5. Condiciones Avanzadas (Forma, Equipo, Canalizado)</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Form / Stance */}
              <div className="p-3 bg-[#0e141d] rounded-lg border border-[#1f2b3b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-300">Postura / Forma</span>
                  <input
                    type="checkbox"
                    checked={!!formRule}
                    onChange={(e) => handleToggleForm(e.target.checked, formRule?.value || '1', formRule?.isNegated)}
                    className="rounded text-amber-500 bg-[#0c1017] border-[#2d3a4b] cursor-pointer"
                  />
                </div>
                {formRule && (
                  <div className="space-y-2 pt-1">
                    <select
                      value={formRule.value || '1'}
                      onChange={(e) => handleToggleForm(true, e.target.value, formRule.isNegated)}
                      className="w-full bg-[#080c12] border border-[#27364a] text-xs text-amber-300 rounded p-1.5"
                    >
                      <option value="0">Forma Normal / Caster (form:0)</option>
                      <option value="1">Postura Batalla / Oso (form:1)</option>
                      <option value="2">Postura Defensiva / Acuática (form:2)</option>
                      <option value="3">Postura Rabiosa / Felino (form:3)</option>
                      <option value="4">Forma de Viaje (form:4)</option>
                      <option value="5">Lechúcico Lunar / Voladora (form:5)</option>
                    </select>
                    <button
                      onClick={() => handleToggleForm(true, formRule.value || '1', !formRule.isNegated)}
                      className={`w-full py-1 text-[11px] rounded border font-medium transition ${
                        formRule.isNegated
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {formRule.isNegated ? 'Condición: NO estar en esta forma' : 'Condición: SÍ estar en esta forma'}
                    </button>
                  </div>
                )}
              </div>

              {/* Equipment */}
              <div className="p-3 bg-[#0e141d] rounded-lg border border-[#1f2b3b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-300">Tipo de Equipo</span>
                  <input
                    type="checkbox"
                    checked={!!equippedRule}
                    onChange={(e) => handleToggleEquipped(e.target.checked, equippedRule?.value || 'Shields', equippedRule?.isNegated)}
                    className="rounded text-amber-500 bg-[#0c1017] border-[#2d3a4b] cursor-pointer"
                  />
                </div>
                {equippedRule && (
                  <div className="space-y-2 pt-1">
                    <select
                      value={equippedRule.value || 'Shields'}
                      onChange={(e) => handleToggleEquipped(true, e.target.value, equippedRule.isNegated)}
                      className="w-full bg-[#080c12] border border-[#27364a] text-xs text-amber-300 rounded p-1.5"
                    >
                      <option value="Shields">Escudo (equipped:Shields)</option>
                      <option value="Two-Hand">Arma 2 Manos (equipped:Two-Hand)</option>
                      <option value="Daggers">Dagas (equipped:Daggers)</option>
                      <option value="One-Hand">Armas 1 Mano (equipped:One-Hand)</option>
                      <option value="Wands">Varitas (equipped:Wands)</option>
                    </select>
                    <button
                      onClick={() => handleToggleEquipped(true, equippedRule.value || 'Shields', !equippedRule.isNegated)}
                      className={`w-full py-1 text-[11px] rounded border font-medium transition ${
                        equippedRule.isNegated
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {equippedRule.isNegated ? 'Condición: NO llevar equipado' : 'Condición: SÍ llevar equipado'}
                    </button>
                  </div>
                )}
              </div>

              {/* Channeling */}
              <div className="p-3 bg-[#0e141d] rounded-lg border border-[#1f2b3b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-300">Canalización Hechizo</span>
                  <input
                    type="checkbox"
                    checked={!!chanRule}
                    onChange={(e) => handleToggleChanneling(e.target.checked, chanRule?.value || '', chanRule?.isNegated ?? true)}
                    className="rounded text-amber-500 bg-[#0c1017] border-[#2d3a4b] cursor-pointer"
                  />
                </div>
                {chanRule && (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={chanRule.value || ''}
                      onChange={(e) => handleToggleChanneling(true, e.target.value, chanRule.isNegated)}
                      placeholder="Nombre hechizo (opcional)"
                      className="w-full bg-[#080c12] border border-[#27364a] text-xs text-sky-300 rounded p-1.5 placeholder-gray-600"
                    />
                    <button
                      onClick={() => handleToggleChanneling(true, chanRule.value || '', !chanRule.isNegated)}
                      className={`w-full py-1 text-[11px] rounded border font-medium transition ${
                        chanRule.isNegated
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {chanRule.isNegated ? 'Evitar pisar (nochanneling)' : 'Solo si está canalizando (channeling)'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Live Syntax & Validation Footer Panel */}
        <div className="border-t border-[#1f2a3a] bg-[#0d131c] p-4 space-y-3">
          
          {/* Live Syntax Badge & Human Translation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Sintaxis del Paso {activeBracketIndex + 1}:
              </span>
              <span className="font-mono text-sm font-bold text-amber-300 bg-amber-500/15 px-3 py-0.5 rounded-lg border border-amber-500/30">
                {formatBracket(currentBracket)}
              </span>
            </div>
            
            <span className="text-xs text-sky-300/90 italic line-clamp-1 bg-[#141d2a] px-2.5 py-1 rounded border border-[#243347]">
              💡 {validation.humanDescription}
            </span>
          </div>

          {/* Validation Warnings / Error Banner */}
          {validation.issues.length > 0 && (
            <div className="space-y-1.5">
              {validation.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start space-x-3 text-xs animate-in slide-in-from-top-1 ${
                    issue.severity === 'error'
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    issue.severity === 'error' ? 'text-rose-400' : 'text-amber-400'
                  }`} />
                  <div className="space-y-1">
                    <strong className="font-bold block text-sm">
                      {issue.title}
                    </strong>
                    <p className="text-gray-300 leading-relaxed">
                      {issue.description}
                    </p>
                    {issue.suggestion && (
                      <p className="text-amber-300/90 font-mono text-[11px] bg-black/30 p-1.5 rounded border border-white/10 mt-1">
                        💡 Sugerencia: {issue.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Buttons row */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleClearCurrentStep}
              className="text-xs text-gray-400 hover:text-red-400 transition"
            >
              Limpiar filtros de este paso
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#17202c] hover:bg-[#202d3e] text-gray-300 text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAndClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-glow-gold transition flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar Condiciones</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
