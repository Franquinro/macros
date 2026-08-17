import React, { useState } from 'react';
import { MacroData } from '../../types/macro';
import { parseMacroText } from '../../utils/macroParser';
import { exportMacrosToJSON, importMacrosFromJSON } from '../../utils/storage';
import { 
  X, 
  FolderDown, 
  FolderUp, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTextMacro: (macro: MacroData) => void;
  onImportJsonSuccess: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportTextMacro,
  onImportJsonSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'json_export' | 'json_import'>('text');
  const [rawText, setRawText] = useState('');
  const [macroName, setMacroName] = useState('Macro Importada');
  const [jsonInput, setJsonInput] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleParseText = () => {
    if (!rawText.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor pega el texto de la macro primero.' });
      return;
    }

    try {
      const blocks = parseMacroText(rawText);
      const newMacro: MacroData = {
        id: `imported_${Date.now()}`,
        name: macroName || 'Macro Importada',
        description: 'Macro importada desde texto de WoW',
        icon: 'Sparkles',
        category: 'general',
        blocks,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      onImportTextMacro(newMacro);
      onClose();
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Error al interpretar la macro: ' + e.message });
    }
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportMacrosToJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `macrowolk_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJsonExport = () => {
    navigator.clipboard.writeText(exportMacrosToJSON());
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleImportJSON = () => {
    if (!jsonInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Pega el contenido JSON de respaldo.' });
      return;
    }
    try {
      importMacrosFromJSON(jsonInput);
      setStatusMessage({ type: 'success', text: '¡Macros importadas correctamente!' });
      onImportJsonSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Error al importar JSON: ' + e.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121822] border border-[#2b394a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[#232c37] bg-[#161f2b] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/30">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100 font-display">
                Importar / Exportar Macros
              </h3>
              <p className="text-xs text-gray-400">
                Pega macros de WoW para editarlas visualmente o guarda copias de seguridad.
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

        {/* Tab Selector */}
        <div className="p-2 bg-[#0d121a] border-b border-[#202936] flex items-center space-x-2">
          <button
            onClick={() => { setActiveTab('text'); setStatusMessage(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'text'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Pegar Texto WoW
          </button>
          <button
            onClick={() => { setActiveTab('json_export'); setStatusMessage(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'json_export'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Exportar Respaldo JSON
          </button>
          <button
            onClick={() => { setActiveTab('json_import'); setStatusMessage(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'json_import'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Restaurar Respaldo JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-950/40 text-red-300 border border-red-500/40'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* TAB 1: RAW TEXT IMPORT */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Nombre para la Macro:
                </label>
                <input
                  type="text"
                  value={macroName}
                  onChange={(e) => setMacroName(e.target.value)}
                  placeholder="Mi Macro Importada"
                  className="w-full bg-[#0b0e14] border border-[#273547] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Pega aquí el texto de tu macro de WoW 3.3.5a:
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={'#showtooltip\n/cast [@mouseover,help,nodead][@player] Flash of Light\n/use 13'}
                  className="w-full bg-[#0b0e14] border border-[#273547] rounded-lg p-3 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <button
                onClick={handleParseText}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center justify-center space-x-2 shadow-glow-gold transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Interpretar y Convertir a Bloques Visuales</span>
              </button>
            </div>
          )}

          {/* TAB 2: JSON EXPORT */}
          {activeTab === 'json_export' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                Descarga un archivo JSON con todas tus macros creadas para guardarlo en tu ordenador o compartirlo.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadJSON}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center space-x-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Archivo .json</span>
                </button>
                <button
                  onClick={handleCopyJsonExport}
                  className="px-4 py-2.5 rounded-xl bg-[#1a2331] hover:bg-[#253245] text-gray-200 font-medium text-xs flex items-center space-x-2 transition border border-[#2b394b]"
                >
                  {copiedExport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedExport ? '¡Copiado!' : 'Copiar JSON'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={6}
                value={exportMacrosToJSON()}
                className="w-full bg-[#0b0e14] border border-[#273547] rounded-lg p-2.5 text-[10px] font-mono text-gray-400 select-all"
              />
            </div>
          )}

          {/* TAB 3: JSON RESTORE */}
          {activeTab === 'json_import' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                Pega el contenido JSON de una copia de seguridad para restaurar tus macros:
              </p>
              <textarea
                rows={6}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"version": "1.0.0", "macros": [...]}'
                className="w-full bg-[#0b0e14] border border-[#273547] rounded-lg p-3 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleImportJSON}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs flex items-center justify-center space-x-2 shadow-glow-fel transition"
              >
                <Upload className="w-4 h-4" />
                <span>Restaurar Macros desde JSON</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
