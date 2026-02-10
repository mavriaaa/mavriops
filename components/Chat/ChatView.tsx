
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Info, Send, Smile, Paperclip, MessageSquare, 
  MoreVertical, Lock, Hash, Reply, CheckCircle, 
  Zap, Calendar, Trash2, Edit3, X, ArrowRight, Bot,
  ShieldCheck, Terminal, ChevronDown, ArrowDown,
  Activity, DollarSign, AlertTriangle, FileText,
  Mic, Camera, Sparkles, BrainCircuit
} from 'lucide-react';
import { AppContext } from '../../App';
import { MOCK_CHANNELS, MOCK_USERS } from '../../constants';
import { Message, User } from '../../types';
import { ApiService } from '../../services/api';
import { BotService } from '../../services/botService';
import BotMessage from './BotMessage';

const ChatView: React.FC = () => {
  const { channelId } = useParams();
  const location = useLocation();
  const context = useContext(AppContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAssistantMode = location.pathname.includes('/assistant');
  const effectiveChannelId = isAssistantMode ? 'assistant-private-room' : (channelId || 'c1');

  if (!context) return null;
  const { currentUser, activeProjectId, projects, metrics, formatMoney } = context;

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeChannel = isAssistantMode 
    ? { name: 'Ops Asistan', topic: 'Akıllı Karar Destek Sistemi', isPrivate: true }
    : (MOCK_CHANNELS.find(c => c.id === effectiveChannelId) || MOCK_CHANNELS[0]);

  useEffect(() => {
    const load = async () => {
      const msgs = await ApiService.fetchMessages(effectiveChannelId);
      setMessages(msgs);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [effectiveChannelId]);

  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else if (messages.length > 0) {
      setShowScrollButton(true);
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
    if (atBottom) setShowScrollButton(false);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
    setIsAtBottom(true);
    setShowScrollButton(false);
  };

  const handleSend = async (customText?: string) => {
    const text = customText || inputValue;
    if (!text.trim()) return;

    let processedText = text;
    if (isAssistantMode && !text.toLowerCase().includes('@mavribot')) {
      processedText = `@mavribot ${text}`;
    }

    const newMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      channelId: effectiveChannelId,
      senderId: currentUser.id,
      content: text,
      timestamp: new Date().toISOString(),
      reactions: []
    };

    const saved = await ApiService.sendMessage(newMsg);
    setMessages(prev => [...prev, saved]);
    if (!customText) setInputValue('');
    setTimeout(scrollToBottom, 100);
    
    if (processedText.toLowerCase().includes('@mavribot')) {
      setIsAnalyzing(true);
      const botTriggerMsg = { ...saved, content: processedText };
      await BotService.processMention(botTriggerMsg, currentUser);
      setIsAnalyzing(false);
    }
  };

  const QuickChip = ({ label, icon: Icon, cmd }: any) => (
    <button 
      onClick={() => handleSend(cmd)}
      className="flex items-center gap-2 px-5 py-2.5 bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl text-[10px] font-black uppercase tracking-[0.05em] text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm whitespace-nowrap active:scale-95"
    >
      <Icon size={12} className="text-indigo-500" /> {label}
    </button>
  );

  return (
    <div className="flex h-full bg-white dark:bg-[#020617] overflow-hidden">
      {/* Ops Assistant Dashboard Sidebar */}
      {isAssistantMode && (
        <div className="hidden xl:flex w-80 flex-col bg-slate-50/50 dark:bg-slate-900/20 border-r border-slate-100 dark:border-white/5 animate-in slide-in-from-left duration-1000">
           <div className="p-8 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-2 opacity-60">
                 <Activity size={14} className="text-indigo-500" /> Proje Vitrini
              </h3>
              <div className="space-y-5">
                 <div className="p-5 bg-white dark:bg-slate-900/60 rounded-[1.75rem] border border-slate-200/50 dark:border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Bütçe Tahsisi</p>
                    <div className="flex items-end justify-between">
                       <p className="text-xl font-black dark:text-white leading-none">%{Math.round(((metrics?.financials.approvedExpenses || 0) / (activeProject?.totalBudget || 1)) * 100)}</p>
                       <span className="text-[10px] font-bold text-slate-400">Aktif Kullanım</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                       <div className="h-full bg-indigo-500 w-1/3 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="p-5 bg-white dark:bg-slate-900/60 rounded-[1.75rem] border border-slate-200/50 dark:border-white/5 shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Risk</p>
                      <p className="text-lg font-black text-rose-500 leading-none">{metrics?.criticalIssues || 0}</p>
                   </div>
                   <div className="p-5 bg-white dark:bg-slate-900/60 rounded-[1.75rem] border border-slate-200/50 dark:border-white/5 shadow-sm">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Onay</p>
                      <p className="text-lg font-black text-amber-500 leading-none">{metrics?.pendingApprovals || 0}</p>
                   </div>
                 </div>
              </div>
           </div>
           <div className="flex-1 p-8 overflow-y-auto no-scrollbar opacity-60">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6">Akış Kayıtları</h3>
              <div className="space-y-6 relative">
                 <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/5" />
                 {[1,2].map(i => (
                    <div key={i} className="flex gap-4 relative z-10">
                       <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-950 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-[10px] font-black dark:text-slate-300 uppercase leading-tight">Sistem Senkronizasyonu</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Hatasız Tamamlandı</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-[#020617]">
        <header className="h-20 border-b border-slate-100 dark:border-white/5 flex items-center justify-between px-10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-2xl z-20 shrink-0">
          <div className="flex items-center gap-6">
            <div className={`p-3 rounded-2xl shadow-sm transition-all ${isAssistantMode ? 'bg-indigo-600 text-white shadow-indigo-200/50 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
               {isAssistantMode ? <Bot size={24} /> : <Hash size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-black text-xl dark:text-white tracking-tight uppercase leading-none">{activeChannel.name}</h1>
                {isAssistantMode && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                     <BrainCircuit size={10} className="text-indigo-600 dark:text-indigo-400" />
                     <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI CORE v3</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1.5">{activeChannel.topic}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             {isAnalyzing && (
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
                   <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
                   <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Veri Analiz Ediliyor</span>
                </div>
             )}
             <button className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl hover:text-indigo-500 transition-all active:scale-95"><Info size={20} /></button>
          </div>
        </header>

        <div 
          ref={scrollRef} 
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-slate-50/20 dark:bg-transparent"
        >
          <div className="max-w-4xl mx-auto w-full py-16 px-8">
            {messages.length === 0 && isAssistantMode && (
               <div className="h-[45vh] flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-1000">
                  <div className="w-20 h-20 bg-indigo-600/5 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8 border border-indigo-600/10">
                     <Sparkles size={36} className="animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Dijital Karar Odası</h3>
                  <p className="max-w-xs text-xs font-bold uppercase mt-4 leading-relaxed text-slate-400 tracking-wide">
                     Operasyonel verileriniz hazır. Bir analiz başlatmak için hazır komutları kullanabilir veya talimat verebilirsiniz.
                  </p>
               </div>
            )}
            
            <div className="space-y-10">
              {messages.map((msg, idx) => {
                const isFirstOfUser = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                const isBot = msg.senderId === 'u-bot' || msg.isBotMessage;
                const sender = isBot ? { name: 'MavriBot', avatar: '', role: 'AI Assistant' } : MOCK_USERS.find(u => u.id === msg.senderId);

                return (
                  <div key={msg.id} className={`group flex gap-6 animate-in slide-in-from-bottom-2 duration-500 ${!isFirstOfUser ? 'mt-[-1.5rem]' : 'mt-8'}`}>
                    {isFirstOfUser ? (
                      isBot ? (
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none mt-1">
                           <Bot size={22} />
                        </div>
                      ) : (
                        <img src={sender?.avatar} className="w-11 h-11 rounded-2xl object-cover shadow-sm mt-1 shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all border border-slate-100 dark:border-white/10" />
                      )
                    ) : (
                      <div className="w-11 shrink-0" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {isFirstOfUser && (
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`font-black text-xs uppercase tracking-tight ${isBot ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                            {sender?.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-40">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      
                      <div className={`relative ${isBot ? '' : 'bg-slate-100/50 dark:bg-slate-900/40 p-5 rounded-[1.5rem] rounded-tl-none border border-slate-200/40 dark:border-white/5 shadow-sm'}`}>
                        <p className={`text-[14px] leading-relaxed whitespace-pre-wrap ${isBot ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-700 dark:text-slate-200 font-semibold'}`}>
                           {msg.content}
                        </p>
                        
                        {msg.botData && <BotMessage data={msg.botData} />}
                        
                        {msg.linkedWorkItemId && (
                          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl">
                            <Zap size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">İş Bağlamı: {msg.linkedWorkItemId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Elegant Scroll To Bottom */}
        {showScrollButton && (
          <button 
            onClick={scrollToBottom}
            className="absolute bottom-44 right-12 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-indigo-600 border border-indigo-100 dark:border-white/10 rounded-full shadow-2xl hover:bg-white dark:hover:bg-slate-700 transition-all z-30 animate-in fade-in slide-in-from-bottom-4 active:scale-90 group"
          >
            <ArrowDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        )}

        {/* Composer Section */}
        <div className="p-10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-3xl border-t border-slate-100 dark:border-white/5 shrink-0 z-30">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            
            {/* Minimal Prompt Chips */}
            {isAssistantMode && messages.length > 0 && (
               <div className="flex items-center gap-3 overflow-x-auto no-scrollbar px-1 animate-in slide-in-from-bottom-2 duration-500">
                  <QuickChip label="Risk Analizi" icon={AlertTriangle} cmd="Kritik riskleri listele." />
                  <QuickChip label="Maliyet Raporu" icon={DollarSign} cmd="Bütçe durumunu özetle." />
                  <QuickChip label="Saha Günlüğü" icon={Activity} cmd="Saha özetini getir." />
               </div>
            )}

            <div className={`relative bg-slate-50 dark:bg-slate-900/60 border-2 transition-all rounded-[2.25rem] p-3 shadow-sm group ${isAssistantMode ? 'focus-within:border-indigo-500/30 focus-within:ring-8 ring-indigo-500/5' : 'focus-within:border-indigo-500/30 border-transparent'}`}>
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={isAssistantMode ? "Analiz isteğinizi buraya yazın..." : "Mesaj gönder..."}
                className="w-full bg-transparent p-5 pr-28 resize-none outline-none text-[15px] font-semibold dark:text-white no-scrollbar placeholder:text-slate-400 dark:placeholder:text-slate-600 min-h-[60px]"
                rows={1}
              />
              <div className="flex items-center justify-between mt-2 px-4 pb-2 border-t border-slate-100 dark:border-white/5 pt-4">
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-400 hover:text-indigo-500 transition-all active:scale-90"><Paperclip size={20} /></button>
                  <button className="p-2 text-slate-400 hover:text-indigo-500 transition-all active:scale-90"><Camera size={20} /></button>
                  <button className="p-2 text-slate-400 hover:text-indigo-500 transition-all active:scale-90"><Mic size={20} /></button>
                </div>
                <button 
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isAnalyzing}
                  className={`p-4 rounded-2xl transition-all active:scale-95 flex items-center gap-3 group ${inputValue.trim() ? 'bg-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.2)] hover:bg-indigo-700' : 'text-slate-300 bg-slate-200 dark:bg-slate-800'}`}
                >
                  {isAnalyzing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-widest ml-1 hidden sm:inline">{isAssistantMode ? 'ANALİZ' : 'GÖNDER'}</span>
                      <Send size={18} className={inputValue.trim() ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform' : ''} />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {isAssistantMode && (
               <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-40 flex items-center justify-center gap-6">
                  <span className="w-10 h-px bg-slate-100 dark:bg-white/5" />
                  GÜVENLİ VERİ BAĞLAMI: {activeProject?.projectCode || 'GENEL'}
                  <span className="w-10 h-px bg-slate-100 dark:bg-white/5" />
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
