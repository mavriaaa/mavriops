
import React, { useState, useEffect } from 'react';
import { WorkflowDefinition, RequestType, Role, WorkflowStep } from '../../types';
import { WorkflowService } from '../../services/workflowService';
import { Plus, Save, Trash2, GitBranch, ShieldCheck, Clock, Settings2, CheckCircle2 } from 'lucide-react';

const WorkflowStudio: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWf, setSelectedWf] = useState<WorkflowDefinition | null>(null);

  useEffect(() => {
    setWorkflows(WorkflowService.getWorkflows());
  }, []);

  const handleCreate = () => {
    const newWf: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: 'Yeni Akış',
      appliesTo: RequestType.PURCHASE,
      isActive: true,
      steps: [],
      conditions: []
    };
    setSelectedWf(newWf);
  };

  const addStep = () => {
    if (!selectedWf) return;
    const step: WorkflowStep = {
      id: `ws-${Date.now()}`,
      stepNo: selectedWf.steps.length + 1,
      mode: 'ROLE',
      roleRequired: Role.MANAGER,
      requireNote: true
    };
    setSelectedWf({ ...selectedWf, steps: [...selectedWf.steps, step] });
  };

  const save = () => {
    if (!selectedWf) return;
    WorkflowService.saveWorkflow(selectedWf);
    setWorkflows(WorkflowService.getWorkflows());
    alert('İş akışı başarıyla kaydedildi.');
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter dark:text-white uppercase leading-none">Workflow Studio</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
            <GitBranch size={12} className="text-indigo-500" /> Kurumsal Karar Hattı Tasarımcısı
          </p>
        </div>
        <button onClick={handleCreate} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
          <Plus size={16} /> Yeni Tanımla
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
        {/* List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
          <header className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Aktif Tanımlar</h2>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {workflows.map(wf => (
              <button 
                key={wf.id} 
                onClick={() => setSelectedWf(wf)}
                className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${selectedWf?.id === wf.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-50 dark:border-slate-800 hover:border-indigo-200'}`}
              >
                <div className="flex items-center justify-between">
                   <p className="text-sm font-black dark:text-white uppercase truncate">{wf.name}</p>
                   <CheckCircle2 size={14} className={wf.isActive ? 'text-emerald-500' : 'text-slate-300'} />
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{wf.appliesTo} • {wf.steps.length} Adım</p>
              </button>
            ))}
          </div>
        </div>

        {/* Builder */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col shadow-xl overflow-hidden">
          {selectedWf ? (
            <>
              <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Settings2 size={24} /></div>
                  <div>
                    <input 
                      className="bg-transparent border-none text-xl font-black dark:text-white outline-none uppercase tracking-tighter"
                      value={selectedWf.name}
                      onChange={e => setSelectedWf({...selectedWf, name: e.target.value})}
                    />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Akış Yapılandırması</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={save} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"><Save size={16} /> Kaydet</button>
                  <button onClick={() => setSelectedWf(null)} className="p-3 text-slate-400 hover:text-rose-500"><Trash2 size={18} /></button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                <section className="space-y-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> Onay Adımları</h3>
                  <div className="space-y-4 relative">
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800" />
                    {selectedWf.steps.map((step, i) => (
                      <div key={step.id} className="flex gap-6 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black shadow-sm">{step.stepNo}</div>
                        <div className="flex-1 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex gap-4 items-center">
                            <select 
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[10px] font-black uppercase outline-none"
                                value={step.roleRequired}
                                onChange={e => {
                                    const steps = [...selectedWf.steps];
                                    steps[i].roleRequired = e.target.value as Role;
                                    setSelectedWf({...selectedWf, steps});
                                }}
                            >
                                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                <input type="checkbox" checked={step.requireNote} onChange={e => {
                                    const steps = [...selectedWf.steps];
                                    steps[i].requireNote = e.target.checked;
                                    setSelectedWf({...selectedWf, steps});
                                }} /> Not Zorunlu
                            </label>
                          </div>
                          <button onClick={() => {
                              const steps = selectedWf.steps.filter(x => x.id !== step.id).map((s, idx) => ({ ...s, stepNo: idx + 1 }));
                              setSelectedWf({...selectedWf, steps});
                          }} className="text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    <button onClick={addStep} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2">
                      <Plus size={14} /> Yeni Adım Ekle
                    </button>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
              <GitBranch size={64} className="text-slate-300" />
              <p className="text-[11px] font-black uppercase tracking-widest">Düzenlemek veya oluşturmak için akış seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowStudio;
