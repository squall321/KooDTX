/**
 * Memory Leak Detection Utilities
 * Phase 160: Helpers for detecting and preventing memory leaks
 *
 * Features:
 * - useEffect cleanup helpers
 * - Event listener cleanup
 * - Timer management
 * - Subscription cleanup
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Mounted state tracker to prevent state updates after unmount
 */
export const useMounted = (): (() => boolean) => {
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
};

/**
 * Safe async handler that checks if component is mounted
 */
export const useSafeAsync = <T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T
): T => {
  const isMounted = useMounted();

  return useCallback(
    async (...args: any[]) => {
      if (isMounted()) {
        return await asyncFunction(...args);
      }
      if (__DEV__) {
        console.warn('Attempted to call async function on unmounted component');
      }
      return undefined;
    },
    [asyncFunction, isMounted]
  ) as T;
};

/**
 * Timer manager to ensure all timers are cleaned up
 */
export const useTimers = () => {
  const timers = useRef<Set<NodeJS.Timeout>>(new Set());

  const setTimeout = useCallback((callback: () => void, delay: number) => {
    const timer = global.setTimeout(() => {
      callback();
      timers.current.delete(timer);
    }, delay);

    timers.current.add(timer);
    return timer;
  }, []);

  const setInterval = useCallback((callback: () => void, delay: number) => {
    const timer = global.setInterval(callback, delay);
    timers.current.add(timer);
    return timer;
  }, []);

  const clearTimer = useCallback((timer: NodeJS.Timeout) => {
    global.clearTimeout(timer);
    global.clearInterval(timer);
    timers.current.delete(timer);
  }, []);

  const clearAllTimers = useCallback(() => {
    timers.current.forEach((timer) => {
      global.clearTimeout(timer);
      global.clearInterval(timer);
    });
    timers.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    setTimeout,
    setInterval,
    clearTimer,
    clearAllTimers,
  };
};

/**
 * Event listener manager to ensure cleanup
 */
export const useEventListener = <K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: EventTarget = document
) => {
  const savedHandler = useRef<(event: DocumentEventMap[K]) => void>();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event: Event) => {
      savedHandler.current?.(event as DocumentEventMap[K]);
    };

    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};

/**
 * Subscription manager for cleanup
 */
export const useSubscription = () => {
  const subscriptions = useRef<Set<() => void>>(new Set());

  const addSubscription = useCallback((unsubscribe: () => void) => {
    subscriptions.current.add(unsubscribe);

    return () => {
      subscriptions.current.delete(unsubscribe);
    };
  }, []);

  const unsubscribeAll = useCallback(() => {
    subscriptions.current.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        if (__DEV__) {
          console.error('Error unsubscribing:', error);
        }
      }
    });
    subscriptions.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);

  return {
    addSubscription,
    unsubscribeAll,
  };
};

/**
 * Leak detection wrapper for development
 */
export const useLeakDetection = (componentName: string): void => {
  if (!__DEV__) return;

  const mountTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;

    const currentTime = Date.now();
    const lifetime = currentTime - mountTime.current;

    // Warn if component has too many renders in short time
    if (renderCount.current > 100 && lifetime < 10000) {
      console.warn(
        `[Memory Leak Warning] ${componentName} rendered ${renderCount.current} times in ${lifetime}ms`
      );
    }
  });

  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const lifetime = endTime - startTime;

      console.log(
        `[Leak Detection] ${componentName} unmounted after ${lifetime}ms with ${renderCount.current} renders`
      );
    };
  }, [componentName]);
};

/**
 * Abort controller hook for fetch cancellation
 */
export const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const createAbortController = useCallback(() => {
    // Abort previous controller if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller;
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      abort();
    };
  }, [abort]);

  return {
    createAbortController,
    abort,
    get signal() {
      return abortControllerRef.current?.signal;
    },
  };
};

/**
 * Animation cleanup helper
 */
export const useAnimationCleanup = () => {
  const animationFrames = useRef<Set<number>>(new Set());

  const requestAnimationFrame = useCallback((callback: FrameRequestCallback) => {
    const frameId = global.requestAnimationFrame((time) => {
      callback(time);
      animationFrames.current.delete(frameId);
    });

    animationFrames.current.add(frameId);
    return frameId;
  }, []);

  const cancelAnimationFrame = useCallback((frameId: number) => {
    global.cancelAnimationFrame(frameId);
    animationFrames.current.delete(frameId);
  }, []);

  const cancelAllAnimationFrames = useCallback(() => {
    animationFrames.current.forEach((frameId) => {
      global.cancelAnimationFrame(frameId);
    });
    animationFrames.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      cancelAllAnimationFrames();
    };
  }, [cancelAllAnimationFrames]);

  return {
    requestAnimationFrame,
    cancelAnimationFrame,
    cancelAllAnimationFrames,
  };
};

/**
 * Memory leak checklist
 */
export const MemoryLeakChecklist = {
  /**
   * useEffect cleanup
   */
  useEffectCleanup: [
    'Return cleanup function from useEffect',
    'Clean up timers (setTimeout, setInterval)',
    'Remove event listeners',
    'Unsubscribe from subscriptions',
    'Cancel pending async operations',
    'Clear animation frames',
  ],

  /**
   * Event listeners
   */
  eventListeners: [
    'Always remove event listeners on unmount',
    'Use addEventListener with cleanup',
    'Be careful with global event listeners',
    'Clean up custom event emitters',
  ],

  /**
   * Timers
   */
  timers: [
    'Clear timeouts on unmount',
    'Clear intervals on unmount',
    'Track all timers in a ref',
    'Use useTimers hook for automatic cleanup',
  ],

  /**
   * Subscriptions
   */
  subscriptions: [
    'Unsubscribe from all subscriptions on unmount',
    'Store unsubscribe functions',
    'Use useSubscription hook',
    'Clean up WebSocket connections',
  ],

  /**
   * Async operations
   */
  asyncOperations: [
    'Use AbortController for fetch requests',
    'Check if component is mounted before setState',
    'Cancel pending promises on unmount',
    'Handle race conditions',
  ],

  /**
   * Refs
   */
  refs: [
    'Set refs to null on unmount if needed',
    'Be careful with circular references',
    'Clean up ref callbacks',
  ],

  /**
   * Libraries
   */
  libraries: [
    'Clean up third-party library instances',
    'Dispose animation libraries',
    'Close database connections',
    'Clean up map/chart instances',
  ],
};

/**
 * Common leak patterns to avoid
 */
export const CommonLeakPatterns = {
  // ❌ Bad: No cleanup
  badTimer: `
    useEffect(() => {
      setInterval(() => {
        console.log('Leaking!');
      }, 1000);
    }, []);
  `,

  // ✅ Good: With cleanup
  goodTimer: `
    useEffect(() => {
      const timer = setInterval(() => {
        console.log('Safe!');
      }, 1000);

      return () => clearInterval(timer);
    }, []);
  `,

  // ❌ Bad: No event listener cleanup
  badEventListener: `
    useEffect(() => {
      window.addEventListener('resize', handleResize);
    }, []);
  `,

  // ✅ Good: With cleanup
  goodEventListener: `
    useEffect(() => {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
  `,

  // ❌ Bad: setState after unmount
  badAsync: `
    useEffect(() => {
      fetchData().then((data) => {
        setState(data); // Component might be unmounted!
      });
    }, []);
  `,

  // ✅ Good: Check if mounted
  goodAsync: `
    useEffect(() => {
      let isMounted = true;

      fetchData().then((data) => {
        if (isMounted) {
          setState(data);
        }
      });

      return () => {
        isMounted = false;
      };
    }, []);
  `,
};

export default {
  useMounted,
  useSafeAsync,
  useTimers,
  useEventListener,
  useSubscription,
  useLeakDetection,
  useAbortController,
  useAnimationCleanup,
  MemoryLeakChecklist,
  CommonLeakPatterns,
};
