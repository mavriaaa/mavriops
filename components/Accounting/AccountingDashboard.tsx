
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
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
  Filter,
  X,
  // Added missing Users icon import
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
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const all = await ApiService.fetchWorkItems();
    // Onaylanmış ama henüz ödeme işlemi yapılmamış talepleri getir
    setApprovedRequests(all.filter(i => i.type === WorkItemType.REQUEST && i.status === WorkItemStatus.APPROVED));
  };

  if (!context) return null;
  const { t } = context;

  const totalPaid = transactions.filter(t => t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0) + 
                       approvedRequests.reduce((sum, r) => sum + (r.requestData?.amount || 0), 0);

  const handleMarkAsPaid = (req: WorkItem) => {
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
    // Gerçek bir uygulamada burada ApiService.updateStatus(req.id, WorkItemStatus.DONE) çağrılırdı.
    setApprovedRequests(prev => prev.filter(r => r.id !== req.id));
    alert("Ödeme başarıyla gerçekleştirildi ve hazine kayıtlarına işlendi.");
  };

  const handleExportCSV = () => {
    alert("Finansal tediye raporu (CSV) oluşturuluyor...");
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700 bg-slate-50 dark:bg-slate-950 min-h-full">
      {/* Üst Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/20">
            <Banknote size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase">
              {t('accounting')}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Hazine, Ödeme ve Mali Kontrol Merkezi</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handleExportCSV}
            className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
           >
             <Download size={16} /> Excel Aktar
           </button>
           <button 
            className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-rose-600/30 hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-2"
           >
             <Receipt size={18} /> Manuel Tediye Fişi
           </button>
        </div>
      </div>

      {/* Finansal Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-sm">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp size={80} className="text-rose-600" />
           </div>
           <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Toplam Çıkış (Bu Ay)</p>
           <h3 className="text-4xl font-black dark:text-white tracking-tighter">₺{totalPaid.toLocaleString()}</h3>
           <div className="flex items-center gap-2 mt-4 text-xs font-bold text-rose-500">
              <ArrowUpRight size={14} /> %8.2 Artış <span className="text-slate-400 font-medium">geçen aya göre</span>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-sm">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <Clock size={80} className="text-amber-500" />
           </div>
           <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Ödeme Bekleyen (Hazine Kuyruğu)</p>
           <h3 className="text-4xl font-black dark:text-white tracking-tighter">₺{totalPending.toLocaleString()}</h3>
           <div className="flex items-center gap-2 mt-4 text-xs font-bold text-amber-500">
              <AlertCircle size={14} /> {approvedRequests.length + transactions.filter(t => t.status === 'PENDING').length} İşlem Onay Bekliyor
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-sm">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <Wallet size={80} className="text-emerald-500" />
           </div>
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Operasyonel Likidite</p>
           <h3 className="text-4xl font-black dark:text-white tracking-tighter">₺4.85M</h3>
           <div className="flex items-center gap-2 mt-4 text-xs font-bold text-emerald-500">
              <CheckCircle2 size={14} /> Fonlar Müsait <span className="text-slate-400 font-medium">Bütçe Sınırı Dahilinde</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Sol Panel: Ödeme Bekleyen Talepler ve Son İşlemler */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Hazine Kuyruğu */}
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-amber-50/30 dark:bg-amber-900/10 flex justify-between items-center">
                 <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase flex items-center gap-3">
                   <Clock className="text-amber-500" /> Ödeme Kuyruğu (Onaylı Talepler)
                 </h2>
                 <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-full uppercase">Acil Ödeme Emri</span>
              </div>
              <div className="p-2">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-4">Saha</th>
                          <th className="px-6 py-4">Talep Detayı</th>
                          <th className="px-6 py-4 text-right">Tutar</th>
                          <th className="px-6 py-4 text-right">İşlem</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {approvedRequests.map(req => (
                         <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="px-6 py-5">
                               <span className="text-[10px] font-black text-slate-500 uppercase">{req.siteId}</span>
                            </td>
                            <td className="px-6 py-5">
                               <p className="text-xs font-black dark:text-white uppercase tracking-tight">{req.title}</p>
                               <p className="text-[9px] font-bold text-slate-400">{req.id} • {req.requestData?.category}</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <p className="text-sm font-black dark:text-white">₺{req.requestData?.amount.toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <button 
                                onClick={() => handleMarkAsPaid(req)}
                                className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                               >
                                 Öde
                               </button>
                            </td>
                         </tr>
                       ))}
                       {approvedRequests.length === 0 && (
                         <tr>
                            <td colSpan={4} className="py-12 text-center opacity-30">
                               <CheckCircle2 size={32} className="mx-auto mb-2" />
                               <p className="text-[10px] font-black uppercase tracking-widest">Bekleyen Ödeme Emri Yok</p>
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Son Finansal İşlemler */}
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase flex items-center gap-3">
                    <History className="text-rose-500" /> Son Muhasebe Kayıtları
                 </h2>
                 <div className="flex items-center gap-3">
                    <div className="relative">
                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input type="text" placeholder="İşlem Ara..." className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-rose-500" />
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 {transactions.map((tx) => (
                   <div 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all group cursor-pointer"
                   >
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors ${
                           tx.status === 'PAID' ? 'bg-emerald-500 text-white' : 
                           tx.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                         }`}>
                            <CreditCard size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-black dark:text-white uppercase tracking-tight">{tx.vendor}</p>
                            <div className="flex gap-3 mt-0.5">
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">REF: {tx.id}</span>
                               <span className="text-[9px] font-black text-rose-500 uppercase">{tx.category}</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black dark:text-white">₺{tx.amount.toLocaleString()}</p>
                         <p className="text-[9px] font-bold text-slate-400 mt-0.5">{tx.date}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sağ Panel: Analitik ve Bütçe */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Bütçe Dağılımı */}
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-lg font-black dark:text-white mb-8 tracking-tighter uppercase flex items-center gap-3">
                 <PieChart className="text-indigo-500" /> Departman Bütçe Takibi
              </h2>
              <div className="space-y-6">
                 {[
                   { label: 'Saha Malzemeleri', used: 72, limit: '2.5M', color: 'bg-emerald-500' },
                   { label: 'Personel Giderleri', used: 88, limit: '1.2M', color: 'bg-indigo-500' },
                   { label: 'Lojistik & Yakıt', used: 45, limit: '800K', color: 'bg-amber-500' },
                   { label: 'İdari Giderler', used: 30, limit: '250K', color: 'bg-rose-500' },
                 ].map((b) => (
                   <div key={b.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-slate-500">{b.label}</span>
                         <span className="dark:text-white">%{b.used} <span className="text-slate-400 font-bold ml-1">/ {b.limit}</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div 
                           style={{ width: `${b.used}%` }} 
                           className={`h-full ${b.color} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
                         />
                      </div>
                   </div>
                 ))}
              </div>
              <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                 <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Kümülatif Bütçe Kullanımı</p>
                 <p className="text-2xl font-black dark:text-white tracking-tighter">₺6.2M <span className="text-slate-300 mx-1">/</span> ₺8.5M</p>
                 <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                    <TrendingUp size={12} /> Limit Dahilinde
                 </div>
              </div>
           </div>

           {/* Hızlı Raporlar */}
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-lg font-black dark:text-white mb-6 tracking-tighter uppercase">Muhasebe Belgeleri</h2>
              <div className="space-y-3">
                 {[
                   { name: 'Mizan Raporu.pdf', date: 'Dün 16:40', icon: FileText },
                   { name: 'KDV_Tahakkuk_Nisan.pdf', date: '2 gün önce', icon: Receipt },
                   { name: 'Maas_Listesi_Mayis.xlsx', date: '3 gün önce', icon: Users },
                 ].map((doc, i) => (
                   <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                      <div className="flex items-center gap-3">
                         <doc.icon size={18} className="text-slate-400 group-hover:text-rose-500" />
                         <div className="text-left">
                            <p className="text-xs font-bold dark:text-white truncate max-w-[150px]">{doc.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{doc.date}</p>
                         </div>
                      </div>
                      <Download size={14} className="text-slate-300 group-hover:text-rose-500" />
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* İşlem Detay Modalı */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">İşlem Detayı</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Muhasebe Kayıt Fişi</p>
                 </div>
                 <button onClick={() => setSelectedTx(null)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-colors">
                    <X size={20} />
                 </button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="flex justify-between items-start">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cari Hesap / Vendor</p>
                       <p className="text-xl font-black dark:text-white uppercase tracking-tight">{selectedTx.vendor}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Durum</p>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                         selectedTx.status === 'PAID' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                       }`}>{selectedTx.status}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem]">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Tutar</p>
                       <p className="text-2xl font-black dark:text-white">₺{selectedTx.amount.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem]">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Referans No</p>
                       <p className="text-lg font-black dark:text-white">{selectedTx.id}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                       <span className="text-slate-400">İşlem Tarihi</span>
                       <span className="dark:text-white">{selectedTx.date}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                       <span className="text-slate-400">Kategori</span>
                       <span className="dark:text-white">{selectedTx.category}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                       <span className="text-slate-400">Onaylayan</span>
                       <span className="dark:text-white">Serdar CEO</span>
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                 <button className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all">Makbuz İndir</button>
                 <button className="flex-1 py-5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all">İtiraz Oluştur</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AccountingDashboard;
