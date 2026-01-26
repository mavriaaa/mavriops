
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  History, 
  PieChart, 
  FileText,
  Download
} from 'lucide-react';

const AccountingDashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { t } = context;

  const handleExportCSV = () => {
    alert("Muhasebe verileri (CSV) hazırlanıyor ve indiriliyor...");
    // In a real app, this would generate a blob and trigger a download
  };

  const handleNewPayment = () => {
    const amount = prompt("Ödeme Tutarı:");
    if (amount) alert(`${amount} TRY tutarında ödeme emri muhasebe kuyruğuna eklendi.`);
  };

  return (
    <div className="p-10 space-y-10 animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white flex items-center gap-3 text-rose-600">
            <Wallet size={32} /> {t('accounting')}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Financial Operations & Treasury</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handleExportCSV}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2 active:scale-95"
           >
             <Download size={16} /> Export CSV
           </button>
           <button 
            onClick={handleNewPayment}
            className="px-6 py-3 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95"
           >
             New Payment
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <div className="flex items-center text-xs font-bold text-rose-500">
              <ArrowUpRight size={14} /> 12.4%
            </div>
          </div>
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Total Expenses</p>
          <h3 className="text-3xl font-black dark:text-white tracking-tighter">₺2.45M</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">This month vs last</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/20 group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <History size={24} />
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-500">
              <ArrowDownRight size={14} /> 4.2%
            </div>
          </div>
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Awaiting Payment</p>
          <h3 className="text-3xl font-black dark:text-white tracking-tighter">₺840K</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Approved requests in queue</p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/20 group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <PieChart size={24} />
            </div>
            <span className="text-[10px] font-black text-indigo-400 uppercase">Within Budget</span>
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Operational Cash</p>
          <h3 className="text-3xl font-black dark:text-white tracking-tighter">₺1.2M</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Available for disbursement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
          <h2 className="text-2xl font-black dark:text-white mb-8 flex items-center gap-3 tracking-tighter uppercase">
            <FileText className="text-rose-500" /> Recent Transactions
          </h2>
          <div className="space-y-4">
            {[
              { id: 'TX-1001', vendor: 'Temsa Global', category: 'Machinery', amount: '₺450,000', status: 'PAID' },
              { id: 'TX-1002', vendor: 'Petrol Ofisi', category: 'Fuel', amount: '₺12,500', status: 'PENDING' },
              { id: 'TX-1003', vendor: 'Saha Personeli', category: 'Advance', amount: '₺5,000', status: 'PAID' },
              { id: 'TX-1004', vendor: 'BetonSA', category: 'Materials', amount: '₺120,000', status: 'REJECTED' },
            ].map((tx) => (
              <div 
                key={tx.id} 
                onClick={() => alert(`İşlem Detayı: ${tx.id} - ${tx.vendor}`)}
                className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shadow-sm">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black dark:text-white">{tx.vendor}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">#{tx.id}</span>
                      <span className="text-[10px] font-black text-rose-500 uppercase">{tx.category}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black dark:text-white">{tx.amount}</p>
                  <span className={`text-[10px] font-black uppercase ${
                    tx.status === 'PAID' ? 'text-emerald-500' : 
                    tx.status === 'PENDING' ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="text-xl font-black dark:text-white mb-8 tracking-tighter uppercase">Budget Allocation</h2>
          <div className="space-y-8">
            {[
              { label: 'Personnel', used: 85, color: 'bg-indigo-500' },
              { label: 'Materials', used: 60, color: 'bg-emerald-500' },
              { label: 'Logistics', used: 45, color: 'bg-rose-500' },
              { label: 'Equipment', used: 92, color: 'bg-amber-500' },
            ].map((b) => (
              <div key={b.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">{b.label}</span>
                  <span className="dark:text-white">{b.used}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${b.used}%` }} className={`h-full ${b.color} transition-all duration-1000 shadow-lg`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
             <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest text-center">Current Quarter Usage</p>
             <p className="text-2xl font-black text-center dark:text-white tracking-tighter">₺6.8M / ₺8M</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;
