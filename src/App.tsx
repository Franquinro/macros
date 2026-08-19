import React, { useState, useEffect } from 'react';
import { MacroData, MacroBlock, ConditionBracket } from './types/macro';
import { DEFAULT_PRESETS } from './data/defaultPresets';
import { CommandDefinition } from './data/commandsData';
import { 
  getSavedMacros, 
  saveMacroItem, 
  deleteMacroItem, 
  getActiveMacro, 
  setActiveMacro 
} from './utils/storage';

// Components
import { Header } from './components/common/Header';
import { BlockPalette } from './components/builder/BlockPalette';
import { MacroCanvas } from './components/builder/MacroCanvas';
import { MacroPreview } from './components/preview/MacroPreview';
import { ConditionModal } from './components/builder/ConditionModal';
import { CastSequenceModal } from './components/builder/CastSequenceModal';
import { PresetsModal } from './components/presets/PresetsModal';
import { CoaHubModal } from './components/coa/CoaHubModal';
import { MyMacrosModal } from './components/common/MyMacrosModal';
import { ImportExportModal } from './components/common/ImportExportModal';
import { MacroSimulator } from './components/simulator/MacroSimulator';
import { Toast, ToastMessage } from './components/common/Toast';

import { 
  Sparkles, 
  Play, 
  HelpCircle, 
  Layers, 
  BookOpen, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';

export const App: React.FC = () => {
  // Saved macros state
  const [savedMacros, setSavedMacros] = useState<MacroData[]>([]);
  
  // Current active macro
  const [currentMacro, setCurrentMacro] = useState<MacroData>(() => {
    const saved = getActiveMacro();
    return saved || DEFAULT_PRESETS[0];
  });

  // Active view tab: 'builder' | 'simulator' | 'guide'
  const [activeTab, setActiveTab] = useState<'builder' | 'simulator' | 'guide'>('builder');

  // Modals state
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isCoaOpen, setIsCoaOpen] = useState(false);
  const [isMyMacrosOpen, setIsMyMacrosOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [conditionBlock, setConditionBlock] = useState<MacroBlock | null>(null);
  const [castSequenceBlock, setCastSequenceBlock] = useState<MacroBlock | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const newToast: ToastMessage = { id: `toast_${Date.now()}_${Math.random()}`, type, text };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load saved macros on start
  useEffect(() => {
    const all = getSavedMacros();
    setSavedMacros(all);
  }, []);

  // Save current macro state to localStorage
  useEffect(() => {
    setActiveMacro(currentMacro);
  }, [currentMacro]);

  // Handlers
  const handleNewMacro = () => {
    const newMacro: MacroData = {
      id: `macro_${Date.now()}`,
      name: 'Nueva Super Macro',
      description: 'Macro personalizada para WoW 3.3.5a',
      icon: 'Sparkles',
      category: 'general',
      blocks: [
        {
          id: `b_${Date.now()}_1`,
          command: '#showtooltip',
          brackets: [],
          argument: '',
          enabled: true
        },
        {
          id: `b_${Date.now()}_2`,
          command: '/cast',
          brackets: [],
          argument: 'Spell Name',
          enabled: true
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setCurrentMacro(newMacro);
    addToast('info', 'Nueva macro creada lista para configurar.');
  };

  const handleSaveCurrentMacro = () => {
    saveMacroItem(currentMacro);
    setSavedMacros(getSavedMacros());
    addToast('success', `¡Macro "${currentMacro.name}" guardada en Mis Macros!`);
  };

  const handleDeleteSavedMacro = (macroId: string) => {
    const updated = deleteMacroItem(macroId);
    setSavedMacros(updated);
    addToast('info', 'Macro eliminada.');
  };

  const handleAddCommandFromPalette = (cmdDef: CommandDefinition) => {
    const newBlock: MacroBlock = {
      id: `block_${Date.now()}_${Math.random()}`,
      command: cmdDef.command,
      brackets: [],
      argument: cmdDef.defaultArg || '',
      enabled: true
    };
    setCurrentMacro({
      ...currentMacro,
      blocks: [...currentMacro.blocks, newBlock],
      updatedAt: Date.now()
    });
    addToast('info', `Bloque ${cmdDef.command} añadido.`);
  };

  const handleQuickAddBlock = (cmd: string, arg?: string) => {
    const newBlock: MacroBlock = {
      id: `block_${Date.now()}_${Math.random()}`,
      command: cmd,
      brackets: [],
      argument: arg || '',
      enabled: true
    };
    setCurrentMacro({
      ...currentMacro,
      blocks: [...currentMacro.blocks, newBlock],
      updatedAt: Date.now()
    });
  };

  const handleSaveConditionBrackets = (newBrackets: ConditionBracket[]) => {
    if (!conditionBlock) return;
    const updatedBlocks = currentMacro.blocks.map(b => 
      b.id === conditionBlock.id ? { ...b, brackets: newBrackets } : b
    );
    setCurrentMacro({
      ...currentMacro,
      blocks: updatedBlocks,
      updatedAt: Date.now()
    });
    setConditionBlock(null);
    addToast('success', 'Condiciones actualizadas.');
  };

  const handleSaveCastSequenceArgument = (newArg: string) => {
    if (!castSequenceBlock) return;
    const updatedBlocks = currentMacro.blocks.map(b => 
      b.id === castSequenceBlock.id ? { ...b, argument: newArg } : b
    );
    setCurrentMacro({
      ...currentMacro,
      blocks: updatedBlocks,
      updatedAt: Date.now()
    });
    setCastSequenceBlock(null);
    addToast('success', 'Secuencia /castsequence actualizada.');
  };

  return (
    <div className="min-h-screen bg-[#090c10] text-gray-100 flex flex-col selection:bg-amber-500 selection:text-black">
      
      {/* Top Navigation */}
      <Header
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenCoA={() => setIsCoaOpen(true)}
        onOpenMyMacros={() => setIsMyMacrosOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onNewMacro={handleNewMacro}
        onSaveCurrentMacro={handleSaveCurrentMacro}
        savedCount={savedMacros.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 space-y-4">
        
        {/* Navigation Tabs (Constructor Visual / Simulador en Vivo / Guía 3.3.5a) */}
        <div className="flex items-center justify-between border-b border-[#202936] pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition font-display uppercase tracking-wider ${
                activeTab === 'builder'
                  ? 'bg-amber-500 text-black shadow-glow-gold'
                  : 'bg-[#121820] text-gray-400 hover:text-gray-200 border border-[#232c37]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Constructor Visual</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition font-display uppercase tracking-wider ${
                activeTab === 'simulator'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-glow-fel'
                  : 'bg-[#121820] text-gray-400 hover:text-gray-200 border border-[#232c37]'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Simulador de Ejecución</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition font-display uppercase tracking-wider ${
                activeTab === 'guide'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-black shadow-glow-frost'
                  : 'bg-[#121820] text-gray-400 hover:text-gray-200 border border-[#232c37]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Manual y Sintaxis WoW 3.3.5a</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Motor inteligente 3.3.5a</span>
          </div>
        </div>

        {/* TAB 1: BUILDER VIEW */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Column: Command Catalog / Palette (3 Cols) */}
            <div className="lg:col-span-3">
              <BlockPalette onAddCommand={handleAddCommandFromPalette} />
            </div>

            {/* Middle Column: Macro Canvas & Blocks (5 Cols) */}
            <div className="lg:col-span-5">
              <MacroCanvas
                macro={currentMacro}
                onUpdateMacro={setCurrentMacro}
                onOpenConditions={(b) => setConditionBlock(b)}
                onOpenCastSequence={(b) => setCastSequenceBlock(b)}
                onQuickAddBlock={handleQuickAddBlock}
              />
            </div>

            {/* Right Column: Code Preview, 255-char counter & Copy (4 Cols) */}
            <div className="lg:col-span-4">
              <MacroPreview
                macro={currentMacro}
                onOpenImportText={() => setIsImportExportOpen(true)}
              />
            </div>

          </div>
        )}

        {/* TAB 2: LIVE SIMULATOR VIEW */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
              <MacroSimulator macro={currentMacro} />
            </div>
            <div className="lg:col-span-4">
              <MacroPreview
                macro={currentMacro}
                onOpenImportText={() => setIsImportExportOpen(true)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: 3.3.5a / CoA SYNTAX GUIDE */}
        {activeTab === 'guide' && (
          <div className="bg-[#121820] border border-[#232c37] rounded-2xl p-6 space-y-6 shadow-xl">
            <div>
              <h2 className="text-xl font-bold font-display text-amber-300">
                Guía Rápida de Sintaxis de Macros en WoW 3.3.5a & Ascension CoA
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Aprende cómo funcionan las reglas lógicas y modificadores en el cliente Wrath of the Lich King.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-xl bg-[#151c27] border border-[#253243] space-y-2">
                <h3 className="text-sm font-bold text-sky-300 font-display">
                  1. Reglas de Corchetes: AND vs OR
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-gray-200">Comas (AND):</strong> Dentro del mismo corchete <code className="text-sky-300 font-mono">[@mouseover,help,nodead]</code> todas las condiciones deben cumplirse simultáneamente.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-gray-200">Múltiples Corchetes (OR):</strong> Al encadenar <code className="text-amber-300 font-mono">[cond1][cond2][@player]</code>, WoW evalúa de izquierda a derecha y ejecuta la primera que sea válida.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151c27] border border-[#253243] space-y-2">
                <h3 className="text-sm font-bold text-emerald-300 font-display">
                  2. Límite de 255 Caracteres
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  El cliente nativo de 3.3.5a no permite macros mayores de 255 caracteres en la interfaz estándar.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  MacroWolk te avisa automáticamente y dispone de un <strong className="text-emerald-400">Divisor Automático</strong> si tu secuencia es demasiado larga.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#151c27] border border-[#253243] space-y-2">
                <h3 className="text-sm font-bold text-amber-300 font-display">
                  3. Conquest of Azeroth & Swaps
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  En CoA, las macros de intercambio de armas <code className="text-amber-300 font-mono">/equipslot 16</code> y <code className="text-amber-300 font-mono">/equipslot 17</code> combinadas con habilidades de arquetipos permiten transiciones instantáneas entre daño y defensa.
                </p>
              </div>

            </div>

            {/* Common Cheat Sheet */}
            <div className="p-4 rounded-xl bg-[#0e131b] border border-[#202936] space-y-3">
              <h3 className="text-sm font-bold text-gray-200 font-display">
                Tabla de Modificadores Frecuentes
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-[#141b25] border border-[#253243]">
                  <span className="text-amber-400 font-bold">@mouseover</span>
                  <div className="text-[11px] text-gray-400">Unidad bajo cursor</div>
                </div>
                <div className="p-2 rounded bg-[#141b25] border border-[#253243]">
                  <span className="text-amber-400 font-bold">@focus</span>
                  <div className="text-[11px] text-gray-400">Objetivo secundario</div>
                </div>
                <div className="p-2 rounded bg-[#141b25] border border-[#253243]">
                  <span className="text-amber-400 font-bold">mod:shift</span>
                  <div className="text-[11px] text-gray-400">Pulsando tecla Shift</div>
                </div>
                <div className="p-2 rounded bg-[#141b25] border border-[#253243]">
                  <span className="text-amber-400 font-bold">nomod</span>
                  <div className="text-[11px] text-gray-400">Sin Shift/Ctrl/Alt</div>
                </div>
                <div className="p-2 rounded bg-[#141b25] border border-[#253243]">
                  <span className="text-amber-400 font-bold">harm / help</span>
                  <div className="text-[11px] text-gray-400">Hostil / Amistoso</div>
                </div>
                <div className="p-2 rounded bg-[#141b25] border border-[#253243]">
                  <span className="text-amber-400 font-bold">nodead</span>
                  <div className="text-[11px] text-gray-400">Objetivo con vida</div>
                </div>
                <div className="p-2 rounded bg-[#141b25] border border-[#253243]">
                  <span className="text-amber-400 font-bold">nochanneling</span>
                  <div className="text-[11px] text-gray-400">Evita pisar canalizados</div>
                </div>
                <div className="p-2 rounded bg-[#141b25] border border-[#253243]">
                  <span className="text-amber-400 font-bold">form:1 / form:2</span>
                  <div className="text-[11px] text-gray-400">Postura o Forma</div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODALS */}
      {conditionBlock && (
        <ConditionModal
          block={conditionBlock}
          isOpen={!!conditionBlock}
          onClose={() => setConditionBlock(null)}
          onSave={handleSaveConditionBrackets}
        />
      )}

      {castSequenceBlock && (
        <CastSequenceModal
          block={castSequenceBlock}
          isOpen={!!castSequenceBlock}
          onClose={() => setCastSequenceBlock(null)}
          onSave={handleSaveCastSequenceArgument}
        />
      )}

      {isPresetsOpen && (
        <PresetsModal
          isOpen={isPresetsOpen}
          onClose={() => setIsPresetsOpen(false)}
          onSelectPreset={(p) => {
            setCurrentMacro(p);
            addToast('success', `Plantilla "${p.name}" cargada.`);
          }}
        />
      )}

      {isCoaOpen && (
        <CoaHubModal
          isOpen={isCoaOpen}
          onClose={() => setIsCoaOpen(false)}
          onLoadCoaMacro={(m) => {
            setCurrentMacro(m);
            addToast('success', `Macro de CoA "${m.name}" cargada.`);
          }}
          onAddSpellBlock={(spellName) => {
            const newBlock: MacroBlock = {
              id: `b_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              command: '/cast',
              brackets: [],
              argument: spellName,
              enabled: true
            };
            setCurrentMacro({
              ...currentMacro,
              blocks: [...currentMacro.blocks, newBlock],
              updatedAt: Date.now()
            });
            addToast('success', `Hechizo "${spellName}" añadido como bloque /cast.`);
          }}
        />
      )}

      {isMyMacrosOpen && (
        <MyMacrosModal
          isOpen={isMyMacrosOpen}
          onClose={() => setIsMyMacrosOpen(false)}
          savedMacros={savedMacros}
          onLoadMacro={(m) => {
            setCurrentMacro(m);
            addToast('success', `Macro "${m.name}" cargada.`);
          }}
          onDeleteMacro={handleDeleteSavedMacro}
        />
      )}

      {isImportExportOpen && (
        <ImportExportModal
          isOpen={isImportExportOpen}
          onClose={() => setIsImportExportOpen(false)}
          onImportTextMacro={(m) => {
            setCurrentMacro(m);
            addToast('success', `Macro "${m.name}" importada e interpretada a bloques.`);
          }}
          onImportJsonSuccess={() => {
            setSavedMacros(getSavedMacros());
            addToast('success', 'Macros restauradas con éxito.');
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="border-t border-[#1c2430] bg-[#0b0e14] py-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>MacroWolk</strong> — Optimizado para World of Warcraft 3.3.5a y Project Ascension (CoA)
          </span>
          <span className="text-[11px] text-gray-600">
            Lanzamiento instantáneo, sin recarga y guardado local seguro.
          </span>
        </div>
      </footer>

    </div>
  );
};
