/**
 * Performance Monitoring Utilities
 *
 * 성능 측정 및 모니터링을 위한 유틸리티
 */

export interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private marks: Map<string, PerformanceMark> = new Map();
  private measurements: PerformanceMark[] = [];
  private enabled: boolean = __DEV__;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 성능 측정 시작
   */
  mark(name: string): void {
    if (!this.enabled) return;

    this.marks.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * 성능 측정 종료 및 기록
   */
  measure(name: string, log: boolean = true): number | null {
    if (!this.enabled) return null;

    const mark = this.marks.get(name);
    if (!mark) {
      console.warn(`[Performance] Mark "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - mark.startTime;

    const measurement: PerformanceMark = {
      ...mark,
      endTime,
      duration,
    };

    this.measurements.push(measurement);
    this.marks.delete(name);

    if (log) {
      this.logMeasurement(measurement);
    }

    return duration;
  }

  /**
   * 측정 결과 로깅
   */
  private logMeasurement(measurement: PerformanceMark): void {
    const duration = measurement.duration!;
    const color =
      duration < 16 ? '🟢' : duration < 100 ? '🟡' : '🔴';

    console.log(
      `${color} [Performance] ${measurement.name}: ${duration.toFixed(2)}ms`,
    );

    // 성능 임계값 경고
    if (duration > 500) {
      console.warn(
        `⚠️ [Performance] "${measurement.name}" took ${duration.toFixed(2)}ms (> 500ms)`,
      );
    }
  }

  /**
   * 함수 실행 시간 측정
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!this.enabled) return fn();

    this.mark(name);
    try {
      const result = await fn();
      this.measure(name);
      return result;
    } catch (error) {
      this.measure(name);
      throw error;
    }
  }

  /**
   * 동기 함수 실행 시간 측정
   */
  measureSync<T>(name: string, fn: () => T): T {
    if (!this.enabled) return fn();

    this.mark(name);
    try {
      const result = fn();
      this.measure(name);
      return result;
    } catch (error) {
      this.measure(name);
      throw error;
    }
  }

  /**
   * 모든 측정 결과 가져오기
   */
  getMeasurements(): PerformanceMark[] {
    return [...this.measurements];
  }

  /**
   * 특정 이름의 측정 결과 가져오기
   */
  getMeasurementsByName(name: string): PerformanceMark[] {
    return this.measurements.filter(m => m.name === name);
  }

  /**
   * 평균 실행 시간 계산
   */
  getAverageDuration(name: string): number | null {
    const measurements = this.getMeasurementsByName(name);
    if (measurements.length === 0) return null;

    const total = measurements.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / measurements.length;
  }

  /**
   * 통계 정보 가져오기
   */
  getStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    total: number;
  } | null {
    const measurements = this.getMeasurementsByName(name);
    if (measurements.length === 0) return null;

    const durations = measurements.map(m => m.duration || 0);
    const total = durations.reduce((sum, d) => sum + d, 0);

    return {
      count: measurements.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: total / measurements.length,
      total,
    };
  }

  /**
   * 측정 결과 초기화
   */
  clear(): void {
    this.marks.clear();
    this.measurements = [];
  }

  /**
   * 성능 리포트 출력
   */
  printReport(): void {
    if (!this.enabled) return;

    console.log('\n=== Performance Report ===');

    // 측정 항목별 통계
    const uniqueNames = [...new Set(this.measurements.map(m => m.name))];

    uniqueNames.forEach(name => {
      const stats = this.getStats(name);
      if (stats) {
        console.log(`\n${name}:`);
        console.log(`  Count: ${stats.count}`);
        console.log(`  Min: ${stats.min.toFixed(2)}ms`);
        console.log(`  Max: ${stats.max.toFixed(2)}ms`);
        console.log(`  Avg: ${stats.avg.toFixed(2)}ms`);
        console.log(`  Total: ${stats.total.toFixed(2)}ms`);
      }
    });

    console.log('\n=========================\n');
  }

  /**
   * 성능 모니터링 활성화/비활성화
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * 성능 모니터링 상태
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * 성능 측정 데코레이터 (HOC)
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
): React.ComponentType<P> {
  const displayName = componentName || Component.displayName || Component.name || 'Component';

  return (props: P) => {
    React.useEffect(() => {
      performanceMonitor.mark(`${displayName}:mount`);

      return () => {
        performanceMonitor.measure(`${displayName}:mount`);
      };
    }, []);

    return <Component {...props} />;
  };
}

/**
 * 렌더링 성능 측정 Hook
 */
export function useRenderTracking(componentName: string): void {
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;

    if (__DEV__ && renderCount.current > 10) {
      console.warn(
        `⚠️ [Performance] ${componentName} rendered ${renderCount.current} times`,
      );
    }
  });

  React.useEffect(() => {
    performanceMonitor.mark(`${componentName}:render`);
    performanceMonitor.measure(`${componentName}:render`, false);
  });
}

// Export singleton instance
export default performanceMonitor;
