import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 transform transition-all duration-200 ease-out flex items-center gap-2.5 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 text-xs sm:text-sm font-medium"
      role="status"
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
