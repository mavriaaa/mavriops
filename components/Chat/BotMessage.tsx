
import React from 'react';
import { 
  Bot, ShieldCheck, Zap, AlertTriangle, ListChecks, 
  Info, ArrowRight, ExternalLink, Calendar, User,
  FileText
} from 'lucide-react';
import { BotContent } from '../../types';

interface Props {
  data: BotContent;
}

const BotMessage: React.FC<Props> = ({ data }) => {
  return (
    <div className="mt-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-700 max-w-4xl group">
      {/* Header - Refined Gradient */}
      <div className="p-8 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white flex items-center justify-between">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
               <Bot size={26} className="text-white" />
            </div>
            <div>
               <h3 className="text-base font-black uppercase tracking-tight leading-none">MavriOps Analiz Raporu</h3>
               <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Gerçek Zamanlı Veri İşleme
               </p>
            </div>
         </div>
         <ShieldCheck size={24} className="text-white/20" />
      </div>

      <div className="p-10 space-y-10">
         {/* Summary Section - Elegant Typography */}
         <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 space-y-5">
               <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em] flex items-center gap-3">
                  <Zap size={14} /> Durum Özeti
               </h4>
               <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic border-l-[3px] border-indigo-500 pl-6 py-1">
                  "{data.summary.overall}"
               </p>
            </div>
            <div className="md:col-span-5 flex flex-col gap-4">
               <SummaryMetric icon={AlertTriangle} label="Öncelikli Risk" value={data.summary.criticalRisk} color="text-rose-500" bg="bg-rose-50/50 dark:bg-rose-500/5" />
               <SummaryMetric icon={Calendar} label="Gecikme Analizi" value={data.summary.overdueTasks} color="text-amber-500" bg="bg-amber-50/50 dark:bg-amber-500/5" />
            </div>
         </div>

         {/* Work Items - Minimal Table */}
         <div className="space-y-5">
            <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em] flex items-center gap-3">
               <ListChecks size={14} /> İzleme Altındaki Kalemler
            </h4>
            <div className="bg-slate-50/50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden">
               <table className="w-full text-left text-[11px]">
                  <thead>
                     <tr className="text-slate-400 font-black uppercase border-b border-slate-200/50 dark:border-white/5">
                        <th className="px-6 py-4">Referans & Tanım</th>
                        <th className="px-6 py-4">Statü</th>
                        <th className="px-6 py-4 text-right">Veri Kaynağı</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                     {data.workItems.map((item, i) => (
                        <tr key={i} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                           <td className="px-6 py-4">
                              <p className="font-black dark:text-white uppercase tracking-tight">{item.title}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-1 tracking-widest">{item.id}</p>
                           </td>
                           <td className="px-6 py-4">
                              <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg uppercase font-black text-[9px] border border-indigo-100 dark:border-indigo-500/20">{item.status}</span>
                           </td>
                           <td className="px-6 py-4 text-right text-slate-400 font-bold uppercase text-[9px]">{item.source}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Actions - Modern Card Grids */}
         <div className="space-y-5">
            <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em] flex items-center gap-3">
               <ArrowRight size={14} /> Önerilen Aksiyonlar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {data.actions.map((act, i) => (
                  <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-white/10 flex items-start gap-4 hover:border-indigo-500/50 transition-all shadow-sm group/action">
                     <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20 group-hover/action:scale-110 transition-transform">
                        <Zap size={14} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-black dark:text-white leading-snug uppercase tracking-tight">{act.task}</p>
                        <div className="flex items-center gap-3 mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><User size={10} /> {act.assignee || 'Açık Atama'}</span>
                           <span className="text-slate-200">|</span>
                           <span className="flex items-center gap-1.5"><FileText size={10} /> {act.source}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Next Steps - Glass Container */}
         <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/10 flex gap-6">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
               <Info size={24} />
            </div>
            <div>
               <h5 className="text-[10px] font-black dark:text-white uppercase tracking-[0.2em] mb-3 opacity-60">Stratejik Yol Haritası</h5>
               <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{data.summary.nextStep}"
               </p>
               {data.missingInfo.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-slate-200 dark:border-white/5">
                     <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-3">Tespit Edilen Veri Eksiklikleri:</p>
                     <div className="flex flex-wrap gap-2">
                        {data.missingInfo.map((info, i) => (
                           <span key={i} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-full text-[9px] font-bold text-slate-500 uppercase">{info}</span>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Footer - Minimal & Clean */}
      <footer className="px-10 py-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
         <div className="flex items-center gap-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            <span>MavriOps Intelligence Report</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="opacity-50">Güvenli Analiz Hattı</span>
         </div>
         <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-2 active:scale-95 shadow-sm">
            <ExternalLink size={12} /> Paylaş
         </button>
      </footer>
    </div>
  );
};

const SummaryMetric = ({ icon: Icon, label, value, color, bg }: any) => (
   <div className={`p-4 rounded-3xl border border-transparent flex items-center gap-5 transition-all hover:translate-x-1 ${bg}`}>
      <div className={`w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center ${color}`}>
         <Icon size={20} />
      </div>
      <div className="min-w-0">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">{label}</p>
         <p className={`text-xs font-black truncate uppercase tracking-tight ${color}`}>{value}</p>
      </div>
   </div>
);

export default BotMessage;
