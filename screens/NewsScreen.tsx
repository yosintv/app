
import React, { useEffect, useState } from 'react';
import { getNews } from '../services/api';
import { NewsArticle, AppScreen } from '../types';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Share2, Clock, Newspaper, Send, MessageCircle } from 'lucide-react';
import { TELEGRAM_URL, WHATSAPP_URL } from '../constants';

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden mb-5 shadow-sm border border-slate-100 dark:border-slate-700 group animate-fade-in active:scale-[0.99] transition-transform">
      <div className="relative h-44 overflow-hidden bg-slate-50">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/${article.id}/800/600`)}
        />
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-full text-[#1f41bb] dark:text-blue-400 shadow-md border border-white/50 dark:border-slate-700">
          <Share2 size={14} />
        </div>
        <div className="absolute bottom-2 left-3">
           <span className="bg-[#1f41bb] text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-lg font-sport">
             {article.source}
           </span>
        </div>
      </div>
      
      <div className="p-4 space-y-1.5">
        <div className="flex items-center space-x-2 text-[8px] font-bold uppercase text-slate-400 tracking-wider font-sport">
          <Clock size={10} className="text-[#1f41bb]" />
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight tracking-tight group-hover:text-[#1f41bb] transition-colors line-clamp-2 uppercase font-sport">
          {article.title}
        </h3>
        
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
          {article.summary}
        </p>
      </div>
    </div>
  );
};

const NewsScreen: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNews();
      setArticles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState type={AppScreen.News} />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="p-4 bg-white dark:bg-slate-950 min-h-full">
      <div className="max-w-[500px] mx-auto">
        {/* Join Buttons Area */}
        <div className="flex items-center justify-end space-x-2 mb-6">
          <a 
            href={TELEGRAM_URL} 
            target="_blank" 
            className="flex items-center space-x-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-sport text-[10px] font-bold shadow-sm active:scale-95 transition-transform"
          >
            <Send size={12} fill="currentColor" />
            <span>JOIN TELEGRAM</span>
          </a>
          <a 
            href={WHATSAPP_URL} 
            target="_blank" 
            className="flex items-center space-x-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg font-sport text-[10px] font-bold shadow-sm active:scale-95 transition-transform"
          >
            <MessageCircle size={12} fill="currentColor" />
            <span>JOIN WHATSAPP</span>
          </a>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl text-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-700">
            <Newspaper size={32} className="mx-auto text-slate-200" />
            <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase font-sport">No stories found</p>
          </div>
        ) : (
          articles.map((article) => <NewsCard key={article.id} article={article} />)
        )}
      </div>
      
      <div className="h-10" />
    </div>
  );
};

export default NewsScreen;
