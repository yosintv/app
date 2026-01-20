
import React, { useEffect, useRef } from 'react';

/**
 * AdUnitProps: Interface for the AdUnit component.
 */
interface AdUnitProps {
  className?: string;
  overrideSettings?: {
    key?: string;
    width?: number;
    height?: number;
  };
}

const AdUnit: React.FC<AdUnitProps> = ({ className = "", overrideSettings }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const adInited = useRef(false);

  useEffect(() => {
    const initAd = () => {
      if (adInited.current) return;
      
      const width = containerRef.current?.offsetWidth || 0;
      if (width > 0) {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adInited.current = true;
        } catch (e) {
          console.error('AdSense push error:', e);
        }
      }
    };

    const timer = setTimeout(() => {
      initAd();
      if (!adInited.current) {
        const retryTimer = setInterval(() => {
          if (containerRef.current?.offsetWidth && containerRef.current.offsetWidth > 0) {
            initAd();
            clearInterval(retryTimer);
          }
        }, 500);
        return () => clearInterval(retryTimer);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const width = overrideSettings?.width || 300;
  const height = overrideSettings?.height || 250;
  const adSlot = overrideSettings?.key || "2611508741";

  return (
    <div 
      ref={containerRef}
      className={`my-0.5 mx-auto w-full flex flex-col items-center animate-fade-in ${className}`}
      style={{ minHeight: `${height + 5}px` }}
    >
      <span className="text-[5px] font-black text-slate-200 dark:text-slate-800 tracking-[0.4em] uppercase mb-0.5">
        SPONSORED
      </span>
      <div 
        className="overflow-hidden bg-transparent rounded-sm flex justify-center items-center"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <ins 
          className="adsbygoogle"
          style={{ display: 'inline-block', width: `${width}px`, height: `${height}px` }}
          data-ad-client="ca-pub-5525538810839147"
          data-ad-slot={adSlot}
        />
      </div>
    </div>
  );
};

export default AdUnit;
