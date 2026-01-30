
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { WorkItem, WorkItemType, WorkItemStatus, RequestType, Priority, Project, Site } from '../../types';
import { ApiService } from '../../services/api';
import { BudgetService } from '../../services/budgetService';
import { 
  Plus, Search, Filter, Package, DollarSign, FileText, 
  ChevronRight, Calendar, Building, CreditCard, Layers,
  Info, ShieldCheck, AlertCircle, Wallet, Briefcase, MapPin
} from 'lucide-react';
import { ENABLE_BUDGETS } from '../../constants';

const RequestCenter: React.FC = () => {
  const context = useContext(AppContext);
  const [requests, setRequests] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newReq, setNewReq] = useState({
    title: '',
    amount: 0,
    category: 'MALZEME',
    projectId: '',
    siteId: ''
  });

  const [budgetHealth, setBudgetHealth] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const items = await ApiService.fetchWorkItems();
    const prjs = await ApiService.fetchProjects();
    const sts = await ApiService.fetchSites();
    setRequests(items.filter(i => i.type === WorkItemType.REQUEST));
    setProjects(prjs);
    setAllSites(sts);
  };

  useEffect(() => {
    if (ENABLE_BUDGETS && newReq.siteId && newReq.amount > 0) {
        const check = BudgetService.checkLimit(newReq.siteId, newReq.amount);
        setBudgetHealth(check);
    } else {
        setBudgetHealth(null);
    }
  }, [newReq.siteId, newReq.amount]);

  if (!context) return null;
  const { t, currentUser, addToast } = context;

  const handleCreate = async () => {
    if (!newReq.title || !newReq.projectId || !newReq.siteId) {
        addToast('warning', 'Eksik Seçim', 'Lütfen başlık, proje ve şantiye seçiniz.');
        return;
    }
    
    await ApiService.createWorkItem({
      type: WorkItemType.REQUEST,
      title: newReq.title,
      priority: newReq.amount > 10000 ? Priority.HIGH : Priority.MEDIUM,
      projectId: newReq.projectId,
      siteId: newReq.siteId,
      requestData: {
        amount: newReq.amount,
        currency: 'TRY',
        category: newReq.category,
        costCenter: 'OPS-24',
        type: RequestType.PURCHASE,
        items: [],
        approvalChain: []
      }
    }, currentUser);

    addToast('success', 'Talep İletildi', 'Proje bütçe kuralları dahilinde süreç başlatıldı.');
    setIsModalOpen(false);
    loadData();
  };

  const selectedProject = projects.find(p => p.id === newReq.projectId);
  const availableSites = allSites.filter(s => s.projectId === newReq.projectId);

  return (
    <div className="p-10 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase leading-none">
            {t('requestCenter')}
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Layers size={12} /> {t('operationalDecisionCenter')}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={16} /> {t('newRequest')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-8 py-5">Proje & Saha</th>
              <th className="px-8 py-5">{t('idTitle')}</th>
              <th className="px-8 py-5">{t('amount')}</th>
              <th className="px-8 py-5">{t('category')}</th>
              <th className="px-8 py-5">{t('status')}</th>
              <th className="px-8 py-5 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {requests.map(req => {
              const proj = projects.find(p => p.id === req.projectId);
              return (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                          <Briefcase size={14} />
                       </div>
                       <div>
                          <p className="text-[11px] font-black dark:text-white uppercase leading-none">{proj?.projectCode || 'GENEL'}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{req.siteId}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black dark:text-white group-hover:text-indigo-600 transition-colors tracking-tight uppercase">{req.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{req.id}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black dark:text-white">₺{req.requestData?.amount.toLocaleString()} <span className="text-slate-400 font-bold text-[10px]">{req.requestData?.currency}</span></p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                       <Building size={12} /> {req.requestData?.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      req.status === WorkItemStatus.APPROVED ? 'bg-emerald-100 text-emerald-600' :
                      req.status === WorkItemStatus.REJECTED ? 'bg-rose-100 text-rose-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">{t('generateRequest')}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stratejik Bütçe ve Operasyon Girişi</p>
                 </div>
                 <Plus size={24} className="rotate-45 text-slate-400 cursor-pointer" onClick={() => setIsModalOpen(false)} />
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">İlgili Proje</label>
                       <select 
                        value={newReq.projectId}
                        onChange={(e) => setNewReq({...newReq, projectId: e.target.value, siteId: ''})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none appearance-none shadow-inner"
                       >
                         <option value="">Seçiniz...</option>
                         {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.projectCode})</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Saha / Şantiye</label>
                       <select 
                        disabled={!newReq.projectId}
                        value={newReq.siteId}
                        onChange={(e) => setNewReq({...newReq, siteId: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none appearance-none shadow-inner disabled:opacity-50"
                       >
                         <option value="">Seçiniz...</option>
                         {availableSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('requestSubject')}</label>
                    <input 
                      type="text" 
                      value={newReq.title}
                      onChange={(e) => setNewReq({...newReq, title: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none transition-all shadow-inner" 
                      placeholder="Örn: 50 Ton Demir Tedariği"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('totalAmount')}</label>
                      <input 
                        type="number" 
                        value={newReq.amount}
                        onChange={(e) => setNewReq({...newReq, amount: Number(e.target.value)})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none shadow-inner" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t('category')}</label>
                      <select 
                        value={newReq.category}
                        onChange={(e) => setNewReq({...newReq, category: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-sm font-bold dark:text-white outline-none appearance-none"
                      >
                         <option value="MALZEME">Materyal</option>
                         <option value="HIZMET">Hizmet / Servis</option>
                         <option value="IDARI">İdari Gider</option>
                      </select>
                    </div>
                 </div>

                 {budgetHealth && (
                    <div className={`p-4 rounded-2xl border flex gap-4 ${budgetHealth.isOver ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                        <Wallet size={20} className={budgetHealth.isOver ? 'text-rose-500' : 'text-emerald-500'} />
                        <div className="flex-1">
                            <p className={`text-[10px] font-black uppercase ${budgetHealth.isOver ? 'text-rose-600' : 'text-emerald-600'}`}>Proje Bütçe Kontrolü</p>
                            <p className="text-[9px] font-bold text-slate-500 mt-0.5 uppercase">
                                {budgetHealth.isOver ? 'Dikkat: Bu talep şantiye limitini aşıyor.' : 'Bütçe onayı uygun.'}
                            </p>
                        </div>
                    </div>
                 )}
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-xs font-black uppercase text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                 >
                   {t('cancel')}
                 </button>
                 <button 
                  onClick={handleCreate}
                  className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                 >
                   <ShieldCheck size={16} /> 
                   {selectedProject ? `[${selectedProject.projectCode}] Kaydını Kesinleştir` : 'Talebi Onayla'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RequestCenter;
