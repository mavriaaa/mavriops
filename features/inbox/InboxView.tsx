
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, Search, ChevronRight, 
  Check, X, Info, History, MapPin, 
  AlertCircle, FileText, MessageCircle, ShieldCheck
} from 'lucide-react';
import { AppContext } from '../../App';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemStatus, Priority } from '../../types';
import { getTranslation } from '../../i18n';
import Timeline from '../../components/Common/Timeline';

const InboxView: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'REJECT' | 'REVISION' | null>(null);
  const [reason, setReason] = useState('');

  if (!context) return null;
  const { addToast, formatMoney, t, activeProjectId } = context;

  useEffect(() => {
    // Proje değişince seçimi temizle (Hardening)
    setSelectedId(null);
    
    ApiService.fetchWorkItems().then(data => {
      // Aktif proje + Bekleyen durumlar
      const pending = data.filter(i => 
        i.projectId === activeProjectId && 
        (i.status === WorkItemStatus.SUBMITTED || i.status === WorkItemStatus.NEED_INFO)
      );
      setItems(pending);
      if (pending.length > 0) setSelectedId(pending[0].id);
    });
  }, [activeProjectId]);

  const selectedItem = items.find(i => i.id === selectedId);

  const handleQuickApprove = () => {
    addToast('success', 'Onay Verildi', 'Talep başarıyla bir üst kademeye sevk edildi.');
    setItems(prev => prev.filter(i => i.id !== selectedId));
    if (items.length > 1) {
       const next = items.filter(i => i.id !== selectedId)[0];
       setSelectedId(next.id);
    } else {
       setSelectedId(null);
    }
  };

  const confirmNegativeAction = () => {
    if (!reason.trim()) {
      addToast('error', 'Gerekçe Zorunlu', 'Lütfen işlemin devam etmesi için bir açıklama giriniz.');
      return;
    }
    const msg = modalType === 'REJECT' ? 'Talep reddedildi.' : 'Revizyon istendi.';
    addToast('success', 'İşlem Başarılı', msg);
    setIsModalOpen(false);
    setReason('');
    setItems(prev => prev.filter(i => i.id !== selectedId));
    
    if (items.length > 1) {
       const next = items.filter(i => i.id !== selectedId)[0];
       setSelectedId(next.id);
    } else {
       setSelectedId(null);
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-[#020617] overflow-hidden">
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#020617] shrink-0">
        <header className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Inbox size={20} className="text-indigo-600" /> {t('inbox')}
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Sadece Bu Proje Filtrelendi</p>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {items.map(item => (
            <button 
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full p-6 text-left border-b border-slate-50 dark:border-slate-800/50 transition-all relative ${selectedId === item.id ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
            >
              {selectedId === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.id}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{item.siteId}</span>
              </div>
              <p className="text-sm font-black dark:text-white uppercase leading-tight truncate">{item.title}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${item.status === 'NEED_INFO' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                   {t(item.status)}
                </span>
              </div>
            </button>
          ))}
          {items.length === 0 && <div className="p-10 text-center text-slate-400 font-bold uppercase text-xs">Bu proje için bekleyen iş yok</div>}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
        {selectedItem ? (
          <>
            <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
               <div className="space-y-1">
                  <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter leading-tight">{selectedItem.title}</h1>
                  <p className="text-sm text-slate-500 font-medium">{selectedItem.description}</p>
               </div>
               <button onClick={() => navigate(`/requests/${selectedItem.id}`)} className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-white transition-all">Tüm Detayları Gör</button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-32">
               <div className="grid grid-cols-2 gap-6">
                  <DetailBox label={t('amount')} value={formatMoney(selectedItem.amount)} />
                  <DetailBox label="Oluşturan" value={selectedItem.createdBy} />
               </div>

               <div className="p-8 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-800/50 space-y-6">
                  <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16} /> Yönetim Kararı</h3>
                  <div className="flex gap-4">
                    <button onClick={handleQuickApprove} className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                      <Check size={18} /> {t('approve')}
                    </button>
                    <button onClick={() => { setModalType('REVISION'); setIsModalOpen(true); }} className="flex-1 py-5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <MessageCircle size={18} /> {t('askRevision')}
                    </button>
                    <button onClick={() => { setModalType('REJECT'); setIsModalOpen(true); }} className="flex-1 py-5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <X size={18} /> {t('reject')}
                    </button>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 italic uppercase font-black text-slate-300">
             <Inbox size={120} className="mb-4" /> Seçili İş Öğesi Bulunmuyor
          </div>
        )}
      </div>

      <div className="w-96 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#020617] flex flex-col shrink-0 overflow-hidden">
        <header className="p-6 border-b border-slate-100 dark:border-slate-800">
           <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={16} /> Audit İzleri</h3>
        </header>
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
           {selectedItem && <Timeline events={selectedItem.timeline} />}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">İşlem Gerekçesi</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-4">
                 <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed">
                   {modalType === 'REJECT' ? 'Bu talebi reddetmek için nedeninizi belirtin.' : 'Revizyon talebinizin nedenini açıklayın.'}
                 </p>
                 <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Gerekçe yazınız..."
                  className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-5 text-sm font-bold dark:text-white outline-none transition-all shadow-inner resize-none"
                 />
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">{t('cancel')}</button>
                 <button onClick={confirmNegativeAction} className={`flex-2 py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 ${modalType === 'REJECT' ? 'bg-rose-600 shadow-rose-600/20' : 'bg-amber-500 shadow-amber-500/20'}`}>
                    İşlemi Tamamla
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DetailBox = ({ label, value }: any) => (
  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-lg font-black dark:text-white">{value}</p>
  </div>
);

export default InboxView;
