
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AdUnit from './AdUnit';

interface DismissibleAdProps {
  onClose?: () => void;
  isModal?: boolean;
  autoCloseDuration?: number; // In milliseconds
}

const DismissibleAd: React.FC<DismissibleAdProps> = ({ onClose, isModal = false, autoCloseDuration }) => {
  const [visible, setVisible] = useState(true);
  const [canClose, setCanClose] = useState(!autoCloseDuration);
  const [timeLeft, setTimeLeft] = useState(autoCloseDuration ? Math.ceil(autoCloseDuration / 1000) : 0);

  useEffect(() => {
    if (autoCloseDuration && autoCloseDuration > 0) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, autoCloseDuration);

      const intervalTimer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      // Synchronize close button visibility with the provided duration
      const enableCloseTimer = setTimeout(() => {
        setCanClose(true);
      }, autoCloseDuration);

      return () => {
        clearTimeout(closeTimer);
        clearTimeout(enableCloseTimer);
        clearInterval(intervalTimer);
      };
    }
  }, [autoCloseDuration]);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const adElement = (
    <div className="relative group w-full max-w-[320px] flex flex-col items-center">
      {canClose ? (
        <button 
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-[1001] bg-red-500 text-white rounded-full p-1.5 shadow-xl active:scale-90 transition-all border-2 border-white dark:border-slate-900"
        >
          <X size={16} strokeWidth={3} />
        </button>
      ) : (
        <div className="absolute -top-3 -right-3 z-[1001] bg-slate-800 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-xl border-2 border-white text-[10px] font-bold">
          {timeLeft}
        </div>
      )}
      <AdUnit />
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-3xl shadow-2xl w-full max-w-[360px] flex flex-col items-center">
          {adElement}
          {autoCloseDuration && !canClose && (
            <p className="mt-1 text-[9px] font-sport font-black text-slate-400 uppercase tracking-widest animate-pulse">
              Buffering Stream {timeLeft}s...
            </p>
          )}
        </div>
      </div>
    );
  }

  return adElement;
};

export default DismissibleAd;
