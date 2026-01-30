
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../App';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard, 
  History, 
  PieChart, 
  Download,
  Clock,
  TrendingUp,
  Receipt,
  Banknote,
  Plus,
  X,
  Building,
  Calendar,
  DollarSign,
  ShieldCheck,
  Search,
  FileText,
  FileSpreadsheet,
  Briefcase
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemStatus, WorkItemType, User, FinancialTransaction, Project, Site } from '../../types';
import EmptyState from '../Common/EmptyState';

const AccountingDashboard: React.FC = () => {
  const context = useContext(AppContext);
  const [approvedRequests, setApprovedRequests] = useState<WorkItem[]>([]);
  const [ledger, setLedger] = useState<FinancialTransaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'LEDGER'>('QUEUE');
  
  const [newTx, setNewTx] = useState<Partial<FinancialTransaction>>({
    type: 'EXPENSE',
    title: '',
    amount: 0,
    category: 'GENEL',
    siteId: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [context?.activeProjectId]);

  const loadData = async () => {
    if (!context?.activeProjectId) return;
    const all = await ApiService.fetchWorkItems();
    const ledgerData = await ApiService.fetchFinancialTransactions();
    const prjs = await ApiService.fetchProjects();
    const sts = await ApiService.fetchSites(context.activeProjectId);
    
    // Filter queue and ledger by active project
    setApprovedRequests(all.filter(i => 
      i.projectId === context.activeProjectId && 
      i.type === WorkItemType.REQUEST && 
      i.status === WorkItemStatus.APPROVED
    ));
    
    setLedger(ledgerData.filter(t => t.projectId === context.activeProjectId));
    setProjects(prjs);
    setAllSites(sts);
  };

  if (!context) return null;
  const { addToast, currentUser, metrics, refreshMetrics, t, activeProjectId } = context;

  const handleMarkAsPaid = async (req: WorkItem) => {
    const tx: Partial<FinancialTransaction> = {
      type: 'EXPENSE',
      title: `${req.id} - ${req.title}`,
      amount: req.requestData?.amount || 0,
      category: req.requestData?.category || 'Saha Gideri',
      projectId: activeProjectId,
      siteId: req.siteId,
      vendor: req.requestData?.vendor || 'Resmi Kurum/Tedarikçi'
    };
    
    await ApiService.createFinancialTransaction(tx, currentUser);
    await ApiService.updateWorkItem(req.id, { status: WorkItemStatus.DONE }, currentUser);
    
    addToast('success', 'Hazine Onaylandı', `Ödeme emri ${projects.find(p=>p.id===activeProjectId)?.projectCode} bütçesinden düşüldü.`);
    loadData();
    refreshMetrics();
  };

  const handleCreateManualTx = async () => {
    if (!newTx.title || !newTx.siteId) {
      addToast('warning', 'Eksik Bağlam', 'Lütfen maliyet merkezini seçiniz.');
      return;
    }
    await ApiService.createFinancialTransaction({
      ...newTx,
      projectId: activeProjectId
    }, currentUser);
    addToast('success', 'Kayıt Arşivlendi', 'Hazine kaydı ilgili proje maliyetine işlendi.');
    setIsModalOpen(false);
    loadData();
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const availableSites = allSites; // Already filtered in loadData

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full overflow-y-auto no-scrollbar pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/20">
            <Banknote size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase leading-none">
              {activeProject?.name} Hazine
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
               <ShieldCheck size={12} className="text-rose-500" /> Kurumsal Proje Finansmanı ve Hazine
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-rose-600/30 hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <Receipt size={18} /> Manuel İşlem Girişi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <MetricCard title={t('totalExpenses')} value={`₺${metrics?.financials.approvedExpenses.toLocaleString()}`} icon={ArrowUpRight} color="text-rose-500" sub="Cari Dönem" />
        <MetricCard title="Tahsilat" value={`₺${metrics?.financials.totalIncome.toLocaleString()}`} icon={ArrowDownLeft} color="text-emerald-500" sub="Gelir Kalemleri" />
        <MetricCard title={t('awaitingPayment')} value={`₺${metrics?.financials.pendingExpenses.toLocaleString()}`} icon={Clock} color="text-amber-500" sub="Hazine Kuyruğu" />
        <MetricCard title={t('operationalCash')} value={`₺${((metrics?.financials.totalIncome || 0) - (metrics?.financials.approvedExpenses || 0)).toLocaleString()}`} icon={Wallet} color="text-indigo-500" sub="Mevcut Likidite" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
           <div className="flex items-center gap-2 p-6 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
              <button onClick={() => setActiveTab('QUEUE')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'QUEUE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Ödeme Kuyruğu</button>
              <button onClick={() => setActiveTab('LEDGER')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'LEDGER' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Hazine Defteri</button>
           </div>
           
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-white dark:bg-slate-900 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5">Saha Bağlamı</th>
                    <th className="px-8 py-5">İşlem & Paydaş</th>
                    <th className="px-8 py-5 text-right">Mali Değer</th>
                    <th className="px-8 py-5 text-right">Aksiyon/Tarih</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {activeTab === 'QUEUE' ? (
                   approvedRequests.length > 0 ? approvedRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <td className="px-8 py-6">
                          <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded text-[9px] font-black uppercase">{req.siteId}</span>
                       </td>
                       <td className="px-8 py-6">
                          <p className="text-sm font-black dark:text-white uppercase truncate">{req.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{req.id}</p>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <p className="text-lg font-black dark:text-white">₺{req.requestData?.amount.toLocaleString()}</p>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <button onClick={() => handleMarkAsPaid(req)} className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg">Ödemeyi Kesinleştir</button>
                       </td>
                    </tr>
                 )) : (
                   <tr>
                      <td colSpan={4} className="py-20 text-center opacity-30">
                        <EmptyState title="Kuyruk Temiz" description="Bu proje için bekleyen ödeme emri bulunmuyor." />
                      </td>
                   </tr>
                 )
                ) : (
                   ledger.length > 0 ? ledger.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <td className="px-8 py-6">
                          <span className="px-2 py-1 bg-rose-50 dark:bg-rose-900/40 text-rose-600 rounded text-[9px] font-black uppercase">{tx.siteId}</span>
                       </td>
                       <td className="px-8 py-6">
                          <p className="text-sm font-black dark:text-white uppercase">{tx.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{tx.vendor || 'Resmi İşlem'}</p>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <p className={`text-lg font-black ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.type === 'INCOME' ? '+' : '-'}₺{tx.amount.toLocaleString()}</p>
                       </td>
                       <td className="px-8 py-6 text-right text-[10px] font-bold text-slate-400 uppercase">{tx.date}</td>
                    </tr>
                 )) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center opacity-30">
                      <EmptyState title="Kayıt Yok" description="Bu proje defterinde henüz finansal işlem bulunmuyor." />
                    </td>
                  </tr>
                 )
                )}
              </tbody>
           </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-rose-50/30 dark:bg-rose-900/10 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Hazine Kaydı</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activeProject?.projectCode} Manuel Veri Girişi</p>
                 </div>
                 <X size={24} className="text-slate-400 cursor-pointer" onClick={() => setIsModalOpen(false)} />
              </div>
              
              <div className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Maliyet Merkezi</label>
                    <select 
                      value={newTx.siteId}
                      onChange={(e) => setNewTx({...newTx, siteId: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none appearance-none shadow-inner"
                    >
                      <option value="">Seçiniz...</option>
                      <option value="GENEL">Genel Merkez (Bu Proje)</option>
                      {availableSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">İşlem Başlığı</label>
                    <input 
                      type="text" 
                      value={newTx.title}
                      onChange={(e) => setNewTx({...newTx, title: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none shadow-inner" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tutar (TRY)</label>
                      <input 
                        type="number" 
                        value={newTx.amount}
                        onChange={(e) => setNewTx({...newTx, amount: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none shadow-inner" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tür</label>
                      <select 
                        value={newTx.type}
                        onChange={(e) => setNewTx({...newTx, type: e.target.value as any})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none appearance-none shadow-inner"
                      >
                         <option value="EXPENSE">Gider (Expense)</option>
                         <option value="INCOME">Gelir (Income)</option>
                      </select>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">Vazgeç</button>
                 <button 
                  onClick={handleCreateManualTx}
                  className="flex-2 px-10 py-5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-2xl shadow-rose-600/30 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                 >
                   <Receipt size={20} /> 
                   {activeProject ? `[${activeProject.projectCode}] Defterine İşle` : 'Deftere İşle'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color, sub }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
    <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform ${color}`}><Icon size={80} /></div>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${color}`}>{title}</p>
    <h3 className="text-4xl font-black dark:text-white tracking-tighter">{value}</h3>
    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{sub}</p>
  </div>
);

export default AccountingDashboard;
