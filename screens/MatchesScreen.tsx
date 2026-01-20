
import React, { useEffect, useState, useMemo } from 'react';
import { getMatches } from '../services/api';
import { Match, AppScreen } from '../types';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import AdUnit from '../components/AdUnit';

interface MatchCardProps {
  match: Match;
  onSelect: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const startTime = new Date(match.start);
  const endTime = new Date(startTime.getTime() + (match.duration || 1.5) * 3600000);
  
  const isLive = now >= startTime && now <= endTime;
  const isEnded = now > endTime;

  const getCountdownText = () => {
    const diff = startTime.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    if (h > 0) return `${pad(h)}H ${pad(m)}M ${pad(s)}S`;
    return `${pad(m)}M ${pad(s)}S`;
  };

  const formatMatchTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div 
      onClick={() => onSelect(match)} 
      className={`match-card animate-fade-in cursor-pointer relative group ${isEnded ? 'match-card-ended' : ''}`}
    >
      <div className="match-card-content">
        <div className="match-row-teams">
          {/* Home Team */}
          <div className="match-team">
            <img 
              src={match.team1_logo} 
              alt={match.team1} 
              onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${match.team1}&background=random`)}
            />
            <span className="match-team-name">{match.team1}</span>
          </div>

          {/* Match Center */}
          <div className="match-center">
            {isLive ? (
              <>
                <span className="match-status match-status-live">Live</span>
                <span className="match-local-time">{formatMatchTime(startTime)}</span>
              </>
            ) : isEnded ? (
              <>
                <span className="match-status match-status-over">Ended</span>
                <span className="match-local-time">{formatMatchTime(startTime)}</span>
              </>
            ) : (
              <>
                <span className="match-status match-status-countdown text-[8px] min-w-[85px]">{getCountdownText()}</span>
                <span className="match-local-time">{formatMatchTime(startTime)}</span>
              </>
            )}
          </div>

          {/* Away Team */}
          <div className="match-team">
            <img 
              src={match.team2_logo} 
              alt={match.team2} 
              onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${match.team2}&background=random`)}
            />
            <span className="match-team-name">{match.team2}</span>
          </div>
        </div>

        <div className="match-league-bar">
          <p className="line-clamp-1">{match.league}</p>
        </div>
      </div>
    </div>
  );
};

interface MatchesScreenProps {
  onSelectMatch: (match: Match) => void;
}

const MatchesScreen: React.FC<MatchesScreenProps> = ({ onSelectMatch }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sportFilter, setSportFilter] = useState<'All' | 'Cricket' | 'Football'>('All');
  const [leagueFilter, setLeagueFilter] = useState<string>('All Leagues');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMatches();
      setMatches(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle sport change: Reset league filter
  const handleSportChange = (sport: 'All' | 'Cricket' | 'Football') => {
    setSportFilter(sport);
    setLeagueFilter('All Leagues');
  };

  // Derive unique leagues based on current sport selection
  const availableLeagues = useMemo(() => {
    const relevantMatches = sportFilter === 'All' 
      ? matches 
      : matches.filter(m => m.sport === sportFilter);
    
    const leagues = Array.from(new Set(relevantMatches.map(m => m.league))).sort();
    return ['All Leagues', ...leagues];
  }, [matches, sportFilter]);

  const filteredMatches = useMemo(() => {
    let list = [...matches];
    
    // 1. Filter by Sport
    if (sportFilter !== 'All') {
      list = list.filter(m => m.sport === sportFilter);
    }

    // 2. Filter by League
    if (leagueFilter !== 'All Leagues') {
      list = list.filter(m => m.league === leagueFilter);
    }

    const now = new Date();

    // 3. Sort: Live > Upcoming > Ended
    return list.sort((a, b) => {
      const startA = new Date(a.start);
      const endA = new Date(startA.getTime() + (a.duration || 1.5) * 3600000);
      const startB = new Date(b.start);
      const endB = new Date(startB.getTime() + (b.duration || 1.5) * 3600000);

      const isLiveA = now >= startA && now <= endA;
      const isLiveB = now >= startB && now <= endB;
      const isEndedA = now > endA;
      const isEndedB = now > endB;

      // Priority 1: Live matches first
      if (isLiveA && !isLiveB) return -1;
      if (!isLiveA && isLiveB) return 1;

      // If both live, sort by start time (newest first)
      if (isLiveA && isLiveB) return startB.getTime() - startA.getTime();

      // Priority 2: Upcoming matches vs Ended
      if (!isEndedA && isEndedB) return -1;
      if (isEndedA && !isEndedB) return 1;

      // Both upcoming? Sort by start time (soonest first)
      if (!isEndedA && !isEndedB) return startA.getTime() - startB.getTime();

      // Both ended? Sort by start time (most recently ended first)
      return startB.getTime() - startA.getTime();
    });
  }, [matches, sportFilter, leagueFilter]);

  if (loading) return <LoadingState type={AppScreen.Matches} />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="p-4 bg-white dark:bg-slate-950 min-h-full">
      {/* Tier 1: Sport Selection */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        {(['All', 'Cricket', 'Football'] as const).map((sport) => (
          <button
            key={sport}
            onClick={() => handleSportChange(sport)}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-sport font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${
              sportFilter === sport 
                ? 'bg-[#1f41bb] text-white border-[#1f41bb]' 
                : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* Tier 2: Horizontal League Menu (Small Buttons) */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto no-scrollbar pb-2">
        {availableLeagues.map((league) => (
          <button
            key={league}
            onClick={() => setLeagueFilter(league)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-tight transition-all active:scale-95 border ${
              leagueFilter === league
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
            }`}
          >
            {league}
          </button>
        ))}
      </div>

      {/* NEW AD PLACEMENT: Below League Menu */}
      <AdUnit className="mb-8" />

      {/* Match List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border-2 border-dashed border-slate-100 dark:border-slate-700 animate-fade-in">
            <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase font-sport">No matches found for this selection</p>
          </div>
        ) : (
          filteredMatches.map((match, index) => (
            <React.Fragment key={`${match.team1}-${match.team2}-${index}`}>
              <MatchCard match={match} onSelect={onSelectMatch} />
              {/* Inject responsive ad unit after every 3 matches */}
              {(index + 1) % 3 === 0 && <AdUnit />}
            </React.Fragment>
          ))
        )}
      </div>
      <div className="h-10" />
    </div>
  );
};

export default MatchesScreen;
