## Error Handling and Logging

KooDTX 앱의 에러 처리 및 로깅 시스템 가이드입니다.

## 목차

1. [Logger Service](#logger-service)
2. [Error Handler](#error-handler)
3. [Error Boundary](#error-boundary)
4. [Crash Reporter](#crash-reporter)
5. [Best Practices](#best-practices)
6. [Integration](#integration)

## Logger Service

앱 전체에서 사용할 수 있는 통합 로깅 서비스입니다.

### 기본 사용법

```typescript
import {logger, LogLevel} from '@services/logging';

// DEBUG 레벨 로그
logger.debug('User action', {action: 'button_click', screen: 'home'});

// INFO 레벨 로그
logger.info('Data loaded successfully', {count: 100});

// WARN 레벨 로그
logger.warn('Slow network detected', {latency: 2000});

// ERROR 레벨 로그
try {
  await fetchData();
} catch (error) {
  logger.error('Failed to fetch data', error as Error, {
    endpoint: '/api/data',
  });
}

// FATAL 레벨 로그
logger.fatal('Critical system failure', error, {component: 'SensorManager'});
```

### 설정

```typescript
import {logger} from '@services/logging';

logger.configure({
  enabled: true,
  minLevel: LogLevel.INFO,
  maxLogs: 1000,
  consoleOutput: __DEV__,
  remoteLogging: true,
  remoteUrl: 'https://api.example.com/logs',
});

// 사용자 ID 설정
logger.setUserId('user-123');
```

### 로그 조회

```typescript
// 모든 로그
const allLogs = logger.getLogs();

// 에러 로그만
const errorLogs = logger.getErrorLogs();

// 레벨별 로그
const warnLogs = logger.getLogsByLevel(LogLevel.WARN);

// 로그 통계
const stats = logger.getStats();
// {DEBUG: 150, INFO: 320, WARN: 45, ERROR: 12, FATAL: 1}

// 로그 내보내기
const logsJson = logger.exportLogs();
```

### 로그 레벨

| 레벨 | 용도 | 프로덕션 |
|------|------|----------|
| DEBUG | 디버깅 정보 | ❌ |
| INFO | 일반 정보 | ✅ |
| WARN | 경고 메시지 | ✅ |
| ERROR | 에러 발생 | ✅ |
| FATAL | 치명적 에러 | ✅ |

## Error Handler

전역 에러를 처리하는 핸들러입니다.

### 초기화

App.tsx에서 초기화:

```typescript
import {errorHandler} from '@services/logging';

useEffect(() => {
  errorHandler.initialize({
    enableCrashReporting: true,
    enableConsoleWarnings: __DEV__,
    onError: (error, isFatal) => {
      // 커스텀 에러 처리
      console.log('Error occurred:', error.message);

      if (isFatal) {
        // 치명적 에러 처리
        Alert.alert('오류', '앱에 심각한 문제가 발생했습니다.');
      }
    },
  });
}, []);
```

### 기능

- **JavaScript 에러 포착**: `ErrorUtils.setGlobalHandler` 사용
- **Promise Rejection 포착**: unhandled promise rejection
- **Console Error 포착**: console.error 오버라이드
- **자동 로깅**: 모든 에러 자동 로깅
- **크래시 리포팅**: 치명적 에러 리포트

### 에러 정보 조회

```typescript
import {errorHandler} from '@services/logging';

// 에러 카운트
const count = errorHandler.getErrorCount();

// 마지막 에러
const lastError = errorHandler.getLastError();

// 초기화
errorHandler.resetErrorCount();
```

## Error Boundary

React 컴포넌트 트리의 에러를 포착하는 컴포넌트입니다.

### 기본 사용

```typescript
import {ErrorBoundary} from '@components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 커스텀 Fallback

```typescript
import {ErrorBoundary, FallbackProps} from '@components/ErrorBoundary';

const CustomFallback: React.FC<FallbackProps> = ({
  error,
  resetError,
}) => {
  return (
    <View>
      <Text>문제가 발생했습니다</Text>
      <Text>{error?.message}</Text>
      <Button title="재시도" onPress={resetError} />
    </View>
  );
};

function App() {
  return (
    <ErrorBoundary fallback={CustomFallback}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 화면별 Error Boundary

```typescript
function MyScreen() {
  return (
    <ErrorBoundary>
      <SafeAreaView>
        <ScreenContent />
      </SafeAreaView>
    </ErrorBoundary>
  );
}
```

## Crash Reporter

앱 크래시를 수집하고 리포트하는 서비스입니다.

### 초기화

```typescript
import {crashReporter} from '@services/logging';

useEffect(() => {
  crashReporter.initialize();
}, []);
```

### 크래시 리포트

```typescript
import {crashReporter} from '@services/logging';

try {
  // 위험한 작업
  await dangerousOperation();
} catch (error) {
  await crashReporter.reportCrash(error as Error, {
    operation: 'dangerousOperation',
    userId: user.id,
  });
}
```

### 리포트 조회

```typescript
// 모든 리포트
const reports = crashReporter.getReports();

// 최근 10개
const recentReports = crashReporter.getRecentReports(10);

// 통계
const stats = crashReporter.getStats();
// {
//   totalReports: 25,
//   reportsLast24h: 3,
//   reportsLastWeek: 12
// }

// 리포트 내보내기
const json = crashReporter.exportReports();

// 리포트 삭제
await crashReporter.clearReports();
```

## Best Practices

### 1. 적절한 로그 레벨 사용

```typescript
// ✅ 좋은 예
logger.debug('Processing data', {count: data.length}); // 디버깅용
logger.info('User logged in', {userId: user.id}); // 일반 정보
logger.warn('Cache miss', {key: cacheKey}); // 경고
logger.error('API call failed', error); // 에러

// ❌ 나쁜 예
logger.info('Detailed loop iteration', {i: 1000}); // 너무 많은 로그
logger.error('Button clicked'); // 잘못된 레벨
```

### 2. 컨텍스트 정보 포함

```typescript
// ✅ 좋은 예
logger.error('Failed to save session', error, {
  sessionId: session.id,
  dataSize: data.length,
  timestamp: Date.now(),
});

// ❌ 나쁜 예
logger.error('Save failed', error); // 컨텍스트 없음
```

### 3. 민감한 정보 제외

```typescript
// ❌ 나쁜 예
logger.info('User authenticated', {
  password: user.password, // 절대 안됨!
  token: authToken,
});

// ✅ 좋은 예
logger.info('User authenticated', {
  userId: user.id,
  method: 'email',
});
```

### 4. 에러 핸들링 패턴

```typescript
// API 호출
async function fetchData() {
  try {
    const response = await api.get('/data');
    logger.info('Data fetched successfully', {count: response.data.length});
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch data', error as Error, {
      endpoint: '/data',
    });
    throw error; // 상위로 전파
  }
}

// 크리티컬한 작업
async function saveCriticalData(data: any) {
  try {
    await database.save(data);
    logger.info('Critical data saved', {id: data.id});
  } catch (error) {
    logger.fatal('Failed to save critical data', error as Error, {
      dataId: data.id,
    });
    await crashReporter.reportCrash(error as Error, {
      operation: 'saveCriticalData',
      dataId: data.id,
    });
    throw error;
  }
}
```

### 5. Error Boundary 배치

```typescript
// 앱 레벨
function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

// 화면 레벨 (선택적)
function ComplexScreen() {
  return (
    <ErrorBoundary>
      <SafeAreaView>
        <ComplexComponent />
      </SafeAreaView>
    </ErrorBoundary>
  );
}
```

## Integration

### App.tsx 통합 예시

```typescript
import React, {useEffect} from 'react';
import {ErrorBoundary} from '@components/ErrorBoundary';
import {logger, errorHandler, crashReporter} from '@services/logging';

function App() {
  useEffect(() => {
    // Logger 설정
    logger.configure({
      enabled: true,
      minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
      remoteLogging: !__DEV__,
      remoteUrl: 'https://api.example.com/logs',
    });

    // Error Handler 초기화
    errorHandler.initialize({
      enableCrashReporting: true,
      onError: (error, isFatal) => {
        if (isFatal) {
          crashReporter.reportCrash(error);
        }
      },
    });

    // Crash Reporter 초기화
    crashReporter.initialize();

    logger.info('App initialized');
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

export default App;
```

### 서비스 통합 예시

```typescript
import {logger} from '@services/logging';

export class SensorService {
  async startRecording() {
    try {
      logger.info('Starting sensor recording');

      // 센서 시작
      await this.sensor.start();

      logger.info('Sensor recording started successfully');
    } catch (error) {
      logger.error('Failed to start sensor recording', error as Error, {
        sensorType: this.sensorType,
      });
      throw error;
    }
  }
}
```

## 원격 로깅 서비스 연동

### Sentry 연동 (예시)

```typescript
// sentry 설치
// npm install @sentry/react-native

import * as Sentry from '@sentry/react-native';

// 초기화
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
});

// Logger에서 Sentry로 전송
logger.configure({
  remoteLogging: true,
  onRemoteLog: async (log) => {
    if (log.level === LogLevel.ERROR || log.level === LogLevel.FATAL) {
      Sentry.captureException(log.error || new Error(log.message), {
        contexts: {
          custom: log.context,
        },
      });
    }
  },
});
```

### Firebase Crashlytics 연동 (예시)

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

// CrashReporter에서 Firebase로 전송
crashReporter.configure({
  onCrash: async (report) => {
    await crashlytics().recordError(new Error(report.error.message));
    await crashlytics().setAttributes(report.context || {});
  },
});
```

## 참고 자료

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Native Error Handling](https://reactnative.dev/docs/debugging)
- [Sentry Documentation](https://docs.sentry.io/platforms/react-native/)
- [Firebase Crashlytics](https://rnfirebase.io/crashlytics/usage)
