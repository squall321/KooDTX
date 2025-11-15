/**
 * OptimizedFlatList Component
 * Phase 159: Optimized FlatList with performance best practices
 *
 * Features:
 * - Automatic optimization settings
 * - Memoized renderItem
 * - Proper key extraction
 * - getItemLayout for fixed-size items
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  ViewStyle,
} from 'react-native';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  /**
   * Data array
   */
  data: T[];

  /**
   * Render item function
   */
  renderItem: ListRenderItem<T>;

  /**
   * Key extractor function
   */
  keyExtractor: (item: T, index: number) => string;

  /**
   * Fixed item height for optimization
   */
  itemHeight?: number;

  /**
   * Enable automatic optimizations
   * @default true
   */
  optimize?: boolean;

  /**
   * Window size (number of pages to render)
   * @default 5
   */
  windowSize?: number;

  /**
   * Initial number of items to render
   * @default 10
   */
  initialNumToRender?: number;

  /**
   * Max items to render per batch
   * @default 10
   */
  maxToRenderPerBatch?: number;

  /**
   * Update cells batching period (ms)
   * @default 50
   */
  updateCellsBatchingPeriod?: number;

  /**
   * Remove clipped subviews
   * @default true (Android), false (iOS)
   */
  removeClippedSubviews?: boolean;
}

/**
 * OptimizedFlatList Component
 * Phase 159: FlatList with automatic performance optimizations
 */
function OptimizedFlatListComponent<T>(
  props: OptimizedFlatListProps<T>
) {
  const {
    data,
    renderItem,
    keyExtractor,
    itemHeight,
    optimize = true,
    windowSize = 5,
    initialNumToRender = 10,
    maxToRenderPerBatch = 10,
    updateCellsBatchingPeriod = 50,
    removeClippedSubviews = Platform.OS === 'android',
    ...restProps
  } = props;

  /**
   * Memoized getItemLayout for fixed-size items
   */
  const getItemLayout = useMemo(() => {
    if (!itemHeight || !optimize) {
      return undefined;
    }

    return (data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [itemHeight, optimize]);

  /**
   * Optimization props
   */
  const optimizationProps = useMemo(() => {
    if (!optimize) {
      return {};
    }

    return {
      windowSize,
      initialNumToRender,
      maxToRenderPerBatch,
      updateCellsBatchingPeriod,
      removeClippedSubviews,
      getItemLayout,
    };
  }, [
    optimize,
    windowSize,
    initialNumToRender,
    maxToRenderPerBatch,
    updateCellsBatchingPeriod,
    removeClippedSubviews,
    getItemLayout,
  ]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      {...optimizationProps}
      {...restProps}
    />
  );
}

// Import Platform
import { Platform } from 'react-native';

/**
 * Memoized and typed FlatList
 */
export const OptimizedFlatList = memo(OptimizedFlatListComponent) as <T>(
  props: OptimizedFlatListProps<T>
) => React.ReactElement;

export default OptimizedFlatList;
