import React, { useState } from 'react';
import { MacroData, SimulationState, MacroBlock, ConditionBracket } from '../../types/macro';
import { 
  Sliders, 
  Play, 
  Sparkles, 
  Crosshair, 
  MousePointer2, 
  Keyboard, 
  Flame, 
  ShieldAlert, 
  Swords,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface MacroSimulatorProps {
  macro: MacroData;
}

export const MacroSimulator: React.FC<MacroSimulatorProps> = ({ macro }) => {
  const [state, setState] = useState<SimulationState>({
    hasTarget: true,
    targetIsHarm: true,
    targetIsDead: false,
    hasMouseover: false,
    mouseoverIsHarm: false,
    mouseoverIsDead: false,
    hasFocus: false,
    focusIsHarm: true,
    inCombat: true,
    inStealth: false,
    isMounted: false,
    isFlyable: true,
    modShift: false,
    modCtrl: false,
    modAlt: false,
    currentForm: 0,
    buttonClick: 1
  });

  /**
   * Evaluates if a single condition bracket passes given the simulated state
   */
  const evaluateBracket = (bracket: ConditionBracket): boolean => {
    // 1. Check target existence and validity
    if (bracket.target) {
      if (bracket.target === '@mouseover' && !state.hasMouseover) return false;
      if (bracket.target === '@focus' && !state.hasFocus) return false;
      if (bracket.target === '@target' && !state.hasTarget) return false;
    }

    // 2. Check each rule
    for (const rule of bracket.rules) {
      switch (rule.type) {
        case 'mod':
          if (rule.isNegated) {
            // nomod: neither shift, ctrl nor alt
            if (state.modShift || state.modCtrl || state.modAlt) return false;
          } else {
            if (rule.value === 'shift' && !state.modShift) return false;
            if (rule.value === 'ctrl' && !state.modCtrl) return false;
            if (rule.value === 'alt' && !state.modAlt) return false;
            if (!rule.value && !state.modShift && !state.modCtrl && !state.modAlt) return false;
          }
          break;

        case 'harm':
          // Contextual target: check mouseover if target is @mouseover, otherwise regular target
          const isHarmTarget = bracket.target === '@mouseover' ? state.mouseoverIsHarm : state.targetIsHarm;
          if (rule.isNegated) {
            // help: must be friendly
            if (isHarmTarget) return false;
          } else {
            // harm: must be enemy
            if (!isHarmTarget) return false;
          }
          break;

        case 'nodead':
          const isDeadTarget = bracket.target === '@mouseover' ? state.mouseoverIsDead : state.targetIsDead;
          if (rule.isNegated) {
            // dead: must be dead
            if (!isDeadTarget) return false;
          } else {
            // nodead: must be alive
            if (isDeadTarget) return false;
          }
          break;

        case 'combat':
          if (rule.isNegated) {
            if (state.inCombat) return false;
          } else {
            if (!state.inCombat) return false;
          }
          break;

        case 'stealth':
          if (rule.isNegated) {
            if (state.inStealth) return false;
          } else {
            if (!state.inStealth) return false;
          }
          break;

        case 'flyable':
          if (rule.isNegated) {
            if (state.isFlyable) return false;
          } else {
            if (!state.isFlyable) return false;
          }
          break;

        case 'mounted':
          if (rule.isNegated) {
            if (state.isMounted) return false;
          } else {
            if (!state.isMounted) return false;
          }
          break;

        case 'form':
        case 'stance':
          if (rule.value !== undefined) {
            const reqForm = parseInt(rule.value, 10);
            if (rule.isNegated) {
              if (state.currentForm === reqForm) return false;
            } else {
              if (state.currentForm !== reqForm) return false;
            }
          }
          break;

        default:
          break;
      }
    }

    return true;
  };

  /**
   * Evaluates a block and returns what it executes
   */
  const evaluateBlock = (block: MacroBlock): { willTrigger: boolean; matchedTarget?: string; reason: string } => {
    if (!block.enabled) return { willTrigger: false, reason: 'Bloque desactivado' };

    if (!block.brackets || block.brackets.length === 0) {
      return { willTrigger: true, matchedTarget: '@target', reason: 'Sin condiciones (ejecución directa)' };
    }

    for (let i = 0; i < block.brackets.length; i++) {
      const bracket = block.brackets[i];
      if (evaluateBracket(bracket)) {
        return {
          willTrigger: true,
          matchedTarget: bracket.target || '@target',
          reason: `Condición ${i + 1} cumplida`
        };
      }
    }

    return { willTrigger: false, reason: 'Ninguna condición de los corchetes coincidió' };
  };

  return (
    <div className="bg-[#121820] border border-[#232c37] rounded-xl overflow-hidden shadow-xl p-4 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#232c37] pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/30">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100 font-display">
              Simulador Interactivo de Macro en Tiempo Real
            </h3>
            <p className="text-[11px] text-gray-400">
              Modifica los estados de abajo para ver qué habilidad se lanzaría en WoW bajo estas circunstancias.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d121a] p-3.5 rounded-xl border border-[#202936]">
        
        {/* Modifiers */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
            <Keyboard className="w-3 h-3" />
            <span>Teclas Modificadoras</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setState({ ...state, modShift: !state.modShift })}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition ${
                state.modShift ? 'bg-amber-500 text-black shadow-glow-gold' : 'bg-[#182230] text-gray-400'
              }`}
            >
              Shift
            </button>
            <button
              onClick={() => setState({ ...state, modCtrl: !state.modCtrl })}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition ${
                state.modCtrl ? 'bg-amber-500 text-black shadow-glow-gold' : 'bg-[#182230] text-gray-400'
              }`}
            >
              Ctrl
            </button>
            <button
              onClick={() => setState({ ...state, modAlt: !state.modAlt })}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition ${
                state.modAlt ? 'bg-amber-500 text-black shadow-glow-gold' : 'bg-[#182230] text-gray-400'
              }`}
            >
              Alt
            </button>
          </div>
        </div>

        {/* Target Status */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1">
            <Crosshair className="w-3 h-3" />
            <span>Objetivo Actual (@target)</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setState({ ...state, hasTarget: !state.hasTarget })}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                state.hasTarget ? 'bg-sky-500 text-black font-bold' : 'bg-[#182230] text-gray-400'
              }`}
            >
              {state.hasTarget ? 'Hay Target' : 'Sin Target'}
            </button>
            {state.hasTarget && (
              <button
                onClick={() => setState({ ...state, targetIsHarm: !state.targetIsHarm })}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  state.targetIsHarm ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {state.targetIsHarm ? 'Enemigo (Harm)' : 'Amigo (Help)'}
              </button>
            )}
          </div>
        </div>

        {/* Mouseover Status */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
            <MousePointer2 className="w-3 h-3" />
            <span>Cursor (@mouseover)</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setState({ ...state, hasMouseover: !state.hasMouseover })}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                state.hasMouseover ? 'bg-emerald-500 text-black font-bold' : 'bg-[#182230] text-gray-400'
              }`}
            >
              {state.hasMouseover ? 'Sobre Unidad' : 'Sin Mouseover'}
            </button>
            {state.hasMouseover && (
              <button
                onClick={() => setState({ ...state, mouseoverIsHarm: !state.mouseoverIsHarm })}
                className={`px-2 py-1 rounded text-xs font-medium transition ${
                  state.mouseoverIsHarm ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {state.mouseoverIsHarm ? 'Enemigo' : 'Aliado'}
              </button>
            )}
          </div>
        </div>

        {/* Combat & Environment */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1">
            <Swords className="w-3 h-3" />
            <span>Estado & Entorno</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setState({ ...state, inCombat: !state.inCombat })}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                state.inCombat ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-[#182230] text-gray-400'
              }`}
            >
              {state.inCombat ? 'En Combate' : 'Fuera Combate'}
            </button>
            <button
              onClick={() => setState({ ...state, isFlyable: !state.isFlyable })}
              className={`px-2 py-1 rounded text-xs font-medium transition ${
                state.isFlyable ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-[#182230] text-gray-400'
              }`}
            >
              {state.isFlyable ? 'Zona Volable' : 'No Volable'}
            </button>
          </div>
        </div>

      </div>

      {/* Evaluation Results */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Resultado de Ejecución en Juego:
        </h4>

        {macro.blocks.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-500 bg-[#0c1017] rounded-lg">
            Añade bloques a la macro para probar la simulación.
          </div>
        ) : (
          <div className="space-y-2">
            {macro.blocks.map((block, idx) => {
              const res = evaluateBlock(block);
              return (
                <div
                  key={block.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between transition ${
                    res.willTrigger
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 shadow-sm'
                      : 'bg-[#0e131b] border-[#1e2736] text-gray-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {res.willTrigger ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-600 shrink-0" />
                    )}
                    <span className="font-mono text-xs font-bold">
                      {block.command} {block.argument}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        res.willTrigger
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {res.reason} {res.matchedTarget ? `(${res.matchedTarget})` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
