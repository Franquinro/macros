import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl flex items-center justify-between space-x-3 animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#0e2118] border-emerald-500/50 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-[#251012] border-red-500/50 text-red-200'
              : 'bg-[#131d2b] border-sky-500/50 text-sky-200'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
            <span className="text-xs font-medium leading-snug">{toast.text}</span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-white transition p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
