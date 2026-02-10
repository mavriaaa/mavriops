
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, History, ShoppingCart, Wallet, 
  ArrowLeft, Calendar, User, MapPin, 
  ShieldCheck, Clock, Paperclip, Send, CheckCircle2,
  ShieldAlert, Receipt, Calculator, Banknote, Trash2, Save,
  ArrowRight
} from 'lucide-react';
import { AppContext } from '../../App';
import { ApiService } from '../../services/api';
import { WorkItem, WorkItemStatus, Role } from '../../types';
import { getTranslation } from '../../i18n';
import Timeline from '../../components/Common/Timeline';
import AttachmentList from '../../components/Common/AttachmentList';

const RequestDetailView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const context = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'PROCESS' | 'PROCUREMENT' | 'FINANCE'>('SUMMARY');
  const [item, setItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Accounting Form State
  const [invoiceForm, setInvoiceForm] = useState<any>({
    cariName: '', invoiceNo: '', invoiceDate: '', currency: 'TRY', 
    netAmount: 0, vatRate: 20, vatAmount: 0, totalAmount: 0, dueDate: '', attachments: []
  });
  const [paymentForm, setPaymentForm] = useState<any>({
    paymentStatus: 'PLANNED', paidDate: '', paidAmount: 0, paymentNote: ''
  });

  useEffect(() => {
    const urlTab = searchParams.get('tab')?.toUpperCase();
    if (urlTab === 'FINANCE') setActiveTab('FINANCE');
  }, [searchParams]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      ApiService.fetchWorkItems().then(items => {
        const found = items.find(i => i.id === id);
        if (found) {
          setItem(found);
          if (found.invoice) setInvoiceForm(found.invoice);
          if (found.payment) setPaymentForm(found.payment);
        }
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    const vat = (Number(invoiceForm.netAmount) * Number(invoiceForm.vatRate)) / 100;
    setInvoiceForm((prev: any) => ({
      ...prev,
      vatAmount: vat,
      totalAmount: Number(prev.netAmount) + vat
    }));
  }, [invoiceForm.netAmount, invoiceForm.vatRate]);

  if (!context) return null;
  const { currentUser, addToast, activeProjectId } = context;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (!item) return <div className="p-20 text-center uppercase font-black text-slate-300">Kayıt Bulunamadı</div>;

  if (item.projectId !== activeProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 text-center">
        <div className="w-20 h-20 bg-rose-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-8"><ShieldAlert size={40} /></div>
        <h2 className="text-2xl font-black text-rose-600 uppercase mb-4">403 - Erişim Engellendi</h2>
        <p className="max-w-md text-slate-500 text-sm mb-10">Bu kayıt şu an seçili olan projeye ait değildir.</p>
        <button onClick={() => navigate('/requests')} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px]">Geri Dön</button>
      </div>
    );
  }

  const isAccountant = currentUser.role === Role.ACCOUNTANT || currentUser.role === Role.OWNER || currentUser.role === Role.ADMIN;

  const handleInvoiceSubmit = async () => {
    if (!invoiceForm.invoiceNo || !invoiceForm.invoiceDate || invoiceForm.attachments.length === 0) {
      addToast('error', 'Hata', 'Zorunlu alanları doldurun.');
      return;
    }
    const updated = await ApiService.updateWorkItem(item.id, { invoice: invoiceForm, status: WorkItemStatus.INVOICED }, currentUser);
    setItem(updated);
    addToast('success', 'Faturalandırıldı', 'Resmi evrak kaydı tamamlandı.');
  };

  const handleCloseItem = async () => {
    if (paymentForm.paymentStatus !== 'PAID' || !paymentForm.paidDate) {
      addToast('error', 'Hata', 'Ödeme tarihi ve durumu zorunludur.');
      return;
    }

    // 1. Create Cash Transaction Automatically
    const cashTxn = await ApiService.createCashTxn({
      projectId: item.projectId,
      type: 'OUT',
      amount: item.invoice?.totalAmount || item.amount,
      date: paymentForm.paidDate,
      accountId: 'acc-1', // Default Kasa
      category: 'ÖDEME',
      counterpartyName: item.invoice?.cariName || item.procurementData?.vendorName,
      description: `${item.id} nolu talebin ödemesi.`,
      workItemId: item.id,
      attachments: item.invoice?.attachments || []
    }, currentUser);
    
    // 2. Update WorkItem status and link to CashTxn
    const updated = await ApiService.updateWorkItem(item.id, { 
      status: WorkItemStatus.CLOSED,
      payment: { ...paymentForm, linkedCashTxnId: cashTxn.id }
    }, currentUser);
    
    setItem(updated);
    addToast('success', 'Talep Kapatıldı', 'Ödeme işlendi ve kasa hareketi oluşturuldu.');
  };

  const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('tr-TR') : '-';
  const formatMoney = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500">
      <header className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/requests')} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><ArrowLeft size={20} /></button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.id}</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 uppercase">{getTranslation(item.status)}</span>
            </div>
            <h1 className="text-xl font-black dark:text-white uppercase tracking-tight">{item.title}</h1>
          </div>
        </div>
      </header>

      <div className="px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-8">
        {[{id:'SUMMARY',label:'Özet',icon:FileText},{id:'PROCESS',label:'Süreç',icon:History},{id:'PROCUREMENT',label:'Satınalma',icon:ShoppingCart},{id:'FINANCE',label:'Finans',icon:Wallet}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 no-scrollbar pb-32">
        {activeTab === 'SUMMARY' && (
          <div className="max-w-4xl space-y-8">
            <div className="grid grid-cols-3 gap-6">
              <DetailCard label="Oluşturan" value={item.createdBy} icon={User} />
              <DetailCard label="Talep Tarihi" value={formatDate(item.requestedDate)} icon={Calendar} />
              <DetailCard label="Tutar" value={formatMoney(item.amount)} icon={ShieldCheck} />
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Açıklama</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
            </div>
          </div>
        )}

        {activeTab === 'FINANCE' && (
          <div className="max-w-5xl space-y-10">
             <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-10">
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center"><Receipt size={24}/></div>
                  <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Muhasebe & Fatura</h3>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <InputField label="Tedarikçi Ünvan" value={invoiceForm.cariName} onChange={(e:any)=>setInvoiceForm({...invoiceForm, cariName: e.target.value})} readOnly={!isAccountant} />
                   <div className="grid grid-cols-2 gap-4">
                      <InputField label="Fatura No" value={invoiceForm.invoiceNo} onChange={(e:any)=>setInvoiceForm({...invoiceForm, invoiceNo: e.target.value})} readOnly={!isAccountant} />
                      <InputField label="Fatura Tarihi" type="date" value={invoiceForm.invoiceDate} onChange={(e:any)=>setInvoiceForm({...invoiceForm, invoiceDate: e.target.value})} readOnly={!isAccountant} />
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <InputField label="Net Tutar" type="number" value={invoiceForm.netAmount} onChange={(e:any)=>setInvoiceForm({...invoiceForm, netAmount: Number(e.target.value)})} readOnly={!isAccountant} />
                      <InputField label="KDV %" value={invoiceForm.vatRate} onChange={(e:any)=>setInvoiceForm({...invoiceForm, vatRate: Number(e.target.value)})} readOnly={!isAccountant} />
                      <InputField label="KDV Tutarı" value={invoiceForm.vatAmount.toFixed(2)} readOnly />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <InputField label="Genel Toplam" value={invoiceForm.totalAmount.toFixed(2)} readOnly />
                      <InputField label="Vade" type="date" value={invoiceForm.dueDate} onChange={(e:any)=>setInvoiceForm({...invoiceForm, dueDate: e.target.value})} readOnly={!isAccountant} />
                   </div>
                </div>

                <AttachmentList attachments={invoiceForm.attachments} onUpload={(a) => setInvoiceForm({...invoiceForm, attachments: [...invoiceForm.attachments, a]})} onRemove={(id) => setInvoiceForm({...invoiceForm, attachments: invoiceForm.attachments.filter((x:any)=>x.id!==id)})} isReadOnly={!isAccountant} />

                {isAccountant && item.status !== 'CLOSED' && (
                  <button onClick={handleInvoiceSubmit} className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                    <CheckCircle2 size={20} /> Faturalandır
                  </button>
                )}
             </div>

             {(item.status === 'INVOICED' || item.status === 'CLOSED') && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-10 rounded-[3.5rem] border-2 border-emerald-100 dark:border-emerald-900/40 space-y-8 animate-in slide-in-from-top-4">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Banknote size={24}/></div>
                        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Ödeme Durumu</h3>
                     </div>
                     {item.payment?.linkedCashTxnId && (
                       <button onClick={() => navigate('/accounting')} className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 rounded-xl text-[10px] font-black uppercase">
                          Kasa Hareketini Gör <ArrowRight size={14}/>
                       </button>
                     )}
                   </div>

                   <div className="grid grid-cols-2 gap-10">
                      <div className="flex gap-2">
                        {['PLANNED', 'PAID'].map(st => (
                          <button key={st} disabled={!isAccountant || item.status === 'CLOSED'} onClick={() => setPaymentForm({...paymentForm, paymentStatus: st})} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${paymentForm.paymentStatus === st ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>
                             {getTranslation(st)}
                          </button>
                        ))}
                      </div>
                      <InputField label="Ödeme Tarihi" type="date" value={paymentForm.paidDate} onChange={(e:any)=>setPaymentForm({...paymentForm, paidDate: e.target.value})} readOnly={!isAccountant || item.status === 'CLOSED'} />
                      <div className="col-span-2">
                         <InputField label="Hazine Notu" value={paymentForm.paymentNote} onChange={(e:any)=>setPaymentForm({...paymentForm, paymentNote: e.target.value})} readOnly={!isAccountant || item.status === 'CLOSED'} />
                      </div>
                   </div>

                   {isAccountant && item.status !== 'CLOSED' && (
                     <button onClick={handleCloseItem} className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                        <ShieldCheck size={20} /> Ödemeyi Onayla ve Kapat
                     </button>
                   )}
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const DetailCard = ({ label, value, icon: Icon }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl group-hover:scale-110 transition-transform"><Icon size={14} /></div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-sm font-black dark:text-white uppercase">{value}</p>
  </div>
);

const InputField = ({ label, value, onChange, readOnly, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
    <input type={type} value={value} onChange={onChange} readOnly={readOnly} className={`w-full p-4 rounded-2xl text-sm font-bold border-2 transition-all outline-none ${readOnly ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 italic' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 focus:border-indigo-500 shadow-sm'}`} />
  </div>
);

export default RequestDetailView;
