
import React, { useEffect } from 'react';
import { AppScreen } from '../types';

interface StatsCounterProps {
  activeScreen?: AppScreen;
}

/**
 * StatsCounter Component
 * Specifically handles the Whos.Amung.Us live visitor tracking script.
 * Designed to work across all "pages" in the SPA.
 */
const StatsCounter: React.FC<StatsCounterProps> = ({ activeScreen }) => {
  useEffect(() => {
    // 1. Initial Script Setup
    // @ts-ignore - _wau is an external global variable
    window._wau = window._wau || [];
    
    // Check if script is already added to prevent duplicates
    if (!document.getElementById('wau_script_loader')) {
      // @ts-ignore
      window._wau.push(["dynamic", "t2y12ylvwt", "71c", "c4302bffffff", "small"]);

      const script = document.createElement('script');
      script.src = "//waust.at/d.js";
      script.async = true;
      script.id = "wau_script_loader";
      document.body.appendChild(script);
    }

    // 2. Track Screen Changes
    // When the activeScreen changes, we log it. 
    // Most live counters like WAU track the open connection, 
    // but this ensures the component reacts to the state.
    if (activeScreen) {
      logEvent('page_view', { screen: activeScreen });
    }

  }, [activeScreen]); // Re-run effect when screen changes

  // The user's script tag has an id="_wau71c". 
  // We provide a hidden div with this ID to ensure the script finds its target.
  return (
    <div id="_wau71c" style={{ display: 'none', visibility: 'hidden' }} aria-hidden="true" />
  );
};

/**
 * Utility to log events to the debug console for verification
 */
export const logEvent = (eventName: string, params: Record<string, any> = {}) => {
  console.debug(`[Analytics] ${eventName}:`, params);
};

export default StatsCounter;
