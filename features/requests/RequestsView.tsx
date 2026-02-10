
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Layers, ChevronRight, MapPin, Filter, 
  X, ShieldCheck, Info, DollarSign, Briefcase,
  AlertCircle, Loader2
} from 'lucide-react';
import { AppContext } from '../../App';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemStatus, WorkItemType, Priority, Site, Role } from '../../types';
import { getTranslation } from '../../i18n';
import { formatCurrencyTR } from '../../utils/formatters';

const RequestsView: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableSites, setAvailableSites] = useState<Site[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: 0,
    siteId: '',
    type: WorkItemType.MATERIAL,
    priority: Priority.MEDIUM
  });

  if (!context) return null;
  const { t, activeProjectId, currentUser, addToast, refreshMetrics } = context;

  const loadData = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const [itemsData, sitesData] = await Promise.all([
        ApiService.fetchWorkItems(),
        ApiService.fetchSites(activeProjectId)
      ]);
      const projectItems = itemsData.filter(item => item.projectId === activeProjectId);
      setItems(projectItems);
      setAvailableSites(sitesData);
    } catch (err) {
      addToast('error', 'Hata', 'Veriler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeProjectId]);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) setActiveFilter(statusParam.toUpperCase());
  }, [searchParams]);

  const handleFilterClick = (id: string) => {
    setActiveFilter(id);
    if (id === 'ALL') setSearchParams({});
    else setSearchParams({ status: id });
  };

  const handleCreateRequest = async () => {
    // 1. Validasyon Kontrolleri
    if (!activeProjectId) {
      addToast('error', 'Proje Seçilmedi', 'Lütfen işlem yapmak için bir proje seçiniz.');
      return;
    }

    if (!formData.title.trim() || !formData.siteId || !formData.description.trim()) {
      addToast('error', 'Eksik Alanlar', 'Başlık, saha ve açıklama alanları zorunludur.');
      return;
    }

    if (formData.amount <= 0) {
      addToast('error', 'Geçersiz Tutar', 'Mali değer 0\'dan büyük olmalıdır.');
      return;
    }

    setIsProcessing(true);
    try {
      // 2. WorkItem İnşası
      const newItemData: Partial<WorkItem> = {
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        siteId: formData.siteId,
        type: formData.type,
        priority: formData.priority,
        projectId: activeProjectId,
        status: WorkItemStatus.SUBMITTED,
        currency: 'TRY',
        requestData: {
          amount: formData.amount,
          currency: 'TRY',
          category: formData.type,
          approvalChain: [
            { stepNo: 1, roleRequired: Role.MANAGER, status: 'PENDING' }
          ]
        }
      };

      // 3. Servis Kaydı
      const newItem = await ApiService.createWorkItem(newItemData, currentUser);

      // 4. Başarı Yönetimi
      addToast('success', 'Kayıt Oluşturuldu', `${newItem.id} referanslı talep başarıyla sisteme işlendi.`);
      setIsModalOpen(false);
      setFormData({
        title: '', description: '', amount: 0, siteId: '', 
        type: WorkItemType.MATERIAL, priority: Priority.MEDIUM 
      });
      
      // Senkronizasyon
      await loadData();
      refreshMetrics();
    } catch (err) {
      console.error("Create Request Error:", err);
      addToast('error', 'İşlem Başarısız', 'Teknik bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filters = [
    { id: 'ALL', label: 'Tümü' },
    { id: 'SUBMITTED', label: 'Onay Bekleyen' },
    { id: 'DELIVERED', label: 'Teslim Edilen' },
    { id: 'INVOICED', label: 'Faturalandırıldı' },
    { id: 'CLOSED', label: 'Tamamlandı' },
  ];

  const filteredItems = activeFilter === 'ALL' ? items : items.filter(i => i.status === activeFilter);

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">İş Kayıtları & Talepler</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3 flex items-center gap-2">
            <Layers size={14} className="text-indigo-500" /> Proje Bağlamı: {activeProjectId}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center gap-3 transition-all active:scale-95"
        >
          <Plus size={18} /> Yeni Kayıt Oluştur
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => handleFilterClick(f.id)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
              activeFilter === f.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-indigo-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Senkronize Ediliyor...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">Referans & Saha</th>
                <th className="px-8 py-5">Talep Tanımı</th>
                <th className="px-8 py-5">Mali Değer</th>
                <th className="px-8 py-5">İşlem Safhası</th>
                <th className="px-8 py-5 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-[11px] font-black dark:text-white uppercase tracking-tight leading-none">{item.id}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1"><MapPin size={10} className="text-rose-500" /> {item.siteId}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{item.title}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 italic opacity-60">{t(item.type)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black dark:text-white tracking-tighter">{formatCurrencyTR(item.amount)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                       <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                         item.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                         item.status === 'INVOICED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                         item.status === 'DELIVERED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                         'bg-slate-50 text-slate-500 border-slate-100'
                       }`}>
                          {getTranslation(item.status)}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => navigate(`/requests/${item.id}`)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filteredItems.length === 0 && (
           <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs opacity-50">Bu kriterlere uygun kayıt bulunmuyor</div>
        )}
      </div>

      {/* NEW REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <header className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30">
              <div>
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Yeni İş Kaydı</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Saha Operasyon Girişi</p>
              </div>
              <button disabled={isProcessing} onClick={() => setIsModalOpen(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm disabled:opacity-50"><X size={20} /></button>
            </header>

            <div className="p-10 space-y-6 max-h-[65vh] overflow-y-auto no-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Kayıt Başlığı</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    disabled={isProcessing}
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Örn: 50 Ton Demir Tedariği"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 pl-14 text-sm font-bold dark:text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">İlgili Saha</label>
                  <select 
                    disabled={isProcessing}
                    value={formData.siteId}
                    onChange={(e) => setFormData({...formData, siteId: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Seçiniz...</option>
                    {availableSites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.siteCode})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">İş Tipi</label>
                  <select 
                    disabled={isProcessing}
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                  >
                    {Object.values(WorkItemType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Mali Değer (Tahmini)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      disabled={isProcessing}
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 pl-14 text-sm font-bold dark:text-white outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Öncelik Seviyesi</label>
                  <select 
                    disabled={isProcessing}
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold dark:text-white outline-none appearance-none cursor-pointer"
                  >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Detaylı Açıklama (Min 10 Karakter)</label>
                <textarea 
                  disabled={isProcessing}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-3xl p-5 text-sm font-bold dark:text-white outline-none transition-all resize-none shadow-inner"
                  placeholder="İşin detaylarını ve gereksinimlerini buraya yazınız..."
                />
              </div>
            </div>

            <footer className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 flex gap-4">
              <button disabled={isProcessing} onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50">Vazgeç</button>
              <button 
                onClick={handleCreateRequest}
                disabled={isProcessing}
                className="flex-2 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />} 
                {isProcessing ? 'İşleniyor...' : 'Kaydı Kesinleştir'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsView;
