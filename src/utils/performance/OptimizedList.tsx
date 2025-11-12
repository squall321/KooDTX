/**
 * Optimized FlatList Component
 *
 * 성능 최적화된 FlatList 래퍼 컴포넌트
 */

import React from 'react';
import {FlatList, FlatListProps, ViewToken} from 'react-native';

/**
 * 최적화된 FlatList 기본 설정
 */
export const OPTIMIZED_FLATLIST_CONFIG = {
  // 한 번에 렌더링할 항목 수
  initialNumToRender: 10,
  // 추가로 렌더링할 배치 크기
  maxToRenderPerBatch: 5,
  // 스크롤 중 업데이트 빈도
  updateCellsBatchingPeriod: 50,
  // 뷰포트 크기의 배수
  windowSize: 5,
  // 빈 영역 제거
  removeClippedSubviews: true,
  // 성능 향상을 위한 키 추출
  keyExtractor: (item: any, index: number) =>
    item.id?.toString() || index.toString(),
};

/**
 * 최적화된 FlatList 컴포넌트
 */
export function OptimizedFlatList<T>(
  props: FlatListProps<T> & {
    itemHeight?: number;
  },
) {
  const {itemHeight, ...restProps} = props;

  // getItemLayout 제공 시 성능 향상
  const getItemLayout = React.useMemo(() => {
    if (!itemHeight) return undefined;

    return (_data: ArrayLike<T> | null | undefined, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [itemHeight]);

  // viewabilityConfig 최적화
  const viewabilityConfig = React.useMemo(
    () => ({
      waitForInteraction: true,
      viewAreaCoveragePercentThreshold: 50,
      minimumViewTime: 100,
    }),
    [],
  );

  return (
    <FlatList
      {...OPTIMIZED_FLATLIST_CONFIG}
      {...restProps}
      getItemLayout={getItemLayout}
      viewabilityConfig={viewabilityConfig}
    />
  );
}

/**
 * 메모이제이션된 리스트 아이템 HOC
 */
export function withMemoizedItem<P extends {item: any}>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean,
): React.ComponentType<P> {
  const defaultPropsAreEqual = (prevProps: P, nextProps: P): boolean => {
    return prevProps.item === nextProps.item;
  };

  return React.memo(Component, propsAreEqual || defaultPropsAreEqual);
}

/**
 * viewableItems 변경 추적을 위한 Hook
 */
export function useViewableItems<T>(
  onViewableItemsChanged?: (info: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => void,
) {
  const viewabilityConfigCallbackPairs = React.useRef([
    {
      viewabilityConfig: {
        itemVisiblePercentThreshold: 50,
      },
      onViewableItemsChanged:
        onViewableItemsChanged ||
        (() => {
          // Default empty handler
        }),
    },
  ]);

  return viewabilityConfigCallbackPairs;
}

/**
 * 무한 스크롤을 위한 Hook
 */
export function useInfiniteScroll<T>(
  data: T[],
  loadMore: () => Promise<void>,
  hasMore: boolean = true,
) {
  const [loading, setLoading] = React.useState(false);

  const handleLoadMore = React.useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      await loadMore();
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, loadMore]);

  return {
    loading,
    handleLoadMore,
  };
}

/**
 * FlatList 검색/필터링을 위한 Hook
 */
export function useListFilter<T>(
  data: T[],
  filterFn: (item: T, query: string) => boolean,
) {
  const [query, setQuery] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!query.trim()) return data;
    return data.filter(item => filterFn(item, query));
  }, [data, query, filterFn]);

  return {
    filteredData,
    query,
    setQuery,
  };
}

/**
 * 섹션 리스트 최적화 설정
 */
export const OPTIMIZED_SECTIONLIST_CONFIG = {
  ...OPTIMIZED_FLATLIST_CONFIG,
  stickySectionHeadersEnabled: false, // 성능 향상
};
