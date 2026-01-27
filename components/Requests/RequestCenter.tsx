
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { WorkItem, WorkItemType, WorkItemStatus, RequestType, Priority } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Plus, Search, Filter, Package, DollarSign, FileText, 
  ChevronRight, Calendar, Building, CreditCard, Layers,
  Info, ShieldCheck, AlertCircle
} from 'lucide-react';

const RequestCenter: React.FC = () => {
  const context = useContext(AppContext);
  const [requests, setRequests] = useState<WorkItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReq, setNewReq] = useState({
    title: '',
    amount: 0,
    category: 'GENEL',
    siteId: 'SAHA-A'
  });

  useEffect(() => {
    ApiService.fetchWorkItems().then(items => {
      setRequests(items.filter(i => i.type === WorkItemType.REQUEST));
    });
  }, []);

  if (!context) return null;
  const { t, currentUser } = context;

  const handleCreate = async () => {
    if (!newReq.title) return;
    
    await ApiService.createWorkItem({
      type: WorkItemType.REQUEST,
      title: newReq.title,
      priority: newReq.amount > 10000 ? Priority.HIGH : Priority.MEDIUM,
      siteId: newReq.siteId,
      requestData: {
        amount: newReq.amount,
        currency: 'TRY',
        category: newReq.category,
        costCenter: 'OPS-24',
        items: [],
        approvalChain: []
      }
    }, currentUser);

    setIsModalOpen(false);
    ApiService.fetchWorkItems().then(items => {
      setRequests(items.filter(i => i.type === WorkItemType.REQUEST));
    });
  };

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
          title="Sistemde yeni bir satın alma veya harcama kaydı başlatır."
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={16} /> {t('newRequest')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Package, label: t('materials'), count: '08 Aktif', color: 'indigo', desc: 'Sarf malzeme ve envanter talepleri' },
          { icon: DollarSign, label: t('advances'), count: '03 Aktif', color: 'emerald', desc: 'Personel ve saha nakit avansları' },
          { icon: FileText, label: t('fieldServices'), count: '12 Aktif', color: 'amber', desc: 'Alt yüklenici ve servis hakedişleri' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6 group hover:border-indigo-500 transition-colors cursor-pointer shadow-sm">
             <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
             </div>
             <div>
                <p className="text-sm font-black dark:text-white tracking-tight">{stat.label}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.count}</p>
                <p className="text-[8px] font-medium text-slate-300 mt-1 uppercase">{stat.desc}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-8 py-5">{t('status')}</th>
              <th className="px-8 py-5">{t('idTitle')}</th>
              <th className="px-8 py-5">{t('amount')}</th>
              <th className="px-8 py-5">{t('category')}</th>
              <th className="px-8 py-5">{t('approvalStep')}</th>
              <th className="px-8 py-5 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {requests.map(req => {
              const activeStep = req.requestData?.approvalChain.find(s => s.status === 'PENDING');
              return (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      req.status === WorkItemStatus.APPROVED ? 'bg-emerald-100 text-emerald-600' :
                      req.status === WorkItemStatus.REJECTED ? 'bg-rose-100 text-rose-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black dark:text-white group-hover:text-indigo-600 transition-colors tracking-tight uppercase">{req.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{req.id} <span className="text-slate-300">|</span> {req.siteId}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black dark:text-white">{req.requestData?.amount.toLocaleString()} <span className="text-slate-400 font-bold text-[10px]">{req.requestData?.currency}</span></p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                       <Building size={12} /> {req.requestData?.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {activeStep ? (
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                         <span className="text-xs font-bold dark:text-white uppercase tracking-tighter">{activeStep.roleRequired}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-emerald-500">{t('completed')}</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      title="Detaylı inceleme, onay geçmişi ve ek belgeleri görüntüle."
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors"
                    >
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
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                 <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">{t('generateRequest')}</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem onayı gerektiren yeni operasyon kaydı</p>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                      <Info size={12} className="text-indigo-500" /> {t('requestSubject')}
                    </label>
                    <input 
                      type="text" 
                      value={newReq.title}
                      onChange={(e) => setNewReq({...newReq, title: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" 
                      placeholder="Örn: Caterpillar Yedek Parça Bakımı"
                    />
                    <p className="text-[8px] font-bold text-slate-400 uppercase ml-1">Talebin amacını açıkça belirten bir başlık giriniz.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">{t('totalAmount')}</label>
                      <div className="relative">
                        <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="number" 
                          value={newReq.amount}
                          onChange={(e) => setNewReq({...newReq, amount: Number(e.target.value)})}
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 pl-12 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">{t('category')}</label>
                      <select 
                        value={newReq.category}
                        onChange={(e) => setNewReq({...newReq, category: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-sm font-bold dark:text-white outline-none appearance-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                      >
                         <option value="GENEL">Genel</option>
                         <option value="FINANS">Finans</option>
                         <option value="SAHA">Saha Varlıkları</option>
                      </select>
                    </div>
                 </div>

                 <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 flex gap-4">
                    <AlertCircle size={20} className="text-amber-500 shrink-0" />
                    <div>
                       <p className="text-[10px] font-black text-amber-600 uppercase">Onay Gereksinimi</p>
                       <p className="text-[9px] font-medium text-amber-500 mt-0.5">₺10.000 üzerindeki talepler otomatik olarak "Yüksek Öncelikli" olarak işaretlenir ve Yönetici onayı gerektirir.</p>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  title="İşlemi kaydetmeden sonlandırır ve merkeze döner."
                  className="flex-1 py-4 text-xs font-black uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                 >
                   {t('cancel')}
                 </button>
                 <button 
                  onClick={handleCreate}
                  title="Talebi kaydederek yetkili birimlerin onayına sunar."
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   <ShieldCheck size={16} /> {t('submitForReview')}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default RequestCenter;
