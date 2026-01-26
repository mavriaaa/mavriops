
import React, { useState, useEffect, useContext } from 'react';
import { 
  Bell, 
  CheckCheck, 
  AtSign, 
  UserCheck, 
  Heart, 
  Settings,
  Circle
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Notification } from '../../types';
import { AppContext } from '../../App';

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const context = useContext(AppContext);

  useEffect(() => {
    ApiService.getNotifications().then(setNotifications);
  }, []);

  if (!context) return null;
  const { t } = context;

  const getIcon = (type: string) => {
    switch (type) {
      case 'mention': return <AtSign size={16} className="text-blue-500" />;
      case 'assignment': return <UserCheck size={16} className="text-green-500" />;
      case 'reaction': return <Heart size={16} className="text-pink-500" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-slate-400" />
          <h2 className="text-lg font-bold dark:text-white">{t('activity')}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <CheckCheck size={14} /> {t('markAllRead')}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-transparent">
        <div className="max-w-3xl mx-auto py-8 px-6">
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border ${n.isRead ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900 shadow-sm shadow-indigo-500/10'} flex gap-4 transition-all hover:scale-[1.01]`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${n.isRead ? 'bg-slate-100 dark:bg-slate-800' : 'bg-indigo-50 dark:bg-indigo-900/30'}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-bold ${n.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{n.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Bell size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('allCaughtUp')}</h3>
                <p className="text-slate-500 mt-2">{t('notificationSub')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
