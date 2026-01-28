
import React, { useState, useEffect } from 'react';
import { Budget, Role } from '../../types';
import { BudgetService } from '../../services/budgetService';
import { Wallet, PieChart, TrendingUp, AlertCircle, ShieldAlert, ArrowUpRight, BarChart3 } from 'lucide-react';

const BudgetManager: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    setBudgets(BudgetService.getBudgets());
  }, []);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase">Bütçe Denetimi</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
            <PieChart size={12} className="text-emerald-500" /> Saha Bazlı Finansal Limitler
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {budgets.map(b => {
          const percent = Math.min(100, (b.consumed / b.amount) * 100);
          const isCritical = percent > 80;
          return (
            <div key={b.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-500 transition-colors">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                  <BarChart3 size={80} className="text-slate-400" />
               </div>
               
               <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isCritical ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'} shadow-lg`}>
                     <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black dark:text-white uppercase tracking-tight">{b.scopeId}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{b.period} Bütçesi</p>
                  </div>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                     <p className="text-3xl font-black dark:text-white tracking-tighter">₺{b.consumed.toLocaleString()}</p>
                     <p className="text-sm font-bold text-slate-400">/ ₺{b.amount.toLocaleString()}</p>
                  </div>
                  
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div 
                        style={{ width: `${percent}%` }} 
                        className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-rose-500' : isCritical ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                     />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                     <span className={isCritical ? 'text-rose-500' : 'text-emerald-500'}>%{percent.toFixed(1)} Kullanım</span>
                     <span className="text-slate-400 tracking-widest">Kalan: ₺{(b.amount - b.consumed).toLocaleString()}</span>
                  </div>

                  {isCritical && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-3 text-rose-600 mt-4">
                       <ShieldAlert size={16} />
                       <p className="text-[9px] font-bold uppercase leading-tight">Limit Aşıldı: Onaylar {b.overLimitRoleRequired}'a yönlendirilir.</p>
                    </div>
                  )}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetManager;
