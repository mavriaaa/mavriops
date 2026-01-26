
import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { MOCK_TASKS, MOCK_USERS } from '../../constants';
import { Plus, MoreHorizontal, Clock, Tag } from 'lucide-react';

const TaskBoard: React.FC = () => {
  const context = useContext(AppContext);
  const [tasks] = useState(MOCK_TASKS);
  if (!context) return null;
  const { t } = context;

  const Column = ({ title, status }: { title: string, status: string }) => (
    <div className="w-80 shrink-0 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold dark:text-white uppercase tracking-wider">{title}</h3>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
            {tasks.filter(t => t.status === status).length}
          </span>
        </div>
        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Plus size={14} /></button>
      </div>
      
      <div className="flex-1 space-y-3">
        {tasks.filter(t => t.status === status).map(task => {
          const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
          return (
            <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group cursor-grab active:cursor-grabbing">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${task.priority === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</span>
                <button className="opacity-0 group-hover:opacity-100 text-slate-400"><MoreHorizontal size={14} /></button>
              </div>
              <h4 className="text-sm font-bold dark:text-white mb-4 line-clamp-2">{task.title}</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold">2d</span>
                </div>
                <img src={assignee?.avatar} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800" alt="avatar" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black dark:text-white">{t('tasks')}</h1>
          <p className="text-sm text-slate-500 font-medium">Operasyonel iş planı ve takip tahtası.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold shadow-sm">Filter</button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20">Create Task</button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 flex gap-8">
        <Column title="ToDo" status="TODO" />
        <Column title="In Progress" status="DOING" />
        <Column title="Review" status="REVIEW" />
        <Column title="Completed" status="DONE" />
      </div>
    </div>
  );
};

export default TaskBoard;
