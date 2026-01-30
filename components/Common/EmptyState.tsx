
import React from 'react';
import { Search, Plus, FilterX } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const EmptyState: React.FC<Props> = ({ 
  title, description, icon: Icon = Search, 
  actionLabel, onAction, secondaryLabel, onSecondary 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-8 shadow-inner">
        <Icon size={48} />
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-10">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {onAction && (
          <button 
            onClick={onAction}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} /> {actionLabel}
          </button>
        )}
        {onSecondary && (
          <button 
            onClick={onSecondary}
            className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <FilterX size={16} /> {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
