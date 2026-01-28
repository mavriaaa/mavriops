
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { 
  Wallet, 
  ArrowUpRight, 
  CreditCard, 
  History, 
  PieChart, 
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Receipt,
  Banknote,
  Search,
  X,
  Users
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemStatus, WorkItemType } from '../../types';

interface Transaction {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'REJECTED';
  date: string;
}

const AccountingDashboard: React.FC = () => {
  const context = useContext(AppContext);
  const [approvedRequests, setApprovedRequests] = useState<WorkItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TX-5001', vendor: 'BetonSA A.Ş.', category: 'Malzeme', amount: 125000, status: 'PAID', date: '2024-05-18' },
    { id: 'TX-5002', vendor: 'Petrol Ofisi', category: 'Akaryakıt', amount: 42300, status: 'PENDING', date: '2024-05-19' },
    { id: 'TX-5003', vendor: 'Saha Personel Avansı', category: 'Personel', amount: 15000, status: 'PAID', date: '2024-05-19' },
    { id: 'TX-5004', vendor: 'Elektrik Dağıtım', category: 'Genel Gider', amount: 8400, status: 'REJECTED', date: '2024-05-17' },
  ]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const all = await ApiService.fetchWorkItems();
    setApprovedRequests(all.filter(i => i.type === WorkItemType.REQUEST && i.status === WorkItemStatus.APPROVED));
  };

  if (!context) return null;
  const { addToast } = context;

  const handleMarkAsPaid = async (req: WorkItem) => {
    if (!confirm(`${req.title} için ödeme emri onaylanacak. Emin misiniz?`)) return;
    
    const newTx: Transaction = {
      id: `TX-${Math.floor(6000 + Math.random() * 1000)}`,
      vendor: req.title,
      category: req.requestData?.category || 'Genel',
      amount: req.requestData?.amount || 0,
      status: 'PAID',
      date: new Date().toISOString().split('T')[0]
    };
    
    setTransactions([newTx, ...transactions]);
    await ApiService.updateWorkItem(req.id, { status: WorkItemStatus.DONE }, 'accounting-system');
    addToast('success', 'Ödeme Tamamlandı', `${req.id} referanslı ödeme hazine kayıtlarına işlendi.`);
    loadData();
  };

  const totalPaid = transactions.filter(t => t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0) + 
                       approvedRequests.reduce((sum, r) => sum + (r.requestData?.amount || 0), 0);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/20">
            <Banknote size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase">Muhasebe Paneli</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Mali Kontrol Merkezi</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => alert('CSV Raporu Hazırlanıyor...')} className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
             <Download size={16} /> Excel Aktar
           </button>
           <button className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-rose-600/30 hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-2">
             <Receipt size={18} /> Manuel Kayıt
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard title="Toplam Ödeme" value={`₺${totalPaid.toLocaleString()}`} icon={TrendingUp} color="text-rose-500" sub="Bu Ay" />
        <MetricCard title="Bekleyen" value={`₺${totalPending.toLocaleString()}`} icon={Clock} color="text-amber-500" sub="Hazine Kuyruğu" />
        <MetricCard title="Likidite" value="₺4.85M" icon={Wallet} color="text-emerald-500" sub="Operasyonel" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-amber-50/30 dark:bg-amber-900/10 flex justify-between items-center">
                 <h2 className="text-xl font-black dark:text-white uppercase flex items-center gap-3">
                   <Clock className="text-amber-500" /> Ödeme Kuyruğu
                 </h2>
              </div>
              <div className="p-2">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-4">Talep</th>
                          <th className="px-6 py-4 text-right">Tutar</th>
                          <th className="px-6 py-4 text-right">İşlem</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {approvedRequests.map(req => (
                         <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="px-6 py-5">
                               <p className="text-xs font-black dark:text-white uppercase tracking-tight">{req.title}</p>
                               <p className="text-[9px] font-bold text-slate-400">{req.id} • {req.siteId}</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <p className="text-sm font-black dark:text-white">₺{req.requestData?.amount.toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <button onClick={() => handleMarkAsPaid(req)} className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-xl shadow-lg hover:bg-emerald-700 transition-all">Öde</button>
                            </td>
                         </tr>
                       ))}
                       {approvedRequests.length === 0 && (
                         <tr><td colSpan={3} className="py-12 text-center opacity-30 text-[10px] font-black uppercase tracking-widest">Bekleyen ödeme yok</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-lg font-black dark:text-white mb-8 uppercase flex items-center gap-3">
                 <PieChart className="text-indigo-500" /> Bütçe Dağılımı
              </h2>
              <div className="space-y-6">
                 <BudgetProgress label="Saha Malzeme" used={72} color="bg-emerald-500" />
                 <BudgetProgress label="Lojistik" used={45} color="bg-amber-500" />
                 <BudgetProgress label="İdari" used={30} color="bg-indigo-500" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color, sub }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-sm">
    <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform ${color}`}><Icon size={80} /></div>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${color}`}>{title}</p>
    <h3 className="text-4xl font-black dark:text-white tracking-tighter">{value}</h3>
    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{sub}</p>
  </div>
);

const BudgetProgress = ({ label, used, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
      <span className="text-slate-500">{label}</span>
      <span className="dark:text-white">%{used}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div style={{ width: `${used}%` }} className={`h-full ${color} transition-all duration-1000`} />
    </div>
  </div>
);

export default AccountingDashboard;
