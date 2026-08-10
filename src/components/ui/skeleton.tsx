import React from "react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-border/40 dark:bg-border/20", className)}
      {...props}
    />
  );
}

export default Skeleton;
