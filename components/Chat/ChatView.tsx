
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Info, 
  Send, 
  Smile, 
  Paperclip, 
  UserPlus, 
  MessageSquare, 
  MoreVertical,
  ArrowRight,
  Lock
} from 'lucide-react';
import { AppContext } from '../../App';
import { MOCK_CHANNELS, MOCK_USERS } from '../../constants';
import { Message } from '../../types';
import { ApiService } from '../../services/api';

const ChatView: React.FC = () => {
  const { channelId } = useParams();
  const context = useContext(AppContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!context) return null;
  const { t } = context;

  const channel = MOCK_CHANNELS.find(c => c.id === channelId) || MOCK_CHANNELS[0];

  useEffect(() => {
    const load = async () => {
      const msgs = await ApiService.fetchMessages(channelId || 'c1');
      setMessages(msgs);
    };
    load();
  }, [channelId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !context) return;
    
    const newMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      channelId: channelId,
      senderId: context.currentUser.id,
      content: inputValue,
      timestamp: new Date().toISOString(),
      reactions: {},
    };

    const saved = await ApiService.sendMessage(newMsg);
    setMessages(prev => [...prev, saved]);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
              #{channel.name}
            </span>
            {channel.isPrivate && <Lock size={12} className="text-slate-400" />}
          </div>
          <p className="text-[10px] text-slate-500 truncate max-w-[300px]">{channel.topic || t('noTopic')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded hover:bg-indigo-100 transition-colors">
            <UserPlus size={14} /> {t('addMember')}
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Info size={20} /></button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 grayscale">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-lg font-bold">#{channel.name}</h3>
          </div>
        )}

        {messages.map((msg, idx) => {
          const sender = MOCK_USERS.find(u => u.id === msg.senderId);
          const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

          return (
            <div key={msg.id} className={`group flex gap-3 ${showAvatar ? 'mt-4' : '-mt-4'}`}>
              <div className="w-10 shrink-0">
                {showAvatar && <img src={sender?.avatar} className="w-10 h-10 rounded-lg object-cover shadow-sm" />}
              </div>
              <div className="flex-1 min-w-0">
                {showAvatar && (
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm dark:text-white">{sender?.name}</span>
                    <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                <div className="relative group">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="relative border-2 border-slate-200 dark:border-slate-800 rounded-xl focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-all overflow-hidden bg-slate-50 dark:bg-slate-950">
          <textarea 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`${t('messagePlaceholder')}${channel.name}`}
            className="w-full bg-transparent p-3 pr-24 resize-none outline-none text-sm min-h-[44px] max-h-[200px]"
            rows={1}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Paperclip size={18} />
            </button>
            <button 
              onClick={handleSend}
              className={`p-2 rounded-lg transition-all ${inputValue.trim() ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 cursor-not-allowed'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="text-[10px] text-slate-400 font-medium"><b>{t('markdownSupported')}</b></span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            {t('pressEnter')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
