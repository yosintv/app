
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import MatchesScreen from './screens/MatchesScreen';
import HighlightsScreen from './screens/HighlightsScreen';
import NewsScreen from './screens/NewsScreen';
import MatchDetailsScreen from './screens/MatchDetailsScreen';
import UpdateNotifier from './components/UpdateNotifier';
import SplashScreen from './components/SplashScreen';
import DismissibleAd from './components/DismissibleAd';
import AlertPopup from './components/AlertPopup';
import StatsCounter, { logEvent } from './components/StatsCounter';
import { AppScreen, Match } from './types';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.Matches);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [isMatchForcedAd, setIsMatchForcedAd] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const triggerInterstitial = useCallback(() => {
    const lastAdTime = localStorage.getItem('last_interstitial_time');
    const now = Date.now();
    const oneMinute = 60 * 1000;

    if (!lastAdTime || now - parseInt(lastAdTime) >= oneMinute) {
      if (Math.random() < 0.4) {
        setShowInterstitial(true);
        setIsMatchForcedAd(false);
        localStorage.setItem('last_interstitial_time', now.toString());
        logEvent('interstitial_ad_shown', { type: 'periodic' });
      }
    }
  }, []);

  const handleScreenChange = (screen: AppScreen) => {
    if (screen !== AppScreen.MatchDetails) {
      triggerInterstitial();
    }
    setActiveScreen(screen);
    logEvent('screen_view', { screen });
  };

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    logEvent('app_refresh');
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const handleSelectMatch = (match: Match) => {
    // ALWAYS show ads pop up for 5 seconds when clicked to match card
    setSelectedMatch(match);
    setIsMatchForcedAd(true);
    setShowInterstitial(true);
    
    // Log detailed match engagement statistics
    logEvent('match_card_click', {
      team1: match.team1,
      team2: match.team2,
      league: match.league,
      sport: match.sport,
      ad_forced: true
    });
  };

  const handleInterstitialClose = () => {
    setShowInterstitial(false);
    if (isMatchForcedAd && selectedMatch) {
      setActiveScreen(AppScreen.MatchDetails);
    }
    setIsMatchForcedAd(false);
  };

  const handleBackFromDetails = () => {
    setSelectedMatch(null);
    setActiveScreen(AppScreen.Matches);
  };

  const renderScreen = () => {
    if (activeScreen === AppScreen.MatchDetails && selectedMatch) {
      return <MatchDetailsScreen match={selectedMatch} onBack={handleBackFromDetails} />;
    }

    switch (activeScreen) {
      case AppScreen.Matches:
        return <MatchesScreen key={refreshKey} onSelectMatch={handleSelectMatch} />;
      case AppScreen.Highlights:
        return <HighlightsScreen key={refreshKey} />;
      case AppScreen.News:
        return <NewsScreen key={refreshKey} />;
      default:
        return <MatchesScreen key={refreshKey} onSelectMatch={handleSelectMatch} />;
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      {/* StatsCounter is now aware of the active screen for full site tracking */}
      <StatsCounter activeScreen={activeScreen} />
      
      <Layout 
        activeScreen={activeScreen === AppScreen.MatchDetails ? AppScreen.Matches : activeScreen} 
        setScreen={handleScreenChange}
        title=""
        onRefresh={handleGlobalRefresh}
        isRefreshing={isRefreshing}
      >
        <div className="animate-fade-in h-full" key={activeScreen + (selectedMatch?.team1 || '')}>
          {renderScreen()}
        </div>
        <UpdateNotifier />
      </Layout>

      <AlertPopup />

      {showInterstitial && (
        <DismissibleAd 
          isModal 
          onClose={handleInterstitialClose} 
          autoCloseDuration={isMatchForcedAd ? 5000 : undefined} 
        />
      )}
    </>
  );
};

export default App;
