
import React, { useEffect, useState, useCallback } from 'react';
import { Match, StreamData } from '../types';
import { getMatchStreams } from '../services/api';
import { ChevronLeft, MapPin, Calendar, Clock, PlayCircle, Users, User, ShieldCheck } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import InternalBrowser from '../components/InternalBrowser';
import { LOGO_URL } from '../constants';
import AdUnit from '../components/AdUnit';
import { logEvent } from '../components/StatsCounter';

interface MatchDetailsScreenProps {
  match: Match;
  onBack: () => void;
}

const MatchDetailsScreen: React.FC<MatchDetailsScreenProps> = ({ match, onBack }) => {
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [activeBrowser, setActiveBrowser] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getSlug = () => {
      try {
        if (!match.details_url || match.details_url === '#') return 'india';
        const url = new URL(match.details_url);
        return url.searchParams.get('yosintv') || 'india';
      } catch {
        if (match.details_url.includes('yosintv=')) {
          return match.details_url.split('yosintv=')[1];
        }
        return 'india';
      }
    };

    const fetchStreams = async () => {
      try {
        setLoading(true);
        const slug = getSlug();
        const data = await getMatchStreams(slug);
        setStreamData(data);
        setError(null);
      } catch (err: any) {
        console.warn('Streams failed to load:', err.message);
        setStreamData({ events: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, [match]);

  const handleOpenStream = useCallback((url: string, name: string) => {
    // Log the stream access
    logEvent('stream_click', { url, name, match: `${match.team1} vs ${match.team2}` });
    
    // Push state so back button works
    window.history.pushState({ browserOpen: true }, '');
    setActiveBrowser({ url, title: name });
  }, [match]);

  const handleCloseBrowser = useCallback(() => {
    setActiveBrowser(null);
  }, []);

  const formatMatchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isLive = () => {
    const start = new Date(match.start);
    const end = new Date(start.getTime() + (match.duration || 1.5) * 3600000);
    return now >= start && now <= end;
  };

  const isOver = () => {
    const start = new Date(match.start);
    const end = new Date(start.getTime() + (match.duration || 1.5) * 3600000);
    return now > end;
  };

  const getDetailedCountdown = () => {
    const start = new Date(match.start);
    const diff = start.getTime() - now.getTime();
    if (diff <= 0) return null;

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}H ${pad(m)}M ${pad(s)}S`;
  };

  if (loading) return <div className="p-4 bg-white dark:bg-slate-950 min-h-full"><LoadingState /></div>;
  if (error && !match) return <div className="bg-white dark:bg-slate-950 min-h-full"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;

  const parseCssString = (cssStr?: string): React.CSSProperties => {
    if (!cssStr) return {};
    const styles: any = {};
    cssStr.split(';').forEach(rule => {
      const [prop, value] = rule.split(':');
      if (prop && value) {
        const camelProp = prop.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styles[camelProp] = value.trim();
      }
    });
    return styles;
  };

  return (
    <div className="animate-fade-in pb-24 bg-white dark:bg-slate-950 min-h-full relative">
      {activeBrowser && (
        <InternalBrowser 
          url={activeBrowser.url} 
          title={activeBrowser.title} 
          onClose={handleCloseBrowser} 
        />
      )}

      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 px-5 pt-4 pb-10 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-900 dark:text-slate-400 mb-8 active:scale-95 transition-transform">
          <ChevronLeft size={20} />
          <span className="font-sport font-bold text-xs uppercase tracking-widest">Back to Matches</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-xs mb-10">
            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl p-3 mb-3 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                <img src={match.team1_logo} alt={match.team1} className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = LOGO_URL} />
              </div>
              <span className="font-sport font-bold text-sm text-center uppercase tracking-tight line-clamp-2 text-slate-900 dark:text-white transition-colors">{match.team1}</span>
            </div>
            
            <div className="flex flex-col items-center px-4">
              <span className="text-[10px] font-black text-slate-900 dark:text-slate-500 uppercase tracking-widest mb-1 font-sport transition-colors">VS</span>
              {isLive() ? (
                <span className="match-status match-status-live text-[9px]">LIVE</span>
              ) : isOver() ? (
                <span className="match-status match-status-over text-[9px]">Match Over</span>
              ) : (
                <div className="flex flex-col items-center space-y-1">
                  <span className="match-status match-status-countdown text-[9px] min-w-[80px]">{getDetailedCountdown()}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center flex-1">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl p-3 mb-3 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                <img src={match.team2_logo} alt={match.team2} className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = LOGO_URL} />
              </div>
              <span className="font-sport font-bold text-sm text-center uppercase tracking-tight line-clamp-2 text-slate-900 dark:text-white transition-colors">{match.team2}</span>
            </div>
          </div>

          <div className="space-y-4 w-full max-w-sm">
            <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 py-4 px-6 rounded-3xl border border-slate-100 dark:border-slate-700 transition-colors">
              <span className="text-[12px] font-bold text-slate-900 dark:text-slate-200 font-sport tracking-widest uppercase mb-2">{match.league}</span>
              <div className="flex items-center space-x-6 text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Clock size={12} className="text-[#1f41bb] dark:text-blue-400" />
                  <span className="text-[10px] font-bold uppercase">{formatMatchTime(match.start)}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin size={12} className="text-[#1f41bb] dark:text-blue-400" />
                  <span className="text-[10px] font-bold uppercase line-clamp-1">{match.stadium || match.venue || 'Sports Complex'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-8 bg-white dark:bg-slate-950 transition-colors">
        
        {/* Top Ad */}
        <div className="flex justify-center">
          <AdUnit 
            overrideSettings={{
              key: '2611508741',
              width: 300,
              height: 250
            }}
          />
        </div>

        {/* Match Info Section */}
        {(match.referee || match.stadium) && (
          <section className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <h4 className="font-sport font-bold text-[10px] text-slate-900 dark:text-slate-400 tracking-[0.2em] uppercase mb-4 text-center">Match Information</h4>
            <div className="grid grid-cols-2 gap-4">
              {match.stadium && (
                <div className="flex flex-col items-center text-center">
                  <MapPin size={16} className="text-[#1f41bb] dark:text-blue-400 mb-1.5" />
                  <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 font-sport tracking-wider mb-0.5">Stadium</span>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-300 transition-colors">{match.stadium}</span>
                </div>
              )}
              {match.referee && (
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck size={16} className="text-[#1f41bb] dark:text-blue-400 mb-1.5" />
                  <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 font-sport tracking-wider mb-0.5">Referee</span>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-300 transition-colors">{match.referee}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Streaming Section */}
        <section>
          <h4 className="font-sport font-bold text-[10px] text-slate-900 dark:text-slate-400 tracking-[0.2em] uppercase mb-5 text-center">Live Streaming Links</h4>
          <div className="space-y-3">
            {streamData?.events && streamData.events.length > 0 ? streamData.events.map((event, idx) => (
              <React.Fragment key={idx}>
                {event.link && (
                  <button 
                    onClick={() => handleOpenStream(event.link!, event.name)}
                    className="w-full flex items-center px-6 py-5 rounded-2xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                    style={{
                      ...parseCssString(streamData.styles?.livee),
                      backgroundColor: parseCssString(streamData.styles?.livee).backgroundColor || '#1f41bb',
                      color: '#ffffff'
                    }}
                  >
                    <div className="flex-1 text-center font-sport font-bold text-sm tracking-[0.05em]">
                      {event.name}
                    </div>
                    <PlayCircle size={20} className="ml-3 opacity-90" />
                  </button>
                )}
                {event.links && event.links.map((link, lIdx) => (
                  <button 
                    key={lIdx}
                    onClick={() => handleOpenStream(link, `${event.name} Server ${lIdx + 1}`)}
                    className="w-full flex items-center px-6 py-5 rounded-2xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                    style={{
                      ...parseCssString(streamData.styles?.livee),
                      backgroundColor: parseCssString(streamData.styles?.livee).backgroundColor || '#1f41bb',
                      color: '#ffffff'
                    }}
                  >
                    <div className="flex-1 text-center font-sport font-bold text-sm tracking-[0.05em]">
                      {event.name} • SERVER {lIdx + 1}
                    </div>
                    <PlayCircle size={20} className="ml-3 opacity-90" />
                  </button>
                ))}
              </React.Fragment>
            )) : (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800 transition-colors">
                <p className="font-sport font-bold text-[10px] text-slate-400 dark:text-slate-500 tracking-widest uppercase px-4">Streams become active 15-30 minutes before kickoff</p>
              </div>
            )}
          </div>
        </section>

        {/* Ad Specifically after Live Streaming Links ends */}
        <div className="flex justify-center">
          <AdUnit 
            overrideSettings={{
              key: '2611508741',
              width: 300,
              height: 250
            }}
          />
        </div>

        {/* Lineups Section */}
        {(match.home_lineup || match.away_lineup) && (
          <section>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Users size={18} className="text-[#1f41bb] dark:text-blue-400" />
              <h4 className="font-sport font-bold text-[10px] text-slate-900 dark:text-slate-400 tracking-[0.2em] uppercase">Tactical Lineups</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl text-center border-b-2 border-blue-500 transition-colors">
                   <span className="text-[10px] font-sport font-bold text-slate-900 dark:text-slate-300 uppercase truncate block">{match.team1}</span>
                </div>
                <div className="space-y-2">
                  {match.home_lineup?.map((player, pIdx) => (
                    <div key={pIdx} className="flex items-center space-x-2 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-50 dark:border-slate-800 transition-colors">
                      <User size={10} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-slate-900 dark:text-slate-300 truncate">{player}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl text-center border-b-2 border-red-500 transition-colors">
                   <span className="text-[10px] font-sport font-bold text-slate-900 dark:text-slate-300 uppercase truncate block">{match.team2}</span>
                </div>
                <div className="space-y-2">
                  {match.away_lineup?.map((player, pIdx) => (
                    <div key={pIdx} className="flex items-center space-x-2 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-50 dark:border-slate-800 transition-colors">
                      <User size={10} className="text-red-500" />
                      <span className="text-[10px] font-bold text-slate-900 dark:text-slate-300 truncate">{player}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MatchDetailsScreen;
