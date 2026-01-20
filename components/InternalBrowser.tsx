
import React, { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw, ExternalLink, ShieldCheck, X } from 'lucide-react';

interface InternalBrowserProps {
  url: string;
  title: string;
  onClose: () => void;
}

const InternalBrowser: React.FC<InternalBrowserProps> = ({ url, title, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Handle history back button
  useEffect(() => {
    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col animate-fade-in">
      {/* Browser Header */}
      <header className="bg-[#1f41bb] dark:bg-blue-900 text-white px-4 py-3 flex items-center justify-between shadow-lg safe-area-top">
        <div className="flex items-center space-x-3 overflow-hidden">
          <button 
            onClick={() => window.history.back()} 
            className="p-2 -ml-2 active:scale-90 transition-transform"
            aria-label="Back"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col overflow-hidden">
            <h2 className="font-sport font-bold text-xs uppercase tracking-widest truncate">{title}</h2>
            <div className="flex items-center space-x-1 text-[8px] text-blue-200 font-bold uppercase tracking-tighter">
              <ShieldCheck size={10} className="text-green-400" />
              <span className="truncate max-w-[150px]">{url}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => window.open(url, '_blank')}
            className="p-2 text-white/70 hover:text-white transition-colors"
            title="Open in Chrome/Safari"
          >
            <ExternalLink size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      {isLoading && (
        <div className="h-1 bg-blue-100 dark:bg-blue-900/30 w-full overflow-hidden">
          <div className="h-full bg-white dark:bg-blue-400 animate-loading-bar" />
        </div>
      )}

      {/* WebView (Iframe) */}
      <div className="flex-1 relative">
        <iframe
          src={url}
          className="w-full h-full border-none"
          onLoad={() => setIsLoading(false)}
          allow="autoplay; fullscreen; picture-in-picture"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-presentation"
          title="Match Stream"
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-950 space-y-4">
            <RefreshCw size={32} className="text-[#1f41bb] dark:text-blue-400 animate-spin" />
            <span className="text-[10px] font-sport font-black text-slate-300 uppercase tracking-[0.3em]">Connecting to Server...</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default InternalBrowser;
