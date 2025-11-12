/**
 * Logger Service
 *
 * 앱 전체에서 사용할 수 있는 로깅 서비스
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  platform: string;
  version: string;
  model?: string;
  appVersion: string;
}

export interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  maxLogs: number;
  consoleOutput: boolean;
  remoteLogging: boolean;
  remoteUrl?: string;
}

const DEFAULT_CONFIG: LoggerConfig = {
  enabled: true,
  minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
  maxLogs: 1000,
  consoleOutput: __DEV__,
  remoteLogging: false,
};

const LOG_LEVEL_PRIORITY = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4,
};

class Logger {
  private static instance: Logger;
  private config: LoggerConfig = DEFAULT_CONFIG;
  private logs: LogEntry[] = [];
  private deviceInfo?: DeviceInfo;
  private userId?: string;

  private constructor() {
    this.initializeDeviceInfo();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 설정 업데이트
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = {...this.config, ...config};
  }

  /**
   * 디바이스 정보 초기화
   */
  private initializeDeviceInfo(): void {
    try {
      const Platform = require('react-native').Platform;
      const packageJson = require('../../../package.json');

      this.deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version?.toString() || 'unknown',
        appVersion: packageJson.version || '0.0.0',
      };
    } catch (error) {
      console.warn('Failed to initialize device info:', error);
    }
  }

  /**
   * 사용자 ID 설정
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * 로그 생성
   */
  private createLog(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
  ): LogEntry {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      timestamp: Date.now(),
      context,
      error,
      userId: this.userId,
      deviceInfo: this.deviceInfo,
    };
  }

  /**
   * 로그 저장
   */
  private saveLog(log: LogEntry): void {
    if (!this.config.enabled) return;

    // 레벨 필터링
    if (LOG_LEVEL_PRIORITY[log.level] < LOG_LEVEL_PRIORITY[this.config.minLevel]) {
      return;
    }

    // 로그 추가
    this.logs.push(log);

    // 최대 로그 수 제한
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }

    // 콘솔 출력
    if (this.config.consoleOutput) {
      this.logToConsole(log);
    }

    // 원격 전송
    if (this.config.remoteLogging && this.config.remoteUrl) {
      this.sendToRemote(log);
    }
  }

  /**
   * 콘솔 출력
   */
  private logToConsole(log: LogEntry): void {
    const timestamp = new Date(log.timestamp).toISOString();
    const prefix = `[${timestamp}] [${log.level}]`;
    const message = `${prefix} ${log.message}`;

    switch (log.level) {
      case LogLevel.DEBUG:
        console.log(message, log.context || '');
        break;
      case LogLevel.INFO:
        console.info(message, log.context || '');
        break;
      case LogLevel.WARN:
        console.warn(message, log.context || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, log.error || log.context || '');
        if (log.error?.stack) {
          console.error(log.error.stack);
        }
        break;
    }
  }

  /**
   * 원격 서버로 전송
   */
  private async sendToRemote(log: LogEntry): Promise<void> {
    if (!this.config.remoteUrl) return;

    try {
      await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...log,
          error: log.error
            ? {
                message: log.error.message,
                stack: log.error.stack,
                name: log.error.name,
              }
            : undefined,
        }),
      });
    } catch (error) {
      // 원격 전송 실패는 조용히 무시
      if (__DEV__) {
        console.warn('Failed to send log to remote:', error);
      }
    }
  }

  /**
   * DEBUG 레벨 로그
   */
  debug(message: string, context?: Record<string, any>): void {
    const log = this.createLog(LogLevel.DEBUG, message, context);
    this.saveLog(log);
  }

  /**
   * INFO 레벨 로그
   */
  info(message: string, context?: Record<string, any>): void {
    const log = this.createLog(LogLevel.INFO, message, context);
    this.saveLog(log);
  }

  /**
   * WARN 레벨 로그
   */
  warn(message: string, context?: Record<string, any>): void {
    const log = this.createLog(LogLevel.WARN, message, context);
    this.saveLog(log);
  }

  /**
   * ERROR 레벨 로그
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    const log = this.createLog(LogLevel.ERROR, message, context, error);
    this.saveLog(log);
  }

  /**
   * FATAL 레벨 로그
   */
  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    const log = this.createLog(LogLevel.FATAL, message, context, error);
    this.saveLog(log);
  }

  /**
   * 모든 로그 가져오기
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 레벨별 로그 가져오기
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * 에러 로그만 가져오기
   */
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(
      log => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL,
    );
  }

  /**
   * 로그 초기화
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 로그를 JSON으로 내보내기
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 로그 통계
   */
  getStats(): Record<LogLevel, number> {
    const stats = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.FATAL]: 0,
    };

    this.logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }
}

export const logger = Logger.getInstance();
export default logger;
