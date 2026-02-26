import React from 'react';
import { Skeleton, SkeletonCard, SkeletonHeader } from './Skeleton';

/**
 * DetailViewSkeleton - Loading skeleton for detail pages
 * Mimics the layout of DetailViewLayout with sidebar and content area
 */
export const DetailViewSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F1116]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F1116]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-[90%] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20 rounded-xl" />
              <Skeleton className="h-10 w-20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-[90%] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Core Content Card */}
              <div className="bg-[#16181D] rounded-2xl p-6">
                <Skeleton className="h-5 w-24 mb-6" />
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-full max-w-md" />
                  </div>
                  
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-32" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assets Card */}
              <div className="bg-[#16181D] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Linked Context Card */}
              <div className="bg-[#16181D] rounded-2xl p-6">
                <Skeleton className="h-5 w-28 mb-4" />
                
                <div className="py-8 flex flex-col items-center justify-center">
                  <Skeleton className="w-12 h-12 rounded-2xl mb-4" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>

              {/* Details Card */}
              <div className="bg-[#16181D] rounded-2xl p-6">
                <Skeleton className="h-5 w-24 mb-4" />
                
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailViewSkeleton;
