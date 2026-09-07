import React from 'react';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const IncidentSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SkeletonLoader height="h-20" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SkeletonLoader height="h-24" />
        <SkeletonLoader height="h-24" />
        <SkeletonLoader height="h-24" />
        <SkeletonLoader height="h-24" />
      </div>
      <SkeletonLoader height="h-80" />
    </div>
  );
};
