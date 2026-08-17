import React, { useState } from 'react';
import { 
  ConditionBracket, 
  ConditionRule, 
  MacroBlock, 
  TargetSelector 
} from '../../types/macro';
import { TARGET_SELECTORS, CONDITION_TYPES } from '../../data/conditionsData';
import { 
  X, 
  Plus, 
  Trash2, 
  SlidersHorizontal, 
  Check, 
  HelpCircle, 
  MousePointer2, 
  Layers,
  ArrowRight
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

  const currentBracket = brackets[activeBracketIndex] || brackets[0];

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

  const handleRemoveBracket = (index: number) => {
    if (brackets.length <= 1) {
      setBrackets([]);
      return;
    }
    const updated = brackets.filter((_, i) => i !== index);
    setBrackets(updated);
    if (activeBracketIndex >= updated.length) {
      setActiveBracketIndex(updated.length - 1);
    }
  };

  const handleSetTarget = (target: TargetSelector) => {
    const updated = [...brackets];
    if (!updated[activeBracketIndex]) return;
    updated[activeBracketIndex].target = 
      updated[activeBracketIndex].target === target ? undefined : target;
    setBrackets(updated);
  };

  const handleToggleRule = (type: string, defaultNegative: boolean = false, defaultValue?: string) => {
    const updated = [...brackets];
    if (!updated[activeBracketIndex]) return;

    const existingIndex = updated[activeBracketIndex].rules.findIndex(r => r.type === type);
    if (existingIndex >= 0) {
      // Toggle or remove
      updated[activeBracketIndex].rules.splice(existingIndex, 1);
    } else {
      // Add rule
      updated[activeBracketIndex].rules.push({
        id: `r_${Date.now()}_${Math.random()}`,
        type,
        isNegated: defaultNegative,
        value: defaultValue
      });
    }
    setBrackets(updated);
  };

  const handleUpdateRuleValue = (ruleId: string, value: string) => {
    const updated = [...brackets];
    if (!updated[activeBracketIndex]) return;
    const rule = updated[activeBracketIndex].rules.find(r => r.id === ruleId);
    if (rule) {
      rule.value = value;
    }
    setBrackets(updated);
  };

  const handleToggleRuleNegation = (ruleId: string) => {
    const updated = [...brackets];
    if (!updated[activeBracketIndex]) return;
    const rule = updated[activeBracketIndex].rules.find(r => r.id === ruleId);
    if (rule) {
      rule.isNegated = !rule.isNegated;
    }
    setBrackets(updated);
  };

  const handleSaveAndClose = () => {
    // Filter out empty brackets with no target and no rules, unless user wants unconditional fallback []
    onSave(brackets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#121822] border border-[#2b394a] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-[#232c37] bg-[#161f2b] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-100 font-display flex items-center space-x-2">
                <span>Configurar Modificadores y Condiciones</span>
                <span className="text-xs font-mono font-normal text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {block.command} {block.argument}
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Las condiciones entre corchetes <code className="text-amber-300 font-mono">[ ... ]</code> determinan cuándo y a quién se aplica esta acción.
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

        {/* Bracket Tabs (Groups for fallback prioritization: [cond1][cond2][fallback]) */}
        <div className="p-3 bg-[#0d121a] border-b border-[#202936] flex items-center justify-between overflow-x-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Prioridades:</span>
            </span>
            {brackets.map((br, idx) => (
              <div
                key={br.id}
                onClick={() => setActiveBracketIndex(idx)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-2 transition ${
                  activeBracketIndex === idx
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-[#151c27] border-[#253243] text-gray-300 hover:bg-[#1a2331]'
                }`}
              >
                <span>Paso {idx + 1} {br.target ? `(${br.target})` : ''}</span>
                {brackets.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBracket(idx);
                    }}
                    className="hover:text-red-400 text-gray-500 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddBracket}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#182332] hover:bg-[#223044] text-xs font-medium text-amber-400 border border-amber-500/30 transition shadow-sm ml-2 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Prioridad Siguiente</span>
          </button>
        </div>

        {/* Modal Body */}
        {currentBracket ? (
          <div className="flex-1 p-4 overflow-y-auto space-y-5">
            
            {/* 1. Target Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <MousePointer2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>1. Selección de Objetivo (@target)</span>
                </label>
                <span className="text-[11px] text-gray-400">Opcional (si no se selecciona, toma el target normal)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TARGET_SELECTORS.map((t) => {
                  const isSelected = currentBracket.target === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => handleSetTarget(t.value)}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-glow-frost'
                          : 'bg-[#151c27] border-[#253243] text-gray-300 hover:bg-[#1b2533] hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">{t.shortLabel}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 line-clamp-1">{t.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Condition Rules */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Modificadores y Estados Lógicos</span>
                </label>
              </div>

              <div className="space-y-3">
                {CONDITION_TYPES.map((cond) => {
                  const activeRule = currentBracket.rules.find(r => r.type === cond.type);
                  const isChecked = !!activeRule;

                  return (
                    <div
                      key={cond.type}
                      className={`p-3 rounded-xl border transition ${
                        isChecked
                          ? 'bg-[#182332] border-amber-500/40 shadow-sm'
                          : 'bg-[#141b25] border-[#222c39] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleRule(cond.type, false, cond.valueOptions?.[0]?.value)}
                            className="w-4 h-4 rounded text-amber-500 bg-[#0c1017] border-[#2d3a4b] focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-semibold text-gray-200">
                              {cond.name}
                            </span>
                            <p className="text-[11px] text-gray-400">{cond.description}</p>
                          </div>
                        </div>

                        {/* Extra controls if active */}
                        {isChecked && activeRule && (
                          <div className="flex items-center space-x-2">
                            {/* Negation toggle */}
                            {cond.allowNegation && (
                              <button
                                onClick={() => handleToggleRuleNegation(activeRule.id)}
                                className={`px-2 py-1 rounded text-[11px] font-medium border transition ${
                                  activeRule.isNegated
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}
                              >
                                {activeRule.isNegated
                                  ? cond.negationLabel || 'Negado (NO)'
                                  : 'Condición Positiva (SÍ)'}
                              </button>
                            )}

                            {/* Options dropdown */}
                            {cond.hasValue && cond.valueOptions && (
                              <select
                                value={activeRule.value || ''}
                                onChange={(e) => handleUpdateRuleValue(activeRule.id, e.target.value)}
                                className="bg-[#0d121a] border border-[#2b394a] rounded px-2 py-1 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono"
                              >
                                {cond.valueOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-xs">
            No hay grupos de condiciones configurados. Pulsa en &quot;Añadir Prioridad Siguiente&quot; para crear uno.
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#232c37] bg-[#161f2b] flex items-center justify-between">
          <button
            onClick={() => setBrackets([])}
            className="text-xs text-gray-400 hover:text-red-400 transition"
          >
            Limpiar todas las condiciones (acción simple)
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#1a2330] hover:bg-[#232f42] text-gray-300 text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndClose}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-glow-gold transition"
            >
              Guardar y Aplicar Condiciones
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
