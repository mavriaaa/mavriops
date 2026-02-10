
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, FileText, Calendar, Search, 
  ChevronRight, ArrowUpRight, Clock,
  Wallet, Building, ShieldCheck, CheckCircle2,
  FileCheck, Timer, PackageCheck, ShieldAlert,
  ArrowDownLeft, Banknote, Plus, X, Paperclip, Download,
  TrendingUp
} from 'lucide-react';
import { AppContext } from '../../App';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemStatus, Role, CashAccount, CashTxn, Attachment } from '../../types';
import AttachmentList from '../../components/Common/AttachmentList';
import { LoadingState, StandardEmptyState, ErrorState } from '../../components/Common/StandardStates';
import { validateFinancialForm } from '../../utils/validators';
import { formatCurrencyTR, formatDateTR } from '../../utils/formatters';

const AccountingCenter: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'DOCS' | 'PAYMENTS' | 'CASH'>('DOCS');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [txns, setTxns] = useState<CashTxn[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'IN' | 'OUT' | 'TRANSFER'>('OUT');
  const [newTxn, setNewTxn] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    accountId: '',
    toAccountId: '',
    category: 'Gider',
    description: '',
    counterpartyName: '',
    attachments: []
  });

  if (!context) return null;
  const { t, activeProjectId, currentUser, addToast } = context;

  const isAuthorized = [Role.ACCOUNTANT, Role.OWNER, Role.ADMIN].includes(currentUser.role);

  const load = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError(null);
    try {
      const [itemsData, accountsData, txnsData] = await Promise.all([
        ApiService.fetchWorkItems(),
        ApiService.fetchCashAccounts(),
        ApiService.fetchCashTxns(activeProjectId)
      ]);
      setItems(itemsData.filter(i => i.projectId === activeProjectId));
      setAccounts(accountsData);
      setTxns(txnsData);
    } catch (err) {
      setError('Muhasebe verileri yüklenirken sistem hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeProjectId, isAuthorized]);

  const docQueue = useMemo(() => {
    return items.filter(i => i.status === WorkItemStatus.DELIVERED && (!i.invoice || i.status !== WorkItemStatus.INVOICED))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);

  const paymentCalendar = useMemo(() => {
    return items.filter(i => i.invoice && i.invoice.dueDate && (i.status === WorkItemStatus.INVOICED || i.status === WorkItemStatus.CLOSED))
      .sort((a, b) => new Date(a.invoice?.dueDate || '').getTime() - new Date(b.invoice?.dueDate || '').getTime())
      .filter(i => i.invoice?.cariName?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);

  const cashBalances = useMemo(() => {
    const posted = txns.filter(t => t.status === 'POSTED');
    const cash = posted.filter(t => accounts.find(a => a.id === t.accountId)?.type === 'CASH')
      .reduce((acc, t) => t.type === 'IN' ? acc + t.amount : (t.type === 'OUT' ? acc - t.amount : acc), 0);
    const bank = posted.filter(t => accounts.find(a => a.id === t.accountId)?.type === 'BANK')
      .reduce((acc, t) => t.type === 'IN' ? acc + t.amount : (t.type === 'OUT' ? acc - t.amount : acc), 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const net30 = posted.filter(t => new Date(t.date) >= thirtyDaysAgo)
      .reduce((acc, t) => t.type === 'IN' ? acc + t.amount : (t.type === 'OUT' ? acc - t.amount : acc), 0);

    return { cash, bank, net30 };
  }, [txns, accounts]);

  const handleCreateTxn = async () => {
    const validation = validateFinancialForm({
      amount: newTxn.amount,
      description: newTxn.description,
      attachments: newTxn.attachments
    });

    if (!validation.isValid || !newTxn.accountId) {
      addToast('error', 'Giriş Hatası', validation.message || 'Lütfen tüm zorunlu alanları (Hesap dahil) doldurun.');
      return;
    }

    try {
      const created = await ApiService.createCashTxn({
        ...newTxn,
        type: modalType,
        projectId: activeProjectId,
        currency: 'TRY'
      }, currentUser);

      setTxns([created, ...txns]);
      setIsModalOpen(false);
      addToast('success', 'İşlem Kaydedildi', 'Nakit hareketi başarıyla kasaya işlendi.');
      setNewTxn({ date: new Date().toISOString().split('T')[0], amount: 0, accountId: '', category: 'Gider', description: '', attachments: [] });
    } catch (err) {
      addToast('error', 'İşlem Başarısız', 'Finansal kayıt oluşturulurken bir hata oluştu.');
    }
  };

  if (!isAuthorized) {
    return <ErrorState message="Bu modüle erişim yetkiniz kısıtlanmıştır." />;
  }

  if (loading) return <LoadingState message="Muhasebe verileri analiz ediliyor..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
            <Receipt size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">{t('accounting')}</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <ShieldCheck size={12} className="text-indigo-500" /> Proje Finansal Kontrol Paneli
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {activeTab === 'CASH' && (
             <div className="flex gap-2">
                <button onClick={() => {setModalType('IN'); setIsModalOpen(true);}} className="px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"><ArrowDownLeft size={16}/> Gelir Girişi</button>
                <button onClick={() => {setModalType('OUT'); setIsModalOpen(true);}} className="px-5 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"><ArrowUpRight size={16}/> Gider Girişi</button>
             </div>
           )}
           <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ara..."
                className="pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold w-64 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              />
           </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit rounded-2xl shadow-sm">
        <button onClick={() => setActiveTab('DOCS')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DOCS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Evrak Kuyruğu ({docQueue.length || 0})</button>
        <button onClick={() => setActiveTab('PAYMENTS')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PAYMENTS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Ödeme Takvimi ({paymentCalendar.length || 0})</button>
        <button onClick={() => setActiveTab('CASH')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CASH' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Kasa & Harcamalar ({txns.length || 0})</button>
      </div>

      {activeTab === 'CASH' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
           <BalanceCard label="Kasa Bakiyesi" value={cashBalances.cash} icon={Wallet} color="text-indigo-600" />
           <BalanceCard label="Banka Bakiyesi" value={cashBalances.bank} icon={Banknote} color="text-emerald-600" />
           <BalanceCard label="Net Akış (30 Gün)" value={cashBalances.net30} icon={TrendingUp} color={cashBalances.net30 >= 0 ? 'text-emerald-500' : 'text-rose-500'} />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              {activeTab === 'DOCS' && (
                <>
                  <th className="px-8 py-5">Referans & Saha</th>
                  <th className="px-8 py-5">Talep Başlığı</th>
                  <th className="px-8 py-5">Tedarikçi</th>
                  <th className="px-8 py-5">Tutar</th>
                  <th className="px-8 py-5 text-right">Aksiyon</th>
                </>
              )}
              {activeTab === 'PAYMENTS' && (
                <>
                  <th className="px-8 py-5">Cari & Fatura No</th>
                  <th className="px-8 py-5">Referans</th>
                  <th className="px-8 py-5">Vade Tarihi</th>
                  <th className="px-8 py-5">Ödeme Durumu</th>
                  <th className="px-8 py-5 text-right">Aksiyon</th>
                </>
              )}
              {activeTab === 'CASH' && (
                <>
                  <th className="px-8 py-5">Tarih</th>
                  <th className="px-8 py-5">Tür & Kategori</th>
                  <th className="px-8 py-5">Hesap & Cari</th>
                  <th className="px-8 py-5">Tutar</th>
                  <th className="px-8 py-5">Açıklama</th>
                  <th className="px-8 py-5 text-right">Ekler</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeTab === 'DOCS' && docQueue.map(item => (
              <tr key={item.id} onClick={() => navigate(`/requests/${item.id}?tab=finance`)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                <td className="px-8 py-6">
                  <div>
                    <p className="text-[11px] font-black dark:text-white uppercase tracking-tight leading-none">{item.id}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{item.siteId}</p>
                  </div>
                </td>
                <td className="px-8 py-6"><p className="text-sm font-black dark:text-white group-hover:text-indigo-600 transition-colors uppercase truncate max-w-xs">{item.title}</p></td>
                <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase">{item.procurementData?.vendorName || 'Belirsiz'}</td>
                <td className="px-8 py-6"><p className="text-sm font-black dark:text-white">{formatCurrencyTR(item.amount)}</p></td>
                <td className="px-8 py-6 text-right"><button className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">Fatura Gir</button></td>
              </tr>
            ))}

            {activeTab === 'PAYMENTS' && paymentCalendar.map(item => (
              <tr key={item.id} onClick={() => navigate(`/requests/${item.id}?tab=finance`)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                <td className="px-8 py-6">
                  <div>
                    <p className="text-sm font-black dark:text-white uppercase truncate max-w-[200px]">{item.invoice?.cariName}</p>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">{item.invoice?.invoiceNo}</p>
                  </div>
                </td>
                <td className="px-8 py-6"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.id}</p></td>
                <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase">{formatDateTR(item.invoice?.dueDate) || '-'}</td>
                <td className="px-8 py-6">
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${item.payment?.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                     {item.payment?.paymentStatus || 'PLANNED'}
                   </span>
                </td>
                <td className="px-8 py-6 text-right"><button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 group-hover:text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">{item.payment?.paymentStatus === 'PAID' ? 'Görüntüle' : 'Ödeme İşle'}</button></td>
              </tr>
            ))}

            {activeTab === 'CASH' && txns.map(txn => (
              <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <td className="px-8 py-6 text-[10px] font-black text-slate-500">{formatDateTR(txn.date)}</td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${txn.type === 'IN' ? 'bg-emerald-500' : (txn.type === 'OUT' ? 'bg-rose-500' : 'bg-indigo-500')}`} />
                      <div>
                        <p className="text-xs font-black dark:text-white uppercase leading-none">{txn.type}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{txn.category}</p>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <p className="text-[10px] font-black dark:text-white uppercase truncate max-w-[150px]">{accounts.find(a => a.id === txn.accountId)?.name || 'Hesap'}</p>
                   <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">{txn.counterpartyName || '-'}</p>
                </td>
                <td className="px-8 py-6">
                   <p className={`text-sm font-black ${txn.type === 'IN' ? 'text-emerald-600' : (txn.type === 'OUT' ? 'text-rose-600' : 'text-indigo-600')}`}>
                      {txn.type === 'IN' ? '+' : (txn.type === 'OUT' ? '-' : '')}{formatCurrencyTR(txn.amount)}
                   </p>
                </td>
                <td className="px-8 py-6 text-xs text-slate-500 font-bold uppercase truncate max-w-xs">{txn.description}</td>
                <td className="px-8 py-6 text-right">
                   {txn.attachments.length > 0 && <Paperclip size={14} className="text-indigo-500 ml-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {((activeTab === 'DOCS' && docQueue.length === 0) || (activeTab === 'PAYMENTS' && paymentCalendar.length === 0) || (activeTab === 'CASH' && txns.length === 0)) && (
          <StandardEmptyState title="Kayıt Bulunamadı" description="Bu kriterlere uygun herhangi bir finansal işlem kaydı mevcut değil." />
        )}
      </div>

      {/* Cash Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Nakit Akış Kaydı</h2>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><X size={24} /></button>
              </div>
              <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-2 gap-6">
                    <InputField label="İşlem Tarihi" type="date" value={newTxn.date} onChange={(e:any)=>setNewTxn({...newTxn, date: e.target.value})} />
                    <InputField label="Tutar (TRY)" type="number" value={newTxn.amount} onChange={(e:any)=>setNewTxn({...newTxn, amount: Number(e.target.value)})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Hesap</label>
                       <select value={newTxn.accountId} onChange={(e)=>setNewTxn({...newTxn, accountId: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none">
                          <option value="">Seçiniz...</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>)}
                       </select>
                    </div>
                    <InputField label="Kategori" value={newTxn.category} onChange={(e:any)=>setNewTxn({...newTxn, category: e.target.value})} />
                 </div>
                 <InputField label="Cari/İlgili Kişi" value={newTxn.counterpartyName} onChange={(e:any)=>setNewTxn({...newTxn, counterpartyName: e.target.value})} />
                 <InputField label="Açıklama (Min 10 Karakter)" value={newTxn.description} onChange={(e:any)=>setNewTxn({...newTxn, description: e.target.value})} />
                 
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">Ekler {newTxn.amount >= 5000 && <span className="text-rose-500">* 5.000+ TRY İçin Zorunlu</span>}</label>
                    <AttachmentList attachments={newTxn.attachments} onUpload={(a)=>setNewTxn({...newTxn, attachments: [...newTxn.attachments, a]})} onRemove={(id)=>setNewTxn({...newTxn, attachments: newTxn.attachments.filter((x:any)=>x.id!==id)})} />
                 </div>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">İptal</button>
                 <button onClick={handleCreateTxn} className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-indigo-700 transition-all active:scale-95">İşlemi Tamamla</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const BalanceCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
     <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform ${color}`}><Icon size={64}/></div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
     <h3 className={`text-3xl font-black tracking-tighter dark:text-white ${value < 0 ? 'text-rose-500' : ''}`}>{formatCurrencyTR(value)}</h3>
  </div>
);

const InputField = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>
    <input type={type} value={value} onChange={onChange} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all" />
  </div>
);

export default AccountingCenter;
