
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { MOCK_USERS } from '../../constants';
import { Request, RequestStatus } from '../../types';
import { ApiService } from '../../services/api';
import { Check, X, RotateCcw } from 'lucide-react';

const ApprovalsInbox: React.FC = () => {
  const context = useContext(AppContext);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    const all = await ApiService.fetchRequests();
    setRequests(all.filter(r => r.status === RequestStatus.SUBMITTED));
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (!context) return null;
  const { t, currentUser } = context;

  const handleAction = async (requestId: string, status: RequestStatus) => {
    await ApiService.updateRequestStatus(requestId, status, currentUser.id);
    setRequests(prev => prev.filter(r => r.id !== requestId));
    // Simple feedback toast simulation
    const actionLabel = status === RequestStatus.APPROVED ? 'Onaylandı' : (status === RequestStatus.REJECTED ? 'Reddedildi' : 'Revizyon İstendi');
    alert(`${requestId} nolu talep ${actionLabel}.`);
  };

  return (
    <div className="p-8 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-2xl font-black dark:text-white tracking-tight">{t('approvals')}</h1>
        <p className="text-sm text-slate-500 font-medium">
          {loading ? 'Yükleniyor...' : requests.length > 0 ? `Onayınızı bekleyen ${requests.length} adet işlem var.` : 'Tüm onaylar tamamlandı!'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map(req => {
          const user = MOCK_USERS.find(u => u.id === req.requesterId);
          return (
            <div key={req.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center gap-6 hover:shadow-md transition-shadow">
              <div className="flex-1 flex gap-4">
                <img src={user?.avatar} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="user" />
                <div>
                  <h3 className="font-bold dark:text-white text-lg">{req.title}</h3>
                  <p className="text-sm text-slate-500 mb-2 line-clamp-1">{req.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase">{req.type}</span>
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-black rounded uppercase">{req.siteId}</span>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 text-right md:px-6 md:border-x border-slate-100 dark:border-slate-800">
                <p className="text-xl font-black dark:text-white mb-1">{req.amount.toLocaleString()} {req.currency}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
              </div>

              <div className="shrink-0 flex gap-2">
                <button 
                  onClick={() => handleAction(req.id, RequestStatus.REJECTED)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-xs font-bold"
                >
                  <X size={16} /> {t('reject')}
                </button>
                <button 
                  onClick={() => handleAction(req.id, RequestStatus.REVISION)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors text-xs font-bold"
                >
                  <RotateCcw size={16} /> {t('revision')}
                </button>
                <button 
                  onClick={() => handleAction(req.id, RequestStatus.APPROVED)}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  <Check size={16} /> {t('approve')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalsInbox;
