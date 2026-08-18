import React, { useState, useEffect } from 'react';
import { MacroBlock } from '../../types/macro';
import { 
  X, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  RotateCcw, 
  Clock, 
  Swords, 
  Target, 
  Keyboard, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface CastSequenceModalProps {
  block: MacroBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (argument: string) => void;
}

export const CastSequenceModal: React.FC<CastSequenceModalProps> = ({
  block,
  isOpen,
  onClose,
  onSave
}) => {
  // Reset conditions state
  const [resetCombat, setResetCombat] = useState(false);
  const [resetTarget, setResetTarget] = useState(false);
  const [resetShift, setResetShift] = useState(false);
  const [resetCtrl, setResetCtrl] = useState(false);
  const [resetAlt, setResetAlt] = useState(false);
  const [resetSeconds, setResetSeconds] = useState<string>('');

  // Spells sequence list
  const [spells, setSpells] = useState<string[]>([]);
  const [newSpellInput, setNewSpellInput] = useState('');

  // Parse existing block argument on open
  useEffect(() => {
    if (!block || !isOpen) return;

    const raw = block.argument || '';
    let resetPart = '';
    let spellsPart = raw;

    // Check if starts with reset=...
    if (raw.startsWith('reset=')) {
      const spaceIdx = raw.indexOf(' ');
      if (spaceIdx !== -1) {
        resetPart = raw.slice(0, spaceIdx).replace('reset=', '');
        spellsPart = raw.slice(spaceIdx + 1);
      } else {
        resetPart = raw.replace('reset=', '');
        spellsPart = '';
      }
    }

    // Parse reset triggers
    const resetTokens = resetPart.split('/').map(t => t.trim()).filter(Boolean);
    setResetCombat(resetTokens.includes('combat'));
    setResetTarget(resetTokens.includes('target'));
    setResetShift(resetTokens.includes('shift'));
    setResetCtrl(resetTokens.includes('ctrl'));
    setResetAlt(resetTokens.includes('alt'));

    const numToken = resetTokens.find(t => /^\d+$/.test(t));
    setResetSeconds(numToken || '');

    // Parse spell list
    const parsedSpells = spellsPart
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setSpells(parsedSpells.length > 0 ? parsedSpells : ['Habilidad 1', 'Habilidad 2']);
  }, [block, isOpen]);

  if (!isOpen || !block) return null;

  const handleAddSpell = () => {
    if (!newSpellInput.trim()) return;
    setSpells([...spells, newSpellInput.trim()]);
    setNewSpellInput('');
  };

  const handleRemoveSpell = (index: number) => {
    setSpells(spells.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...spells];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setSpells(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= spells.length - 1) return;
    const updated = [...spells];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setSpells(updated);
  };

  const handleUpdateSpellName = (index: number, val: string) => {
    const updated = [...spells];
    updated[index] = val;
    setSpells(updated);
  };

  // Build final /castsequence argument string
  const buildArgumentString = (): string => {
    const resetParts: string[] = [];
    if (resetCombat) resetParts.push('combat');
    if (resetTarget) resetParts.push('target');
    if (resetShift) resetParts.push('shift');
    if (resetCtrl) resetParts.push('ctrl');
    if (resetAlt) resetParts.push('alt');
    if (resetSeconds && /^\d+$/.test(resetSeconds)) resetParts.push(resetSeconds);

    const resetClause = resetParts.length > 0 ? `reset=${resetParts.join('/')}` : '';
    const spellsClause = spells.join(', ');

    if (resetClause && spellsClause) {
      return `${resetClause} ${spellsClause}`;
    }
    return resetClause || spellsClause;
  };

  const fullArgument = buildArgumentString();

  const handleSave = () => {
    onSave(fullArgument);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#101620] border border-[#273547] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1f2a3a] bg-[#141c28] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/30 text-indigo-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100 font-display flex items-center space-x-2">
                <span>Asistente de Secuencia (/castsequence)</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Encadena múltiples habilidades que se lanzan una tras otra con cada pulsación.
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

        {/* Modal Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5">
          
          {/* SECTION 1: Condiciones de Reseteo (reset=...) */}
          <div className="bg-[#131a24] border border-[#222e3f] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>1. Condiciones de Reinicio (reset=...)</span>
              </label>
              <span className="text-[11px] text-gray-400">¿Cuándo debe volver al primer hechizo?</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              
              {/* Combat */}
              <button
                onClick={() => setResetCombat(!resetCombat)}
                className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition ${
                  resetCombat
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm'
                    : 'bg-[#0e141d] border-[#1f2b3b] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Swords className="w-4 h-4 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold">combat</div>
                  <div className="text-[10px] text-gray-400">Al salir de combate</div>
                </div>
                {resetCombat && <Check className="w-3.5 h-3.5 text-rose-400" />}
              </button>

              {/* Target */}
              <button
                onClick={() => setResetTarget(!resetTarget)}
                className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition ${
                  resetTarget
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm'
                    : 'bg-[#0e141d] border-[#1f2b3b] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Target className="w-4 h-4 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold">target</div>
                  <div className="text-[10px] text-gray-400">Al cambiar objetivo</div>
                </div>
                {resetTarget && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </button>

              {/* Shift */}
              <button
                onClick={() => setResetShift(!resetShift)}
                className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition ${
                  resetShift
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-[#0e141d] border-[#1f2b3b] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Keyboard className="w-4 h-4 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold">shift</div>
                  <div className="text-[10px] text-gray-400">Al pulsar Shift</div>
                </div>
                {resetShift && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {/* Ctrl */}
              <button
                onClick={() => setResetCtrl(!resetCtrl)}
                className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition ${
                  resetCtrl
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-[#0e141d] border-[#1f2b3b] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Keyboard className="w-4 h-4 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold">ctrl</div>
                  <div className="text-[10px] text-gray-400">Al pulsar Ctrl</div>
                </div>
                {resetCtrl && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {/* Alt */}
              <button
                onClick={() => setResetAlt(!resetAlt)}
                className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition ${
                  resetAlt
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-[#0e141d] border-[#1f2b3b] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Keyboard className="w-4 h-4 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold">alt</div>
                  <div className="text-[10px] text-gray-400">Al pulsar Alt</div>
                </div>
                {resetAlt && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {/* Seconds Timer */}
              <div className="p-2 bg-[#0e141d] rounded-lg border border-[#1f2b3b] flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-300">Segundos</div>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={resetSeconds}
                    onChange={(e) => setResetSeconds(e.target.value)}
                    placeholder="ej: 6"
                    className="w-full bg-[#080c12] border border-[#27364a] rounded px-1.5 py-0.5 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: Orden de Habilidades de la Secuencia */}
          <div className="bg-[#131a24] border border-[#222e3f] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>2. Orden de Hechizos en la Rotación</span>
              </label>
              <span className="text-[11px] text-gray-400">{spells.length} habilidades encadenadas</span>
            </div>

            {/* Spell List */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {spells.map((spell, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-[#0e141d] border border-[#1f2b3b] rounded-lg flex items-center space-x-2 group hover:border-[#2d3e54] transition"
                >
                  {/* Step badge */}
                  <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-indigo-500/30">
                    {idx + 1}
                  </span>

                  {/* Spell input */}
                  <input
                    type="text"
                    value={spell}
                    onChange={(e) => handleUpdateSpellName(idx, e.target.value)}
                    placeholder="Nombre del hechizo o ítem"
                    className="flex-1 bg-[#080c12] border border-[#253243] rounded-md px-2.5 py-1 text-xs text-gray-100 font-mono focus:outline-none focus:border-indigo-500"
                  />

                  {/* Up / Down */}
                  <div className="flex items-center space-x-0.5">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-amber-300 disabled:opacity-20 transition"
                      title="Subir en la rotación"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === spells.length - 1}
                      className="p-1 text-gray-400 hover:text-amber-300 disabled:opacity-20 transition"
                      title="Bajar en la rotación"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveSpell(idx)}
                    disabled={spells.length <= 1}
                    className="p-1 text-gray-500 hover:text-rose-400 disabled:opacity-20 transition"
                    title="Eliminar de la secuencia"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new spell input */}
            <div className="flex items-center space-x-2 pt-2 border-t border-[#1a2330]">
              <input
                type="text"
                value={newSpellInput}
                onChange={(e) => setNewSpellInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpell();
                  }
                }}
                placeholder="Añadir siguiente hechizo (ej. Mortal Strike, Judgement...)"
                className="flex-1 bg-[#0a0f16] border border-[#263547] rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddSpell}
                disabled={!newSpellInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-black font-semibold text-xs border border-indigo-500/40 hover:border-transparent transition flex items-center space-x-1 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Paso</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer & Live Preview */}
        <div className="p-4 border-t border-[#1f2a3a] bg-[#0d131c] space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Código /castsequence:
            </span>
            <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/15 px-3 py-1 rounded-lg border border-indigo-500/30 flex-1 truncate">
              /castsequence {fullArgument}
            </span>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#17202c] hover:bg-[#202d3e] text-gray-300 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-frost transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Secuencia</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
