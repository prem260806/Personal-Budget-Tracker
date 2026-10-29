import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-500 text-white border-emerald-600',
    error: 'bg-rose-500 text-white border-rose-600',
    warning: 'bg-amber-500 text-white border-amber-600',
    info: 'bg-indigo-500 text-white border-indigo-600',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${
          bgColors[type] || bgColors.info
        }`}
      >
        {icons[type]}
        <span className="text-sm font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
