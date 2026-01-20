
import React, { useEffect, useState } from 'react';
import { X, Send, MessageCircle, Bell, Globe } from 'lucide-react';
import { AlertData } from '../types';

const AlertPopup: React.FC = () => {
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await fetch('https://yosintv-api.pages.dev/api/alert.json');
        if (!res.ok) return;
        const data: AlertData = await res.json();
        
        if (data.status !== 'active') return;

        // frequency control
        if (data.show_frequency.once_per_day) {
          const lastShown = localStorage.getItem('last_center_alert_time');
          const now = Date.now();
          const cooldown = (data.show_frequency.cooldown_hours || 24) * 60 * 60 * 1000;
          
          if (lastShown && now - parseInt(lastShown) < cooldown) {
            return;
          }
        }

        setAlert(data);
        setIsVisible(true);
        localStorage.setItem('last_center_alert_time', Date.now().toString());

        // Auto-close handling
        if (data.ui_config.auto_close_seconds > 0) {
          setTimeout(() => {
            setIsVisible(false);
          }, data.ui_config.auto_close_seconds * 1000);
        }
      } catch (err) {
        console.warn('Alert fetch failed');
      }
    };

    fetchAlert();
  }, []);

  if (!alert || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[340px] rounded-[32px] shadow-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800 transform animate-scale-up">
        
        {alert.ui_config.dismissible && (
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full active:scale-90 transition-all z-10"
          >
            <X size={16} />
          </button>
        )}

        <div className="p-6 pt-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-[#1f41bb] dark:text-blue-400 mb-5 shadow-inner">
            <Bell size={32} className="animate-bounce" />
          </div>

          <h3 className="font-sport font-bold text-lg text-slate-900 dark:text-white uppercase tracking-widest mb-2">
            Sports Update
          </h3>
          
          <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 px-4">
            {alert.daily_message}
          </p>

          <div className="w-full space-y-3 mb-2">
            {alert.channels
              .filter(c => c.enabled)
              .sort((a,b) => a.priority - b.priority)
              .map((channel) => (
                <a
                  key={channel.id}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className={`p-2 rounded-xl text-white ${
                      channel.type === 'telegram' ? 'bg-[#229ED9]' : 
                      channel.type === 'whatsapp' ? 'bg-[#25D366]' : 
                      'bg-indigo-500'
                    }`}>
                      {channel.type === 'telegram' ? <Send size={14} /> : 
                       channel.type === 'whatsapp' ? <MessageCircle size={14} /> : 
                       <Globe size={14} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">{channel.title}</span>
                      <span className="text-[8px] text-slate-400 uppercase font-bold">{channel.subtitle}</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-[#1f41bb] dark:text-blue-400 uppercase tracking-widest">{channel.cta_text}</span>
                </a>
              ))
            }
          </div>
        </div>

        {/* Closing Progress Bar */}
        <div 
          className="h-1 bg-[#1f41bb] w-full origin-left animate-timer-shrink" 
          style={{ animationDuration: `${alert.ui_config.auto_close_seconds || 8}s` }} 
        />
      </div>
      
      <style>{`
        @keyframes scaleUp {
          0% { opacity: 0; transform: scale(0.85) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-up {
          animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes timerShrink {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
        .animate-timer-shrink {
          animation: timerShrink linear forwards;
        }
      `}</style>
    </div>
  );
};

export default AlertPopup;
