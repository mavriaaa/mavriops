
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../App';
import { RequestStatus, RequestType, Request } from '../../types';
import { ApiService } from '../../services/api';
import { 
  Search, 
  Filter, 
  FileText, 
  DollarSign, 
  Package,
  ChevronRight,
  Plus
} from 'lucide-react';

const RequestCenter: React.FC = () => {
  const context = useContext(AppContext);
  const [requests, setRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    ApiService.fetchRequests().then(setRequests);
  }, []);

  if (!context) return null;
  const { t, currentUser } = context;

  const filteredRequests = useMemo(() => {
    return requests.filter(r => 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  const handleCreateRequest = async (type: RequestType) => {
    const newReq: Request = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      requesterId: currentUser.id,
      title: `Yeni ${type} Talebi`,
      description: 'Talep detayları düzenlenmeyi bekliyor.',
      type,
      status: RequestStatus.SUBMITTED,
      amount: Math.floor(Math.random() * 50000),
      currency: 'TRY',
      siteId: 'SITE-A',
      createdAt: new Date().toISOString()
    };
    
    await ApiService.createRequest(newReq);
    setRequests(prev => [newReq, ...prev]);
    alert(`${type} talebi başarıyla oluşturuldu: ${newReq.id}`);
  };

  const StatusBadge = ({ status }: { status: RequestStatus }) => {
    const colors: any = {
      [RequestStatus.APPROVED]: 'bg-emerald-100 text-emerald-700',
      [RequestStatus.SUBMITTED]: 'bg-indigo-100 text-indigo-700',
      [RequestStatus.REJECTED]: 'bg-rose-100 text-rose-700',
      [RequestStatus.REVISION]: 'bg-amber-100 text-amber-700',
    };
    return <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${colors[status] || 'bg-slate-100'}`}>{status}</span>;
  };

  const TypeIcon = ({ type }: { type: RequestType }) => {
    switch(type) {
      case RequestType.PURCHASE: return <Package size={16} />;
      case RequestType.ADVANCE: return <DollarSign size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="p-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">{t('requestCenter')}</h1>
          <p className="text-sm text-slate-500 font-medium">Tüm kurumsal taleplerinizi buradan yönetin.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search')} 
              className="pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
            />
          </div>
          <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { type: RequestType.PURCHASE, label: 'purchaseRequest', icon: Package, color: 'indigo', sub: 'Malzeme & Hizmet' },
          { type: RequestType.ADVANCE, label: 'advanceRequest', icon: DollarSign, color: 'emerald', sub: 'Nakit Avans' },
          { type: RequestType.EXPENSE, label: 'expenseRequest', icon: FileText, color: 'rose', sub: 'Gider Geri Ödeme' }
        ].map((item) => (
          <div 
            key={item.type}
            onClick={() => handleCreateRequest(item.type)}
            className="p-4 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className={`p-3 bg-${item.color}-500 text-white rounded-xl shadow-lg shadow-${item.color}-500/20 group-hover:scale-110 transition-transform`}>
              <item.icon size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold dark:text-white">{t(item.label as any)}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.sub}</p>
            </div>
            <Plus size={18} className="text-slate-300 group-hover:text-indigo-500" />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4">{t('status')}</th>
              <th className="px-6 py-4">ID & Konu</th>
              <th className="px-6 py-4">{t('amount')}</th>
              <th className="px-6 py-4">{t('site')}</th>
              <th className="px-6 py-4">Tarih</th>
              <th className="px-6 py-4 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRequests.map(req => (
              <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"><TypeIcon type={req.type} /></div>
                    <div>
                      <p className="text-xs font-bold dark:text-white group-hover:text-indigo-600 transition-colors">{req.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">#{req.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-black dark:text-white">{req.amount.toLocaleString()} {req.currency}</p>
                </td>
                <td className="px-6 py-4">
                   <p className="text-[10px] font-bold text-slate-500 uppercase">{req.siteId}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(req.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><ChevronRight size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestCenter;
