import React from 'react';

export const OperationsSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-48" />
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  </div>
);

export const OperationsEmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <span className="text-2xl">🔧</span>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Operations Unavailable</h3>
    <p className="text-sm text-gray-500 max-w-sm">
      Operations data could not be loaded. Check that your account has ADMIN privileges and the server is running.
    </p>
  </div>
);
