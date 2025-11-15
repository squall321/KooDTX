/**
 * Performance Optimization Utilities
 * Phase 158: React performance optimization helpers
 *
 * Features:
 * - Memoization helpers
 * - Render tracking
 * - Performance monitoring
 */

import { useRef, useEffect, useCallback, useMemo, DependencyList } from 'react';

/**
 * Track component renders for debugging
 */
export const useRenderCount = (componentName: string): void => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    if (__DEV__) {
      console.log(`[${componentName}] Render count:`, renderCount.current);
    }
  });
};

/**
 * Track why component re-rendered
 */
export const useWhyDidYouUpdate = (
  componentName: string,
  props: Record<string, any>
): void => {
  const previousProps = useRef<Record<string, any>>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: any; to: any }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current?.[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current?.[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0 && __DEV__) {
        console.log(`[${componentName}] Props changed:`, changedProps);
      }
    }

    previousProps.current = props;
  });
};

/**
 * Stable callback that doesn't change unless dependencies change
 * Better alternative to useCallback with exhaustive deps
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T => {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    deps
  );
};

/**
 * Deep comparison for useMemo/useCallback
 */
export const useDeepMemo = <T>(
  factory: () => T,
  deps: DependencyList
): T => {
  const ref = useRef<{ deps: DependencyList; value: T }>();

  if (
    !ref.current ||
    !deepEqual(ref.current.deps, deps)
  ) {
    ref.current = {
      deps,
      value: factory(),
    };
  }

  return ref.current.value;
};

/**
 * Deep equality check
 */
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
};

/**
 * Measure component render time
 */
export const useMeasureRender = (componentName: string): void => {
  const startTime = useRef<number>(0);

  if (__DEV__) {
    startTime.current = performance.now();
  }

  useEffect(() => {
    if (__DEV__) {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      console.log(`[${componentName}] Render time: ${renderTime.toFixed(2)}ms`);
    }
  });
};

/**
 * Debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttled value
 */
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Performance optimization checklist
 */
export const PerformanceChecklist = {
  /**
   * Use React.memo for functional components
   */
  useMemo: true,

  /**
   * Use useCallback for event handlers
   */
  useCallback: true,

  /**
   * Use useMemo for expensive calculations
   */
  useMemoForCalculations: true,

  /**
   * Avoid inline object/array creation in render
   */
  avoidInlineObjects: true,

  /**
   * Use keys properly in lists
   */
  useProperKeys: true,

  /**
   * Lazy load components
   */
  lazyLoadComponents: true,

  /**
   * Virtualize long lists
   */
  virtualizeLists: true,

  /**
   * Optimize images
   */
  optimizeImages: true,
};

/**
 * Helper to check if re-render is needed
 */
export const shallowEqual = (
  objA: Record<string, any>,
  objB: Record<string, any>
): boolean => {
  if (objA === objB) {
    return true;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every((key) => objA[key] === objB[key]);
};

// Missing import
import { useState } from 'react';

export default {
  useRenderCount,
  useWhyDidYouUpdate,
  useStableCallback,
  useDeepMemo,
  useMeasureRender,
  useDebounce,
  useThrottle,
  shallowEqual,
  PerformanceChecklist,
};
