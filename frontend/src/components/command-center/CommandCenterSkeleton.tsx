import React from 'react';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const CommandCenterSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SkeletonLoader height="h-20" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SkeletonLoader height="h-28" />
        <SkeletonLoader height="h-28" />
        <SkeletonLoader height="h-28" />
        <SkeletonLoader height="h-28" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonLoader height="h-64" />
        <SkeletonLoader height="h-64" />
      </div>
      <SkeletonLoader height="h-72" />
    </div>
  );
};
