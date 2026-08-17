import React, { useState } from 'react';
import { MacroData } from '../../types/macro';
import { generateMacro } from '../../utils/macroGenerator';
import { 
  X, 
  BookOpen, 
  Trash2, 
  Copy, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Search,
  Check
} from 'lucide-react';

interface MyMacrosModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedMacros: MacroData[];
  onLoadMacro: (macro: MacroData) => void;
  onDeleteMacro: (id: string) => void;
}

export const MyMacrosModal: React.FC<MyMacrosModalProps> = ({
  isOpen,
  onClose,
  savedMacros,
  onLoadMacro,
  onDeleteMacro
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = savedMacros.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuickCopy = (macro: MacroData) => {
    const val = generateMacro(macro.blocks, false);
    navigator.clipboard.writeText(val.cleanCode);
    setCopiedId(macro.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121822] border border-[#2b394a] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[#232c37] bg-[#161f2b] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100 font-display">
                Mis Macros Guardadas ({savedMacros.length})
              </h3>
              <p className="text-xs text-gray-400">
                Macros creadas y almacenadas localmente en tu navegador.
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

        {/* Search */}
        <div className="p-3 bg-[#0d121a] border-b border-[#202936]">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en mis macros..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#141c27] border border-[#273445] rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Macros List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              No tienes macros guardadas aún con ese criterio.
            </div>
          ) : (
            filtered.map((m) => {
              const val = generateMacro(m.blocks, false);
              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#141b25] border border-[#253243] hover:border-sky-500/40 transition flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-gray-100">{m.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                          {val.charCount} chars
                        </span>
                      </div>
                      {m.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleQuickCopy(m)}
                        className="px-2.5 py-1 rounded bg-[#182332] hover:bg-[#223044] text-gray-300 hover:text-white text-xs transition flex items-center space-x-1"
                        title="Copiar texto de la macro"
                      >
                        {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === m.id ? 'Copiado' : 'Copiar'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onLoadMacro(m);
                          onClose();
                        }}
                        className="flex items-center space-x-1 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-sm"
                      >
                        <span>Cargar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteMacro(m.id)}
                        className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Eliminar macro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <pre className="p-2 rounded bg-[#0b0e14] border border-[#1e2736] font-mono text-[11px] text-gray-300 whitespace-pre-wrap max-h-20 overflow-y-auto">
                    {val.cleanCode}
                  </pre>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
