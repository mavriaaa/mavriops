
import React from 'react';
import { WorkItem, RaciRole, User } from '../../types';
import { MOCK_USERS } from '../../constants';
import { Users, Info, BellRing } from 'lucide-react';
import { ApiService } from '../../services/api';
import UserAvatar from '../Common/UserAvatar';

interface Props {
  workItem: WorkItem;
  currentUser: User;
  onUpdate: () => void;
}

const RaciPanel: React.FC<Props> = ({ workItem, currentUser, onUpdate }) => {
  const getRoleUser = (role: RaciRole) => {
    const r = workItem.raci?.find(x => x.role === role);
    return MOCK_USERS.find(u => u.id === r?.userId);
  };

  const updateRole = async (role: RaciRole, userId: string) => {
    const currentRaci = workItem.raci || [];
    const filtered = currentRaci.filter(x => x.role !== role);
    const updated = [...filtered, { workItemId: workItem.id, userId, role }];
    await ApiService.updateRaci(workItem.id, updated, currentUser);
    onUpdate();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Users size={16} className="text-indigo-500" /> RACI Matrisi
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'R', label: 'Responsible', desc: 'İcra Eden' },
          { key: 'A', label: 'Accountable', desc: 'Onaylayan' },
          { key: 'C', label: 'Consulted', desc: 'Danışılan' },
          { key: 'I', label: 'Informed', desc: 'Bilgilendirilen' }
        ].map(r => {
          const user = getRoleUser(r.key as RaciRole);
          return (
            <div key={r.key} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:border-indigo-300">
               <div className="flex justify-between items-start mb-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">{r.key}</span>
                  <div className="text-right">
                     <p className="text-[9px] font-black dark:text-white uppercase tracking-tighter">{r.label}</p>
                     <p className="text-[8px] text-slate-400 font-bold uppercase">{r.desc}</p>
                  </div>
               </div>
               <select 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-[10px] font-bold outline-none"
                value={user?.id || ''}
                onChange={e => updateRole(r.key as RaciRole, e.target.value)}
               >
                 <option value="">Seçiniz...</option>
                 {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
               </select>
               {user && (
                 <div className="mt-3 flex items-center gap-2">
                    <UserAvatar name={user.name} size="sm" />
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">{user.name}</span>
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RaciPanel;
