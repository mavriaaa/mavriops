
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Info, Send, Smile, Paperclip, UserPlus, MessageSquare, 
  MoreVertical, Lock, Hash, Reply, CheckCircle, 
  Zap, Calendar, Trash2, Edit3, X, ArrowRight, Bot
} from 'lucide-react';
import { AppContext } from '../../App';
import { MOCK_CHANNELS, MOCK_USERS } from '../../constants';
import { Message, User } from '../../types';
import { ApiService } from '../../services/api';
import { BotService } from '../../services/botService';
import BotMessage from './BotMessage';

const ChatView: React.FC = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeThread, setActiveThread] = useState<Message | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [threadInput, setThreadInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!context) return null;
  const { t, currentUser } = context;

  const activeChannel = MOCK_CHANNELS.find(c => c.id === (channelId || 'c1')) || MOCK_CHANNELS[0];

  useEffect(() => {
    const load = async () => {
      const msgs = await ApiService.fetchMessages(channelId || 'c1');
      setMessages(msgs);
    };
    load();
    
    // Basit bir interval ile botun güncellenmiş mesajlarını (polled) kontrol edebiliriz
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [channelId]);

  useEffect(() => {
    if (activeThread) {
      ApiService.fetchMessages('', activeThread.id).then(setThreadMessages);
    }
  }, [activeThread]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (isThread = false) => {
    const text = isThread ? threadInput : inputValue;
    if (!text.trim()) return;

    const newMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      channelId: isThread ? undefined : (channelId || 'c1'),
      senderId: currentUser.id,
      content: text,
      timestamp: new Date().toISOString(),
      reactions: [],
      parentId: isThread ? activeThread?.id : undefined
    };

    const saved = await ApiService.sendMessage(newMsg);
    if (isThread) {
      setThreadMessages(prev => [...prev, saved]);
      setThreadInput('');
    } else {
      setMessages(prev => [...prev, saved]);
      setInputValue('');
      
      // MENTION TESPİTİ VE BOT TETİKLEME
      if (text.toLowerCase().includes('@mavribot')) {
        BotService.processMention(saved, currentUser);
      }
    }
  };

  const MessageItem: React.FC<{ msg: Message, isCompact?: boolean, onReply?: () => void }> = ({ msg, isCompact, onReply }) => {
    const sender = msg.senderId === 'u-bot' ? { name: 'MavriBot', avatar: '', role: 'AI Assistant' } : MOCK_USERS.find(u => u.id === msg.senderId);
    const isBot = msg.senderId === 'u-bot' || msg.isBotMessage;

    return (
      <div className={`group flex gap-3 px-6 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors relative ${!isCompact ? 'mt-6' : ''}`}>
        {!isCompact ? (
          isBot ? (
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg mt-1">
               <Bot size={20} />
            </div>
          ) : (
            <img src={sender?.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm mt-1 shrink-0" />
          )
        ) : (
          <div className="w-10 text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 flex items-center justify-center pt-2 shrink-0">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {!isCompact && (
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-black text-xs uppercase tracking-tight ${isBot ? 'text-indigo-600 dark:text-indigo-400' : 'dark:text-white'}`}>
                {sender?.name}
                {isBot && <span className="ml-2 text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md">BOT</span>}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          <div className="relative">
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isBot ? 'text-indigo-900/80 dark:text-indigo-200/80 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
               {msg.content}
            </p>
            
            {/* BOT DATA RENDERER */}
            {msg.botData && <BotMessage data={msg.botData} />}

            {msg.linkedWorkItemId && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg">
                <Zap size={12} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 uppercase">İlişkili İş: {msg.linkedWorkItemId}</span>
              </div>
            )}

            {(msg.replyCount || 0) > 0 && !msg.parentId && (
              <button 
                onClick={() => setActiveThread(msg)}
                className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-indigo-500 hover:underline uppercase"
              >
                <Reply size={12} className="rotate-180" />
                {msg.replyCount} Yanıt
              </button>
            )}
          </div>
        </div>

        {/* Message Actions */}
        <div className="absolute right-6 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-10 transition-all scale-95 group-hover:scale-100">
           <button onClick={() => onReply?.()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500" title="Thread Başlat"><Reply size={16} /></button>
           <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><Smile size={16} /></button>
           <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><MoreVertical size={16} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
               <Hash size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg dark:text-white tracking-tight uppercase">{activeChannel.name}</h1>
                {activeChannel.isPrivate && <Lock size={14} className="text-slate-400" />}
              </div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{activeChannel.topic || 'Saha Haberleşme'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                {MOCK_USERS.map(u => (
                  <img key={u.id} src={u.avatar} className="w-8 h-8 rounded-lg border-2 border-white dark:border-slate-800 object-cover shadow-sm" />
                ))}
             </div>
             <button className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-indigo-500 transition-colors"><Info size={20} /></button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-10 no-scrollbar">
          {messages.map((msg, idx) => {
            const isFirstOfUser = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
            return (
              <MessageItem 
                key={msg.id} 
                msg={msg} 
                isCompact={!isFirstOfUser} 
                onReply={() => setActiveThread(msg)}
              />
            );
          })}
        </div>

        {/* Composer */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus-within:border-indigo-500 rounded-[2rem] p-3 transition-all shadow-inner group">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={`@MavriBot veya mesaj gönder: #${activeChannel.name}`}
                className="w-full bg-transparent p-4 pr-24 resize-none outline-none text-sm font-bold min-h-[60px] dark:text-white no-scrollbar"
                rows={1}
              />
              <div className="flex items-center justify-between mt-2 px-2 pb-1">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-indigo-500 rounded-xl transition-all"><Paperclip size={20} /></button>
                  <button className="p-2 text-slate-400 hover:text-indigo-500 rounded-xl transition-all"><Smile size={20} /></button>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
                  <button onClick={() => setInputValue(v => v + ' @MavriBot ')} className="px-3 py-1.5 text-[9px] font-black text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg uppercase tracking-widest flex items-center gap-2"><Bot size={12} /> @MavriBot</button>
                </div>
                <button 
                  onClick={() => handleSend()}
                  className={`p-3 rounded-2xl transition-all active:scale-95 ${inputValue.trim() ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' : 'text-slate-300'}`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thread Drawer */}
      {activeThread && (
        <div className="w-full max-w-md flex flex-col bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 shadow-2xl">
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-slate-900">
            <div>
              <h2 className="font-black dark:text-white uppercase tracking-tight text-sm">Thread Yanıtları</h2>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">#{activeChannel.name}</p>
            </div>
            <button onClick={() => setActiveThread(null)} className="p-2 text-slate-400 hover:text-rose-500"><X size={24} /></button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
              <MessageItem msg={activeThread} />
            </div>
            
            <div className="space-y-4">
              {threadMessages.map((m, idx) => (
                <MessageItem 
                  key={m.id} 
                  msg={m} 
                  isCompact={idx > 0 && threadMessages[idx-1].senderId === m.senderId} 
                />
              ))}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
             <div className="relative bg-slate-100 dark:bg-slate-800 rounded-3xl p-3 border-2 border-transparent focus-within:border-indigo-500">
               <textarea 
                  value={threadInput}
                  onChange={(e) => setThreadInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend(true))}
                  placeholder="Thread'e yanıt ver..."
                  className="w-full bg-transparent p-3 resize-none outline-none text-xs font-bold dark:text-white no-scrollbar"
                  rows={2}
               />
               <div className="flex justify-end mt-1">
                  <button 
                    onClick={() => handleSend(true)}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg active:scale-95 transition-all"
                  >
                    <Send size={16} />
                  </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatView;
