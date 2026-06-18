import React from 'react';

export default function SkeletonLoader({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col h-[380px]">
          <div className="h-48 bg-gray-200 w-full"></div>
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-5 bg-gray-200 rounded w-full"></div>
              <div className="h-5 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-brand-outline-variant pt-3">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-200 rounded w-6"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
