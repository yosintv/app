
import React, { useEffect, useState } from 'react';
import { getHighlights } from '../services/api';
import { Highlight, AppScreen } from '../types';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Play, Calendar, ExternalLink, Share2 } from 'lucide-react';
import AdUnit from '../components/AdUnit';

const HighlightCard: React.FC<{ highlight: Highlight }> = ({ highlight }) => {
  const videoId = highlight.link.includes('v=') 
    ? highlight.link.split('v=')[1]?.split('&')[0]
    : highlight.link.split('/').pop();
  
  const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : `https://picsum.photos/seed/${highlight.id}/800/450`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden mb-6 shadow-sm border border-slate-100 dark:border-slate-800 group animate-fade-in active:scale-[0.98] transition-transform ripple">
      <div className="relative aspect-video bg-gray-900 overflow-hidden">
        <img 
          src={thumb} 
          alt={`${highlight.team1} vs ${highlight.team2}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <a 
            href={highlight.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-16 h-16 bg-[#1f41bb]/95 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-2xl transition-all scale-90 group-hover:scale-110 active:scale-75 ring-4 ring-white/20"
          >
            <Play size={28} fill="white" />
          </a>
        </div>
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#1f41bb] dark:text-blue-400 text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg border border-white/50 dark:border-slate-700 uppercase tracking-widest font-sport">
          {highlight.category}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-none tracking-tighter uppercase font-sport">
            {highlight.team1} <span className="text-slate-200 dark:text-slate-700">/</span> {highlight.team2}
          </h3>
          <button className="text-slate-300 dark:text-slate-600 hover:text-[#1f41bb] active:scale-90 transition-all p-1">
            <Share2 size={18} />
          </button>
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest border-t border-slate-50 dark:border-slate-800 pt-4">
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
            <Calendar size={12} className="text-[#1f41bb] opacity-70" />
            <span className="font-sport">{highlight.date}</span>
          </div>
          <a 
            href={highlight.link} 
            target="_blank" 
            className="text-[#1f41bb] dark:text-blue-400 flex items-center space-x-1 hover:underline font-sport"
          >
            <span>YouTube</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

const HighlightsScreen: React.FC = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHighlights();
      setHighlights(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !refreshing) return <LoadingState type={AppScreen.Highlights} />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="p-4 bg-white dark:bg-slate-950 flex flex-col min-h-full">
      <div className="mb-6 mt-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase leading-none font-sport">Prime Clips</h2>
        <div className="h-1 w-12 bg-[#1f41bb] mt-2 rounded-full" />
      </div>

      <div className="space-y-2">
        {highlights.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border-2 border-dashed border-slate-100 dark:border-slate-800 animate-fade-in">
            <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase font-sport">No Visuals Found</p>
          </div>
        ) : (
          highlights.map((h, index) => (
            <React.Fragment key={h.id}>
              <HighlightCard highlight={h} />
              {/* Ad placement after every 2 highlights */}
              {(index + 1) % 2 === 0 && <AdUnit className="mb-8" />}
            </React.Fragment>
          ))
        )}
      </div>
      <div className="h-10" />
    </div>
  );
};

export default HighlightsScreen;
