
import React, { useContext, useState } from 'react';
import { Wallet, Banknote, Search, Clock, FileText, CheckCircle2, MoreVertical } from 'lucide-react';
import { AppContext } from '../../App';

const FinanceView: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { t } = context;

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-[#020617] h-full overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-[2rem] bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/30">
          <Banknote size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">{t('finance')}</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Corporate Treasury & Document Control</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm p-10 flex flex-col items-center justify-center opacity-40 italic h-[500px]">
         <FileText size={80} className="mb-6 text-rose-500" />
         <p className="text-lg font-black uppercase tracking-widest">Hazine Hattı Hazırlanıyor</p>
         <p className="text-xs mt-2">Teslimatı yapılan işlerin fatura ve ödeme süreçleri buradan yönetilecektir.</p>
      </div>
    </div>
  );
};

export default FinanceView;
