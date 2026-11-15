import { useState, useEffect, useRef, useCallback } from "react";
import { getCoursesBatchAPI } from "@/api/main/coursesAPI";
import type { Course, User } from "@/types";

interface UseBatchedCoursesOptions {
  lecturers?: User[];
  batchSize?: number;
  params?: {
    semester?: string | number;
    program?: string | number;
    lecturer?: string | number;
    faculty?: string | number;
    department?: string | number;
    level?: string | number;
    search?: string;
  };
  enabled?: boolean;
}

export function useBatchedCourses({
  lecturers = [],
  batchSize = 20,
  params,
  enabled = true,
}: UseBatchedCoursesOptions) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [isPrefetching, setIsPrefetching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const prefetchPendingRef = useRef<boolean>(false);
  const fetchedCountRef = useRef<number>(0);
  const totalCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  totalCountRef.current = totalCount;
  fetchedCountRef.current = courses.length;

  const serializedParams = JSON.stringify(params || {});

  const fetchBatch = useCallback(
    async (offset: number, isInitial = false) => {
      if (!enabled) return;
      if (offset > 0 && offset >= totalCountRef.current && totalCountRef.current > 0) {
        return;
      }

      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsPrefetching(true);
      }

      try {
        const result = await getCoursesBatchAPI(lecturers, {
          ...params,
          limit: batchSize,
          offset,
        });

        if (!isMountedRef.current) return;

        setTotalCount(result.totalCount);
        totalCountRef.current = result.totalCount;

        setCourses((prev) => {
          if (offset === 0) {
            return result.courses;
          }
          const existingIds = new Set(prev.map((c) => c.id));
          const newCourses = result.courses.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newCourses];
        });

        // Trigger background prefetch for the next slice
        const nextOffset = offset + result.courses.length;
        if (nextOffset < result.totalCount) {
          prefetchPendingRef.current = true;
          setTimeout(() => {
            if (isMountedRef.current && prefetchPendingRef.current) {
              prefetchPendingRef.current = false;
              fetchBatch(nextOffset, false);
            }
          }, 350);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err : new Error("Failed to load courses batch"));
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefetching(false);
          setIsPrefetching(false);
        }
      }
    },
    [batchSize, enabled, lecturers, serializedParams]
  );

  useEffect(() => {
    isMountedRef.current = true;
    prefetchPendingRef.current = false;
    setCourses([]);
    setTotalCount(0);
    setError(null);

    if (enabled) {
      fetchBatch(0, true);
    }

    return () => {
      isMountedRef.current = false;
      prefetchPendingRef.current = false;
    };
  }, [enabled, serializedParams]);

  const loadMoreIfNecessary = useCallback(
    async (neededIndex: number) => {
      if (
        neededIndex >= fetchedCountRef.current &&
        fetchedCountRef.current < totalCountRef.current &&
        !isLoading &&
        !isPrefetching
      ) {
        await fetchBatch(fetchedCountRef.current, false);
      }
    },
    [fetchBatch, isLoading, isPrefetching]
  );

  const refetch = useCallback(async () => {
    setIsRefetching(true);
    setCourses([]);
    await fetchBatch(0, true);
  }, [fetchBatch]);

  return {
    courses,
    totalCount,
    isLoading,
    isRefetching,
    isPrefetching,
    error,
    loadMoreIfNecessary,
    refetch,
  };
}

export default useBatchedCourses;
