"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonBar() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4" aria-label="Loading...">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-36" />

      {/* Stats */}
      <div className="flex gap-6">
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-4">
        <Skeleton className="h-3 w-40 mb-3" />
        <div className="space-y-3">
          <SkeletonBar />
          <SkeletonBar />
          <SkeletonBar />
          <SkeletonBar />
          <SkeletonBar />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6" aria-label="Loading...">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
