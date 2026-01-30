
import React from 'react';
import { TimelineEvent } from '../../types';
import { Clock, CheckCircle2, XCircle, FileText, Banknote, ShieldAlert } from 'lucide-react';

const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'APPROVAL': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'REJECTION': return <XCircle size={16} className="text-rose-500" />;
      case 'PR_CREATED': return <FileText size={16} className="text-indigo-500" />;
      case 'PAID': return <Banknote size={16} className="text-emerald-600" />;
      case 'STATUS_CHANGE': return <Clock size={16} className="text-amber-500" />;
      default: return <ShieldAlert size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="absolute left-[1.125rem] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
      
      {events.map((event, idx) => (
        <div key={event.id} className="flex gap-6 relative z-10 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
          <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
            {getIcon(event.type)}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.actorName}</p>
              <span className="text-[9px] font-bold text-slate-400">{new Date(event.timestamp).toLocaleString('tr-TR')}</span>
            </div>
            <p className="text-sm font-bold dark:text-slate-200 leading-snug">{event.summary}</p>
            {event.metadata?.note && (
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-l-4 border-indigo-500 italic text-xs text-slate-500">
                "{event.metadata.note}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
