
import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2, 
  Filter, 
  Search
} from 'lucide-react';
import { MOCK_BOARDS, MOCK_LISTS, MOCK_CARDS, MOCK_USERS } from '../../constants';
import { Card, List } from '../../types';
import { AppContext } from '../../App';

const BoardView: React.FC = () => {
  const { boardId } = useParams();
  const context = useContext(AppContext);
  const [lists] = useState<List[]>(MOCK_LISTS);
  const [cards] = useState<Card[]>(MOCK_CARDS);
  const [activeBoard] = useState(MOCK_BOARDS.find(b => b.id === boardId) || MOCK_BOARDS[0]);

  if (!context) return null;
  const { t } = context;

  const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group cursor-pointer">
        <h4 className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{card.title}</h4>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-slate-400">
            {card.checklists.length > 0 && (
              <div className="flex items-center gap-0.5 text-[10px] font-medium">
                <CheckCircle2 size={12} />
                {card.checklists[0].items.filter(i => i.isDone).length}/{card.checklists[0].items.length}
              </div>
            )}
          </div>
          <div className="flex -space-x-2">
            {card.assignees.map(uid => {
              const u = MOCK_USERS.find(user => user.id === uid);
              return <img key={uid} src={u?.avatar} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-800" />;
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold dark:text-white">{activeBoard.name}</h2>
          <div className="flex -space-x-2 ml-4">
            {MOCK_USERS.map(u => (
               <img key={u.id} src={u.avatar} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('filterCards')} 
              className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-xs focus:ring-2 focus:ring-indigo-500 w-48 transition-all"
            />
          </div>
          <button className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-md hover:bg-indigo-700 transition-all">
            {t('share')}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-6 flex items-start gap-6 bg-indigo-50/20 dark:bg-transparent">
        {lists.map(list => (
          <div key={list.id} className="w-72 flex-shrink-0 flex flex-col max-h-full">
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{t(list.name.toLowerCase().replace(' ', '') as any) || list.name}</h3>
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">
                  {cards.filter(c => c.listId === list.id).length}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
              {cards.filter(c => c.listId === list.id).map(card => (
                <CardComponent key={card.id} card={card} />
              ))}
              <button className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 transition-all">
                <Plus size={14} /> {t('addCard')}
              </button>
            </div>
          </div>
        ))}

        <div className="w-72 flex-shrink-0">
          <button className="w-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 p-3 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 transition-all border-2 border-dashed border-slate-300 dark:border-slate-700">
            <Plus size={18} /> {t('addList')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
