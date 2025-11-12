/**
 * Crash Reporter
 *
 * 앱 크래시 및 중요 에러를 수집하고 리포트하는 서비스
 */

import {logger, LogLevel} from './Logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CRASH_REPORTS_KEY = '@koodtx:crash_reports';
const MAX_CRASH_REPORTS = 50;

export interface CrashReport {
  id: string;
  timestamp: number;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context?: Record<string, any>;
  deviceInfo?: any;
  userId?: string;
  appState: 'active' | 'background' | 'inactive';
  memoryUsage?: number;
}

class CrashReporter {
  private static instance: CrashReporter;
  private reports: CrashReport[] = [];
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): CrashReporter {
    if (!CrashReporter.instance) {
      CrashReporter.instance = new CrashReporter();
    }
    return CrashReporter.instance;
  }

  /**
   * 초기화
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.loadReports();
    this.setupAppStateListener();
    this.initialized = true;

    logger.info('CrashReporter initialized');
  }

  /**
   * 저장된 리포트 로드
   */
  private async loadReports(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CRASH_REPORTS_KEY);
      if (stored) {
        this.reports = JSON.parse(stored);
        logger.debug('Loaded crash reports', {count: this.reports.length});
      }
    } catch (error) {
      logger.error('Failed to load crash reports', error as Error);
    }
  }

  /**
   * 리포트 저장
   */
  private async saveReports(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CRASH_REPORTS_KEY,
        JSON.stringify(this.reports),
      );
    } catch (error) {
      logger.error('Failed to save crash reports', error as Error);
    }
  }

  /**
   * 앱 상태 리스너 설정
   */
  private setupAppStateListener(): void {
    try {
      const {AppState} = require('react-native');

      AppState.addEventListener('change', (nextAppState: string) => {
        logger.debug('App state changed', {state: nextAppState});
      });
    } catch (error) {
      logger.warn('Failed to setup AppState listener', {error});
    }
  }

  /**
   * 크래시 리포트 생성
   */
  async reportCrash(
    error: Error,
    context?: Record<string, any>,
  ): Promise<void> {
    const report: CrashReport = {
      id: `crash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
      appState: this.getAppState(),
      memoryUsage: this.getMemoryUsage(),
    };

    this.reports.push(report);

    // 최대 리포트 수 제한
    if (this.reports.length > MAX_CRASH_REPORTS) {
      this.reports = this.reports.slice(-MAX_CRASH_REPORTS);
    }

    await this.saveReports();

    logger.fatal('Crash reported', error, {
      reportId: report.id,
      context,
    });

    // 원격 서버로 전송 (구현 필요)
    await this.sendToRemote(report);
  }

  /**
   * 현재 앱 상태 가져오기
   */
  private getAppState(): 'active' | 'background' | 'inactive' {
    try {
      const {AppState} = require('react-native');
      return AppState.currentState || 'active';
    } catch {
      return 'active';
    }
  }

  /**
   * 메모리 사용량 가져오기 (예상치)
   */
  private getMemoryUsage(): number | undefined {
    // React Native에서 정확한 메모리 사용량을 가져오기 어려움
    // 필요시 Native Module로 구현
    return undefined;
  }

  /**
   * 원격 서버로 전송
   */
  private async sendToRemote(report: CrashReport): Promise<void> {
    // TODO: 실제 크래시 리포팅 서비스로 전송
    // Sentry, Firebase Crashlytics, 자체 서버 등

    try {
      logger.debug('Sending crash report to remote', {reportId: report.id});

      // 예시: 자체 API로 전송
      // await fetch('https://api.example.com/crashes', {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify(report),
      // });
    } catch (error) {
      logger.error('Failed to send crash report', error as Error);
    }
  }

  /**
   * 모든 리포트 가져오기
   */
  getReports(): CrashReport[] {
    return [...this.reports];
  }

  /**
   * 최근 리포트 가져오기
   */
  getRecentReports(count: number = 10): CrashReport[] {
    return this.reports.slice(-count);
  }

  /**
   * 리포트 삭제
   */
  async clearReports(): Promise<void> {
    this.reports = [];
    await this.saveReports();
    logger.info('Crash reports cleared');
  }

  /**
   * 리포트 통계
   */
  getStats(): {
    totalReports: number;
    reportsLast24h: number;
    reportsLastWeek: number;
  } {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const week = 7 * day;

    return {
      totalReports: this.reports.length,
      reportsLast24h: this.reports.filter(r => now - r.timestamp < day).length,
      reportsLastWeek: this.reports.filter(r => now - r.timestamp < week)
        .length,
    };
  }

  /**
   * 리포트를 JSON으로 내보내기
   */
  exportReports(): string {
    return JSON.stringify(this.reports, null, 2);
  }
}

export const crashReporter = CrashReporter.getInstance();
export default crashReporter;
