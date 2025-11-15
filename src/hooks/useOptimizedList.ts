/**
 * useOptimizedList Hook
 * Phase 159: Hook for optimizing list rendering
 *
 * Features:
 * - Memoized data
 * - Memoized renderItem
 * - Stable key extractor
 * - Pagination support
 */

import { useCallback, useMemo, useState } from 'react';
import { ListRenderItem } from 'react-native';

interface UseOptimizedListOptions<T> {
  /**
   * Initial data
   */
  data: T[];

  /**
   * Key field name
   * @default 'id'
   */
  keyField?: keyof T;

  /**
   * Enable pagination
   * @default false
   */
  enablePagination?: boolean;

  /**
   * Items per page
   * @default 20
   */
  pageSize?: number;

  /**
   * Filter function
   */
  filter?: (item: T) => boolean;

  /**
   * Sort function
   */
  sort?: (a: T, b: T) => number;
}

/**
 * useOptimizedList Hook
 * Phase 159: Optimize list rendering with memoization
 */
export const useOptimizedList = <T extends Record<string, any>>(
  options: UseOptimizedListOptions<T>
) => {
  const {
    data,
    keyField = 'id',
    enablePagination = false,
    pageSize = 20,
    filter,
    sort,
  } = options;

  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Processed data (filtered and sorted)
   */
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filter
    if (filter) {
      result = result.filter(filter);
    }

    // Apply sort
    if (sort) {
      result.sort(sort);
    }

    // Apply pagination
    if (enablePagination) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      result = result.slice(startIndex, endIndex);
    }

    return result;
  }, [data, filter, sort, enablePagination, currentPage, pageSize]);

  /**
   * Key extractor
   */
  const keyExtractor = useCallback(
    (item: T, index: number) => {
      const key = item[keyField];
      return key ? String(key) : String(index);
    },
    [keyField]
  );

  /**
   * Create memoized renderItem
   */
  const createRenderItem = useCallback(
    <P extends object>(
      Component: React.ComponentType<P>,
      getProps: (item: T) => P
    ): ListRenderItem<T> => {
      return ({ item }) => {
        const props = getProps(item);
        return <Component {...props} />;
      };
    },
    []
  );

  /**
   * Load more data
   */
  const loadMore = useCallback(() => {
    if (enablePagination) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [enablePagination]);

  /**
   * Refresh (reset to page 1)
   */
  const refresh = useCallback(() => {
    setCurrentPage(1);
  }, []);

  /**
   * Check if has more data
   */
  const hasMore = useMemo(() => {
    if (!enablePagination) return false;
    return currentPage * pageSize < data.length;
  }, [enablePagination, currentPage, pageSize, data.length]);

  /**
   * Total pages
   */
  const totalPages = useMemo(() => {
    if (!enablePagination) return 1;
    return Math.ceil(data.length / pageSize);
  }, [enablePagination, data.length, pageSize]);

  return {
    data: processedData,
    keyExtractor,
    createRenderItem,
    loadMore,
    refresh,
    hasMore,
    currentPage,
    totalPages,
  };
};

export default useOptimizedList;
