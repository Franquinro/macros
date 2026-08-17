import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Flame, 
  FolderDown, 
  PlusCircle, 
  Save, 
  ShieldAlert, 
  Zap 
} from 'lucide-react';

interface HeaderProps {
  onOpenPresets: () => void;
  onOpenCoA: () => void;
  onOpenMyMacros: () => void;
  onOpenImportExport: () => void;
  onNewMacro: () => void;
  onSaveCurrentMacro: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPresets,
  onOpenCoA,
  onOpenMyMacros,
  onOpenImportExport,
  onNewMacro,
  onSaveCurrentMacro,
  savedCount
}) => {
  return (
    <header className="bg-[#0e131b] border-b border-[#222c3a] sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-glow-gold flex items-center justify-center">
              <div className="w-full h-full bg-[#0d1117] rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-wider font-display bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  MacroWolk
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  WoW 3.3.5a
                </span>
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Ascension CoA
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Generador Visual de Super Macros & Sinergias para Conquest of Azeroth
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* New Macro */}
            <button
              onClick={onNewMacro}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#161f2b] hover:bg-[#1f2c3d] text-gray-300 hover:text-white border border-[#2a3749] transition text-xs font-medium"
              title="Crear nueva macro desde cero"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Nueva Macro</span>
            </button>

            {/* Save Macro */}
            <button
              onClick={onSaveCurrentMacro}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition text-xs font-medium shadow-sm"
              title="Guardar macro actual"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Guardar</span>
            </button>

            {/* My Macros */}
            <button
              onClick={onOpenMyMacros}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#161f2b] hover:bg-[#1f2c3d] text-gray-300 hover:text-white border border-[#2a3749] transition text-xs font-medium"
              title="Ver mis macros guardadas"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">Mis Macros</span>
              {savedCount > 0 && (
                <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold border border-sky-500/30">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Presets Library */}
            <button
              onClick={onOpenPresets}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-900/40 to-purple-900/40 hover:from-indigo-900/60 hover:to-purple-900/60 text-indigo-200 border border-indigo-500/30 transition text-xs font-medium"
            >
              <Flame className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Plantillas Pro</span>
            </button>

            {/* CoA Hub */}
            <button
              onClick={onOpenCoA}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950/60 to-teal-950/60 hover:from-emerald-900/80 hover:to-teal-900/80 text-emerald-300 border border-emerald-500/40 transition text-xs font-semibold shadow-glow-fel"
            >
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Clases CoA</span>
            </button>

            {/* Import / Export */}
            <button
              onClick={onOpenImportExport}
              className="p-1.5 rounded-lg bg-[#161f2b] hover:bg-[#1f2c3d] text-gray-400 hover:text-gray-200 border border-[#2a3749] transition"
              title="Importar o Exportar Macros"
            >
              <FolderDown className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
