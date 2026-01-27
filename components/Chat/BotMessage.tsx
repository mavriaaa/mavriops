
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
    <div className="mt-4 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-900/50 shadow-2xl shadow-indigo-500/10 overflow-hidden animate-in zoom-in-95 duration-500 max-w-4xl">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-700 text-white flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
               <Bot size={24} />
            </div>
            <div>
               <h3 className="text-sm font-black uppercase tracking-tighter leading-none">MavriOps AI Analizi</h3>
               <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mt-1">Saha & Süreç Raporu</p>
            </div>
         </div>
         <ShieldCheck size={20} className="text-white/40" />
      </div>

      {/* 1. KISA ÖZET PANELİ */}
      <div className="p-8 space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} /> Genel Durum
               </h4>
               <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic border-l-4 border-indigo-500 pl-4">
                  "{data.summary.overall}"
               </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
               <SummaryMetric icon={AlertTriangle} label="Kritik Risk" value={data.summary.criticalRisk} color="text-rose-500" bg="bg-rose-50 dark:bg-rose-950/20" />
               <SummaryMetric icon={Calendar} label="Geciken Görev" value={data.summary.overdueTasks} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-950/20" />
            </div>
         </div>

         {/* 2. İŞ LİSTESİ TABLOSU */}
         <div className="space-y-4">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
               <ListChecks size={14} /> Bağlantılı İş Kalemleri
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
               <table className="w-full text-left text-[10px]">
                  <thead>
                     <tr className="bg-slate-100 dark:bg-slate-800 text-slate-400 font-black uppercase border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-3">ID & Başlık</th>
                        <th className="px-4 py-3">Durum</th>
                        <th className="px-4 py-3">Kaynak</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {data.workItems.map((item, i) => (
                        <tr key={i} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                           <td className="px-4 py-3">
                              <p className="font-black dark:text-white uppercase">{item.title}</p>
                              <p className="text-[8px] text-slate-400 font-bold">{item.id}</p>
                           </td>
                           <td className="px-4 py-3">
                              <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-2 py-0.5 rounded uppercase font-black">{item.status}</span>
                           </td>
                           <td className="px-4 py-3 text-slate-400 font-bold">{item.source}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* 3. AKSİYONLAR */}
         <div className="space-y-4">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
               <ArrowRight size={14} /> Aksiyon Maddeleri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {data.actions.map((act, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3 group hover:border-indigo-500 transition-all shadow-sm">
                     <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={12} className="group-hover:scale-125 transition-transform" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold dark:text-white leading-tight">{act.task}</p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-black uppercase">
                           <User size={10} /> {act.assignee || 'Atanmamış'} • <FileText size={10} /> {act.source}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. EKSİK BİLGİ & SONRAKİ ADIM */}
         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex gap-4">
            <Info size={24} className="text-indigo-500 shrink-0" />
            <div>
               <h5 className="text-[10px] font-black dark:text-white uppercase tracking-widest mb-2">Önerilen Sonraki Adım</h5>
               <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "{data.summary.nextStep}"
               </p>
               {data.missingInfo.length > 0 && (
                  <div className="mt-4 space-y-1">
                     <p className="text-[9px] font-black text-rose-500 uppercase">Eksik Veriler:</p>
                     <ul className="list-disc list-inside text-[10px] text-slate-400 font-medium">
                        {data.missingInfo.map((info, i) => <li key={i}>{info}</li>)}
                     </ul>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
         <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <span>Yapay Zeka Destekli Rapor</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Aktif Bağlam Analizi</span>
         </div>
         <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-2">
               <ExternalLink size={12} /> Raporu Paylaş
            </button>
         </div>
      </footer>
    </div>
  );
};

const SummaryMetric = ({ icon: Icon, label, value, color, bg }: any) => (
   <div className={`p-4 rounded-2xl border border-transparent flex items-center gap-4 transition-all hover:scale-105 ${bg}`}>
      <div className={`w-8 h-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center ${color}`}>
         <Icon size={18} />
      </div>
      <div className="min-w-0">
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
         <p className={`text-xs font-black truncate uppercase ${color}`}>{value}</p>
      </div>
   </div>
);

const CheckCircle2 = ({ size, className }: any) => <Zap size={size} className={className} />;

export default BotMessage;
