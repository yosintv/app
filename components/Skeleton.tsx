
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

export const MatchSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 mb-5 border border-gray-100 space-y-4 shadow-sm">
    <div className="flex justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex flex-col items-center space-y-2 flex-1">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-6 w-8 mx-4" />
      <div className="flex flex-col items-center space-y-2 flex-1">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
    <div className="pt-4 border-t border-gray-50 flex justify-between">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export const HighlightSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100">
    <Skeleton className="aspect-video w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

export const NewsSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden mb-5 shadow-sm border border-gray-100">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);
