
import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

const ToastContainer: React.FC<{ toasts: ToastMessage[], removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto w-80 p-4 rounded-2xl shadow-2xl border flex gap-4 animate-in slide-in-from-right duration-300 ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50' :
            toast.type === 'error' ? 'bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50' :
            'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50'
          }`}
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle className="text-emerald-500" size={20} />}
            {toast.type === 'error' && <AlertCircle className="text-rose-500" size={20} />}
            {toast.type === 'info' && <Info className="text-indigo-500" size={20} />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black uppercase tracking-widest dark:text-white mb-1">{toast.title}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
