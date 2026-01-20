
import React, { useEffect, useState } from 'react';
import { APP_VERSION, VERSION_CHECK_URL } from '../constants';
import { Download, X, Info } from 'lucide-react';

interface UpdateEntry {
  version: string;
  latest: boolean;
  message: string;
  url: string;
}

const UpdateNotifier: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // 1. Check if we have shown the alert in the last hour
        const lastCheck = localStorage.getItem('last_update_popup_time');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (lastCheck && now - parseInt(lastCheck) < oneHour) {
          return; // Don't show if it's been less than an hour
        }

        // 2. Fetch the version list
        const response = await fetch(VERSION_CHECK_URL);
        if (response.ok) {
          const data: UpdateEntry[] = await response.json();
          
          // 3. Find the entry marked as latest
          const latestEntry = data.find(item => item.latest === true);

          if (latestEntry && latestEntry.version !== APP_VERSION) {
            setUpdateInfo(latestEntry);
            
            // Show the popup
            setIsVisible(true);
            
            // Record the time it was shown
            localStorage.setItem('last_update_popup_time', now.toString());

            // 4. Auto-dismiss after 30 seconds
            setTimeout(() => {
              setIsVisible(false);
            }, 30000);
          }
        }
      } catch (err) {
        console.warn('Update check failed:', err);
      }
    };

    // Initial check on mount
    checkVersion();

    // Check every 5 minutes while app is open to see if an hour has passed
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!updateInfo || !isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-slide-up">
      <div className="bg-[#1f41bb] dark:bg-blue-900 text-white p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden relative">
        {/* Progress bar hint for 30s auto-hide */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-shrink-width" />
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-[#1f41bb] p-2 rounded-2xl shadow-lg">
              <Download size={20} strokeWidth={3} />
            </div>
            <div>
              <h4 className="font-sport font-bold text-sm tracking-widest uppercase">Update Available</h4>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-tighter">New Version {updateInfo.version}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/5">
          <div className="flex items-start space-x-2">
            <Info size={14} className="mt-0.5 text-blue-300 flex-shrink-0" />
            <p className="text-[11px] text-blue-50 font-medium leading-relaxed">
              {updateInfo.message}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <a 
            href={updateInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white text-[#1f41bb] py-3 rounded-2xl text-center font-sport font-bold text-xs tracking-[0.15em] shadow-xl active:scale-[0.97] transition-all"
          >
            Download Now
          </a>
          <button 
            onClick={() => setIsVisible(false)}
            className="px-6 py-3 rounded-2xl text-white/70 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            Later
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(100px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shrinkWidth {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .animate-shrink-width {
          animation: shrinkWidth 30s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default UpdateNotifier;
