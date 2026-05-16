import React from 'react'

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}
      {...props}
    />
  )
}

export const VerseSkeleton = () => {
  return (
    <div className="space-y-3 py-3 border-t border-slate-100 dark:border-slate-800/50 first:border-0">
      <div className="flex items-start gap-2">
        <Skeleton className="h-4 w-4 mt-1 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[40%]" />
        </div>
      </div>
    </div>
  )
}

export const GospelColumnSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <VerseSkeleton />
      <VerseSkeleton />
      <VerseSkeleton />
      <VerseSkeleton />
    </div>
  )
}
