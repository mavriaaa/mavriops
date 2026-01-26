
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  CheckSquare, 
  AlertCircle,
  Truck,
  ArrowRight
} from 'lucide-react';

const ProcurementCenter: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { t } = context;

  return (
    <div className="p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white flex items-center gap-3 text-emerald-600">
            <ShoppingCart size={32} /> {t('procurement')}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Vendor & Supply Chain Engine</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500">Vendors</button>
           <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20">New PO</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Queue Status</p>
              <h3 className="text-3xl font-black dark:text-white">12 PRs</h3>
              <p className="text-xs font-bold text-slate-500 mt-2">Waiting for quotations</p>
           </div>
           <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Package size={32} />
           </div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Awaiting Delivery</p>
              <h3 className="text-3xl font-black dark:text-white">05 Orders</h3>
              <p className="text-xs font-bold text-slate-500 mt-2">Active PO tracking</p>
           </div>
           <div className="w-16 h-16 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Truck size={32} />
           </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approved Monthly</p>
              <h3 className="text-3xl font-black dark:text-white">₺4.8M</h3>
              <p className="text-xs font-bold text-slate-500 mt-2">Spending threshold ok</p>
           </div>
           <div className="w-16 h-16 bg-slate-400 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <CheckSquare size={32} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
           <h2 className="text-xl font-black dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
             <FileText className="text-emerald-500" /> Active PR Queue
           </h2>
           <div className="space-y-4">
              {[
                { id: "PR-201", title: "Site B Generators", site: "SITE-B", amount: "₺85,000" },
                { id: "PR-202", title: "Cabling Infrastructure", site: "SITE-A", amount: "₺120,000" },
              ].map(pr => (
                <div key={pr.id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between group cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm text-slate-400">
                         <Package size={20} />
                      </div>
                      <div>
                         <p className="text-xs font-black dark:text-white group-hover:text-emerald-600 transition-colors">{pr.title}</p>
                         <div className="flex gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{pr.id}</span>
                            <span className="text-[10px] font-black text-indigo-500 uppercase">{pr.site}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-sm font-black dark:text-white">{pr.amount}</span>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                <AlertCircle className="text-amber-500" /> Recent POs
              </h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 48 Hours</span>
           </div>
           <div className="space-y-4">
              {[
                { id: "PO-9001", vendor: "Temsa Global", status: "SENT", total: "₺450,000" },
                { id: "PO-9002", vendor: "BetonSA", status: "ACCEPTED", total: "₺2.1M" },
              ].map(po => (
                <div key={po.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <div>
                      <p className="text-xs font-black dark:text-white uppercase">{po.id}</p>
                      <p className="text-[10px] font-bold text-slate-500">{po.vendor}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black dark:text-white">{po.total}</p>
                      <span className={`text-[10px] font-black uppercase ${po.status === 'ACCEPTED' ? 'text-green-500' : 'text-amber-500'}`}>{po.status}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementCenter;
