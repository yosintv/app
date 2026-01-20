
import React from 'react';
import { MatchSkeleton, HighlightSkeleton, NewsSkeleton } from './Skeleton';
import { AppScreen } from '../types';

interface LoadingStateProps {
  type?: AppScreen;
}

const LoadingState: React.FC<LoadingStateProps> = ({ type = AppScreen.Matches }) => {
  return (
    <div className="p-4 space-y-2 overflow-hidden">
      {type === AppScreen.Matches && Array.from({ length: 4 }).map((_, i) => <MatchSkeleton key={i} />)}
      {type === AppScreen.Highlights && Array.from({ length: 3 }).map((_, i) => <HighlightSkeleton key={i} />)}
      {type === AppScreen.News && Array.from({ length: 3 }).map((_, i) => <NewsSkeleton key={i} />)}
    </div>
  );
};

export default LoadingState;
