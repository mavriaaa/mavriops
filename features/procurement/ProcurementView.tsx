
import React, { useContext, useState } from 'react';
import { ShoppingCart, Truck, Search, CheckCircle, Package, ArrowRight, X, Paperclip } from 'lucide-react';
import { AppContext } from '../../App';
import { INITIAL_WORK_ITEMS } from '../../constants';
import { WorkItemStatus } from '../../types';

const ProcurementView: React.FC = () => {
  const context = useContext(AppContext);
  const [items] = useState(INITIAL_WORK_ITEMS); // Gerçekte APPROVED_FINAL olanlar

  if (!context) return null;
  const { t } = context;

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-[#020617] h-full overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-[2rem] bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30">
          <ShoppingCart size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">{t('procurement')}</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Approved Logistics & Supply Pipeline</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm p-10 flex flex-col items-center justify-center opacity-40 italic h-[500px]">
         <Package size={80} className="mb-6 text-emerald-500" />
         <p className="text-lg font-black uppercase tracking-widest">Satınalma Hattı Hazırlanıyor</p>
         <p className="text-xs mt-2">Onaylanan (Final) talepler buraya otomatik olarak düşecektir.</p>
      </div>
    </div>
  );
};

export default ProcurementView;
