
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Send, MessageCircle, ChevronRight, Home, Video, Newspaper, RefreshCw, Moon, Sun, ArrowUpCircle } from 'lucide-react';
import { AppScreen } from '../types';
import { LOGO_URL, TELEGRAM_URL, WHATSAPP_URL, APP_VERSION, VERSION_CHECK_URL } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

interface UpdateEntry {
  version: string;
  latest: boolean;
  url: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeScreen, setScreen, onRefresh, isRefreshing }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [updateUrl, setUpdateUrl] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const startY = useRef(0);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkSidebarUpdate = async () => {
      try {
        const response = await fetch(VERSION_CHECK_URL);
        if (response.ok) {
          const data: UpdateEntry[] = await response.json();
          const latestEntry = data.find(item => item.latest === true);
          if (latestEntry && latestEntry.version !== APP_VERSION) {
            setUpdateUrl(latestEntry.url);
          }
        }
      } catch (err) {
        console.warn('Sidebar update check failed');
      }
    };
    checkSidebarUpdate();
  }, []);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const navItems = [
    { id: AppScreen.Matches, icon: Home, label: 'Matches' },
    { id: AppScreen.Highlights, icon: Video, label: 'Highlights' },
    { id: AppScreen.News, icon: Newspaper, label: 'News' },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mainRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].pageY;
    } else {
      startY.current = -1;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === -1 || isRefreshing || isDrawerOpen) return;
    const y = e.touches[0].pageY;
    const diff = y - startY.current;
    if (diff > 0) {
      setPullProgress(Math.min(diff / 2.5, 70));
    }
  };

  const handleTouchEnd = () => {
    if (pullProgress >= 65 && onRefresh) {
      onRefresh();
    }
    setPullProgress(0);
    startY.current = -1;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-950 max-w-md mx-auto relative shadow-2xl transition-colors duration-300">
      <header className="sticky top-0 z-[100] bg-[#1f41bb] dark:bg-blue-900 text-white px-5 py-4 flex items-center justify-between shadow-xl safe-area-top">
        <button 
          onClick={toggleDrawer} 
          className="p-2 -ml-2 active:scale-90 transition-transform cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex-1" />

        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 active:scale-90 transition-transform text-white/80 cursor-pointer"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={onRefresh} 
            className={`p-2 active:scale-90 transition-transform text-white/80 cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/40 z-[110] transition-opacity duration-300 backdrop-blur-[2px] cursor-pointer" 
          onClick={toggleDrawer} 
        />
      )}

      {/* Responsive Sidebar */}
      <aside className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white dark:bg-slate-900 z-[120] transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col`}>
        <div className="p-8 flex flex-col items-center safe-area-top border-b border-slate-100 dark:border-slate-800">
          <img 
            src={LOGO_URL} 
            alt="YoSinTV" 
            className="w-full max-w-[180px] h-auto object-contain"
            onError={(e) => (e.currentTarget.src = 'https://web.cricfoot.net/logo.png')}
          />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <div className="px-6 py-2 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setScreen(item.id); setIsDrawerOpen(false); }}
              className={`w-full flex items-center px-6 py-4 space-x-4 transition-all cursor-pointer ${activeScreen === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1f41bb] dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 active:bg-slate-50'}`}
            >
              <item.icon size={18} strokeWidth={activeScreen === item.id ? 2.5 : 2} />
              <span className="font-bold text-xs uppercase font-sport tracking-widest">{item.label}</span>
              {activeScreen === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1f41bb] dark:bg-blue-400" />}
            </button>
          ))}

          {updateUrl && (
            <div className="mt-4 px-4">
              <a 
                href={updateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-4 py-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/50 transition-all active:scale-[0.98]"
              >
                <div className="bg-gradient-to-br from-orange-400 to-red-500 p-2 rounded-xl text-white">
                  <ArrowUpCircle size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-sport font-black text-[10px] text-orange-600 dark:text-orange-400 tracking-widest uppercase">Update App</span>
                  <span className="text-[8px] text-orange-400 font-bold uppercase">Latest Version Ready</span>
                </div>
              </a>
            </div>
          )}

          <div className="mx-6 border-t border-slate-50 dark:border-slate-800 my-4" />

          <div className="px-6 py-2 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Community</div>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center px-6 py-3 space-x-4 text-slate-600 dark:text-slate-400 active:bg-blue-50 cursor-pointer">
            <Send size={16} className="text-blue-500" />
            <span className="font-bold text-[11px] uppercase font-sport">Telegram</span>
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center px-6 py-3 space-x-4 text-slate-600 dark:text-slate-400 active:bg-green-50 cursor-pointer">
            <MessageCircle size={16} className="text-green-500" />
            <span className="font-bold text-[11px] uppercase font-sport">WhatsApp</span>
          </a>
        </nav>

        <div className="p-6 text-center text-[7px] text-slate-300 dark:text-slate-700 border-t border-slate-50 dark:border-slate-800 uppercase tracking-[0.3em] font-black">
          YoSinTV Sports Network
        </div>
      </aside>

      <main 
        ref={mainRef} 
        className="flex-1 overflow-y-auto no-scrollbar relative bg-white dark:bg-slate-950 flex flex-col" 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="overflow-hidden flex justify-center items-center transition-all duration-200" 
          style={{ height: isRefreshing ? '50px' : `${pullProgress}px`, opacity: pullProgress / 70 }}
        >
          <RefreshCw 
            size={18} 
            className={`text-[#1f41bb] dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ transform: `rotate(${pullProgress * 5}deg)` }} 
          />
        </div>
        <div className="flex-1">{children}</div>
      </main>

      <nav className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around py-2 safe-area-bottom shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.03)] z-40">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => { setScreen(item.id); setIsDrawerOpen(false); }} className={`flex flex-col items-center space-y-1 transition-all flex-1 py-1 active:scale-90 cursor-pointer ${activeScreen === item.id ? 'text-[#1f41bb] dark:text-blue-400' : 'text-slate-300 dark:text-slate-700'}`}>
            <item.icon size={20} strokeWidth={activeScreen === item.id ? 2.5 : 2} />
            <span className="text-[8px] font-bold uppercase font-sport tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
