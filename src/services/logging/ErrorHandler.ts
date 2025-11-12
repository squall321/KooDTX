/**
 * Global Error Handler
 *
 * 앱 전체의 에러를 처리하는 핸들러
 */

import {logger} from './Logger';

export interface ErrorHandlerConfig {
  enableCrashReporting: boolean;
  enableConsoleWarnings: boolean;
  onError?: (error: Error, isFatal: boolean) => void;
}

const DEFAULT_CONFIG: ErrorHandlerConfig = {
  enableCrashReporting: true,
  enableConsoleWarnings: __DEV__,
};

class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorHandlerConfig = DEFAULT_CONFIG;
  private errorCount: number = 0;
  private lastError?: Error;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 에러 핸들러 초기화
   */
  initialize(config?: Partial<ErrorHandlerConfig>): void {
    if (config) {
      this.config = {...this.config, ...config};
    }

    this.setupGlobalHandlers();
    logger.info('ErrorHandler initialized');
  }

  /**
   * 전역 에러 핸들러 설정
   */
  private setupGlobalHandlers(): void {
    // JavaScript 에러 핸들러
    if (ErrorUtils && typeof ErrorUtils.setGlobalHandler === 'function') {
      const originalHandler = ErrorUtils.getGlobalHandler();

      ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        this.handleError(error, isFatal || false);

        // 원래 핸들러 호출
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }

    // Promise rejection 핸들러
    this.setupPromiseRejectionHandler();

    // Console error 핸들러
    if (this.config.enableConsoleWarnings) {
      this.setupConsoleErrorHandler();
    }

    logger.info('Global error handlers setup complete');
  }

  /**
   * Promise rejection 핸들러 설정
   */
  private setupPromiseRejectionHandler(): void {
    // React Native에서는 전역 promise rejection 핸들러가 제한적
    if (typeof global !== 'undefined') {
      const originalHandler = global.onunhandledrejection;

      global.onunhandledrejection = (event: any) => {
        const error = event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

        this.handleError(error, false);

        if (originalHandler) {
          originalHandler(event);
        }
      };
    }
  }

  /**
   * Console error 핸들러 설정
   */
  private setupConsoleErrorHandler(): void {
    const originalError = console.error;

    console.error = (...args: any[]) => {
      // 에러 객체 추출
      const errorArg = args.find(arg => arg instanceof Error);

      if (errorArg) {
        this.handleError(errorArg, false);
      }

      // 원래 console.error 호출
      originalError.apply(console, args);
    };
  }

  /**
   * 에러 처리
   */
  handleError(error: Error, isFatal: boolean = false): void {
    this.errorCount++;
    this.lastError = error;

    // 로그 기록
    if (isFatal) {
      logger.fatal(error.message, error, {
        count: this.errorCount,
        isFatal,
      });
    } else {
      logger.error(error.message, error, {
        count: this.errorCount,
        isFatal,
      });
    }

    // 커스텀 에러 핸들러 호출
    if (this.config.onError) {
      try {
        this.config.onError(error, isFatal);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }

    // 크래시 리포팅
    if (this.config.enableCrashReporting && isFatal) {
      this.reportCrash(error);
    }
  }

  /**
   * 크래시 리포트
   */
  private reportCrash(error: Error): void {
    try {
      // 여기서 Sentry, Firebase Crashlytics 등으로 전송 가능
      logger.info('Crash reported', {
        error: error.message,
        stack: error.stack,
      });

      // TODO: 실제 크래시 리포팅 서비스로 전송
    } catch (reportError) {
      console.error('Failed to report crash:', reportError);
    }
  }

  /**
   * 에러 카운트 가져오기
   */
  getErrorCount(): number {
    return this.errorCount;
  }

  /**
   * 마지막 에러 가져오기
   */
  getLastError(): Error | undefined {
    return this.lastError;
  }

  /**
   * 에러 카운트 초기화
   */
  resetErrorCount(): void {
    this.errorCount = 0;
    this.lastError = undefined;
  }
}

export const errorHandler = ErrorHandler.getInstance();
export default errorHandler;
