
import React from 'react';
import { Loader2, AlertCircle, Inbox, RefreshCcw } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Veriler yükleniyor...' }) => (
  <div className="flex flex-col items-center justify-center p-20 space-y-4 animate-in fade-in">
    <Loader2 size={40} className="text-indigo-600 animate-spin" />
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message = 'Veriler yüklenirken bir hata oluştu.', onRetry }) => (
  <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 animate-in zoom-in-95">
    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
      <AlertCircle size={32} />
    </div>
    <div>
      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Sistem Hatası</h3>
      <p className="text-xs text-slate-500 mt-2">{message}</p>
    </div>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
      >
        <RefreshCcw size={14} /> Tekrar Dene
      </button>
    )}
  </div>
);

export const StandardEmptyState: React.FC<{ title: string; description: string; actionLabel?: string; onAction?: () => void }> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
      <Inbox size={40} />
    </div>
    <div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">{description}</p>
    </div>
    {onAction && (
      <button 
        onClick={onAction}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
