# KooDTX - React Native Sensor Data Collection App

[![CI](https://github.com/squall321/KooDTX/actions/workflows/ci.yml/badge.svg)](https://github.com/squall321/KooDTX/actions/workflows/ci.yml)
[![Security](https://github.com/squall321/KooDTX/actions/workflows/security.yml/badge.svg)](https://github.com/squall321/KooDTX/actions/workflows/security.yml)
[![React Native](https://img.shields.io/badge/React%20Native-0.73.0-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

KooDTX는 React Native로 구현한 센서 데이터 수집 및 동기화 애플리케이션입니다. 모바일 기기의 다양한 센서(가속도계, 자이로스코프, 자기계, GPS)와 오디오를 녹음하여 로컬에 저장하고, 네트워크를 통해 서버와 동기화하는 기능을 제공합니다.

## 주요 기능

### 📱 센서 데이터 수집
- **가속도계 (Accelerometer)**: X, Y, Z축 가속도 측정
- **자이로스코프 (Gyroscope)**: X, Y, Z축 회전 속도 측정
- **자기계 (Magnetometer)**: X, Y, Z축 자기장 측정
- **GPS**: 위도, 경도, 고도, 정확도, 속도, 방향 측정
- **보행 감지 (Step Detector)**: 실시간 걸음 감지 및 걷기/뛰기 분류
- **오디오**: 44.1kHz 스테레오 AAC 녹음

### 💾 로컬 우선 아키텍처 (Local-First)
- **WatermelonDB**: SQLite 기반 오프라인 데이터 저장
- **배치 저장**: 효율적인 데이터 저장 (100개 단위)
- **데이터 버퍼링**: 메모리 버퍼를 통한 성능 최적화
- **세션 관리**: 녹음 세션별 데이터 그룹화

### 🔄 네트워크 동기화
- **자동 동기화**: 네트워크 상태 감지 및 자동 업로드
- **Wi-Fi 전용 모드**: 모바일 데이터 사용 제한
- **업로드 큐**: 순차적 업로드 및 실패 재시도
- **배치 업로드**: 센서 데이터 배치 단위 업로드
- **진행 상태 추적**: 실시간 업로드 상태 모니터링

### 📊 데이터 시각화 및 관리
- **실시간 데이터 표시**: 녹음 중 센서 값 실시간 확인
- **세션 목록**: 모든 녹음 세션 조회
- **세션 상세**: 세션 정보, 통계, 센서 데이터 확인
- **차트 시각화**: Line Chart를 통한 센서 데이터 시각화
- **오디오 재생**: 녹음된 오디오 파일 재생 및 공유
- **데이터 내보내기**: CSV, JSON 형식으로 데이터 export

### ⚙️ 설정 및 관리
- **API 설정**: 서버 URL, 타임아웃, 재시도 횟수 설정
- **동기화 설정**: 자동 동기화, Wi-Fi 전용, 간격, 배치 크기 설정
- **설정 저장**: AsyncStorage를 통한 영구 저장
- **네트워크 상태**: 실시간 연결 상태 및 타입 표시

## 기술 스택

### Core
- **React Native**: 0.73.0
- **TypeScript**: 5.0.4
- **React**: 18.2.0

### UI
- **React Native Paper**: Material Design 3 UI 컴포넌트
- **React Navigation**: Bottom Tabs + Stack Navigation
- **react-native-chart-kit**: 센서 데이터 차트 시각화

### 데이터베이스
- **WatermelonDB**: 0.27.1 (SQLite 기반)
- **Decorator 패턴**: TypeScript Decorators 활용

### 센서
- **react-native-sensors**: 6.0.19 (가속도계, 자이로스코프, 자기계)
- **@react-native-community/geolocation**: 3.3.0 (GPS)
- **react-native-audio-recorder-player**: 3.6.10 (오디오 녹음/재생)

### 네트워크
- **axios**: 1.7.9 (HTTP 클라이언트)
- **@react-native-community/netinfo**: 11.4.1 (네트워크 상태 감지)

### 상태 관리
- **Zustand**: 4.5.0 (간단하고 빠른 상태 관리)
- **Custom Hooks**: React Hooks 패턴 활용

### 저장소
- **@react-native-async-storage/async-storage**: 2.1.0 (설정 저장)
- **react-native-fs**: 2.20.0 (파일 시스템 접근)

### 알림
- **@notifee/react-native**: 로컬 알림 시스템
- 녹음 중 Foreground Service 알림
- 동기화 완료 알림

### 기타
- **date-fns**: 날짜 포맷팅
- **lodash**: 유틸리티 함수

## 아키텍처

```
┌─────────────────────────────────────┐
│ Presentation Layer                  │
├─────────────────────────────────────┤
│ - RecordingScreen                   │
│ - HistoryScreen                     │
│ - SessionDetailScreen               │
│ - ChartScreen                       │
│ - SettingsScreen                    │
│ - SyncStatusScreen                  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Business Logic Layer                │
├─────────────────────────────────────┤
│ - Custom Hooks                      │
│   - useSensor                       │
│   - useSensorCollection             │
│   - useSensorCollectionWithDB       │
│   - useAudioRecording               │
│   - useNetworkStatus                │
│   - usePermissions                  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Service Layer                       │
├─────────────────────────────────────┤
│ - SensorManager (Singleton)         │
│ - SensorDataBuffer                  │
│ - SensorDataBatchSaver              │
│ - AudioRecorderService (Singleton)  │
│ - ApiClient (Singleton)             │
│ - UploadQueue (Singleton)           │
│ - SyncManager (Singleton)           │
│ - SettingsManager (Singleton)       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Data Layer                          │
├─────────────────────────────────────┤
│ - WatermelonDB (SQLite)             │
│   - RecordingSession                │
│   - SensorDataRecord                │
│   - AudioRecording                  │
│ - AsyncStorage (설정)               │
│ - File System (오디오 파일)         │
└─────────────────────────────────────┘
```

## 설치 및 실행

### 요구사항
- Node.js 18+
- React Native 개발 환경 설정
- Android Studio (Android)
- Xcode (iOS, macOS only)

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/KooDTX.git
cd KooDTX

# 의존성 설치
npm install

# iOS (macOS only)
cd ios && pod install && cd ..
```

### 실행

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

### 개발

```bash
# TypeScript 타입 체크
npm run tsc

# Linting
npm run lint

# 테스트
npm test
```

## 프로젝트 구조

```
KooDTX/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── config/              # 설정 파일 (테마 등)
│   ├── database/            # WatermelonDB
│   │   ├── models/          # 데이터 모델
│   │   ├── repositories/    # Repository 패턴
│   │   └── schema.ts        # DB 스키마
│   ├── hooks/               # Custom React Hooks
│   ├── navigation/          # React Navigation 설정
│   ├── screens/             # 화면 컴포넌트
│   ├── services/            # 비즈니스 로직
│   │   ├── api/             # API 클라이언트
│   │   ├── audio/           # 오디오 녹음
│   │   ├── config/          # 설정 관리
│   │   ├── sensors/         # 센서 관리
│   │   └── sync/            # 동기화 관리
│   ├── store/               # Zustand 상태 관리
│   ├── types/               # TypeScript 타입 정의
│   └── utils/               # 유틸리티 함수
├── android/                 # Android 네이티브 코드
├── ios/                     # iOS 네이티브 코드
└── __tests__/               # 테스트 파일
```

## 주요 화면

### 1. Recording (녹음)
- 센서 선택 (가속도계, 자이로스코프, 자기계, GPS, 오디오)
- 샘플링 레이트 설정
- 세션 메모 추가
- 실시간 센서 데이터 표시
- 녹음 시작/중지

### 2. History (기록)
- 녹음 세션 목록 조회
- 세션별 통계 (데이터 수, 시간 등)
- 세션 상세 보기
- Pull-to-refresh

### 3. Session Detail (세션 상세)
- 세션 정보 (ID, 시간, 센서, 메모)
- 센서 데이터 통계
- 오디오 녹음 재생
- 차트 보기
- CSV/JSON 내보내기
- 세션 삭제

### 4. Chart (차트)
- Line Chart로 센서 데이터 시각화
- 센서 선택 (Accelerometer, Gyroscope, Magnetometer, GPS)
- 데이터 샘플링 (최대 100개 포인트)
- 수평 스크롤

### 5. Settings (설정)
- 네트워크 상태 표시
- API 설정 (서버 URL, 타임아웃, 재시도)
- 동기화 설정 (자동 동기화, Wi-Fi 전용, 간격, 배치 크기)
- 수동 동기화
- 동기화 상태 보기
- 설정 초기화

### 6. Sync Status (동기화 상태)
- 동기화 상태 (진행 중/대기 중)
- 대기 중인 데이터 수
- 업로드 진행 상태 (ProgressBar)
- 실패한 작업 재시도
- 완료된 작업 삭제

## 데이터 흐름

### 센서 데이터 수집
```
Sensor → SensorManager → SensorDataBuffer → SensorDataBatchSaver → WatermelonDB
```

### 오디오 녹음
```
Microphone → AudioRecorderService → File System
           ↓
     AudioRecordingRepository → WatermelonDB
```

### 데이터 동기화
```
WatermelonDB → SyncManager → UploadQueue → ApiClient → Server
             ↓ (성공 시)
         markAsUploaded()
```

## 개발 가이드

### 새로운 센서 추가하기

1. 센서 타입 추가 (`src/types/sensor.types.ts`)
2. 센서 서비스 구현 (`src/services/sensors/`)
3. SensorManager에 등록
4. UI에 센서 선택 추가

### 새로운 화면 추가하기

1. 화면 컴포넌트 생성 (`src/screens/`)
2. Navigation 설정 업데이트
3. 화면 export (`src/screens/index.ts`)

### 데이터베이스 스키마 변경

1. 스키마 버전 업데이트 (`src/database/schema.ts`)
2. 마이그레이션 추가 (필요시)
3. 모델 업데이트 (`src/database/models/`)
4. Repository 업데이트 (필요시)

## 테스트

### 단위 테스트 (Jest)

프로젝트는 Jest를 사용한 단위 테스트를 포함합니다.

**테스트 실행**:
```bash
# 전체 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage

# 특정 테스트 실행
npm test -- --testPathPattern="SettingsManager"

# 캐시 클리어
npm run test:clearCache
```

**테스트 파일 위치**:
```
src/
├── services/
│   ├── config/__tests__/
│   │   └── SettingsManager.test.ts
│   ├── api/__tests__/
│   │   └── ApiClient.test.ts
│   └── sync/__tests__/
│       └── UploadQueue.test.ts
```

**테스트 커버리지**:
- SettingsManager: 20+ 테스트 케이스
- ApiClient: 25+ 테스트 케이스
- UploadQueue: 20+ 테스트 케이스

**Mocks**: AsyncStorage, NetInfo, Geolocation, Audio, Sensors, WatermelonDB, Axios

## CI/CD

프로젝트는 GitHub Actions를 사용한 자동화된 CI/CD 파이프라인을 포함합니다.

### Workflows

**CI Pipeline** (`.github/workflows/ci.yml`):
- **Lint**: ESLint 및 Prettier 코드 스타일 검사
- **TypeCheck**: TypeScript 타입 검증
- **Test**: Jest 단위 테스트 실행 및 커버리지 수집
- **Validate**: 프로젝트 구조 및 의존성 검증
- **Build Check**: React Native 설정 및 빌드 구성 검증

**PR Check** (`.github/workflows/pr-check.yml`):
- PR 정보 분석 및 요약
- 브랜치 명명 규칙 검증
- 코드 품질 검사
- 테스트 커버리지 리포트
- 변경 파일 분석
- 번들 크기 검사

**Security** (`.github/workflows/security.yml`):
- npm audit를 통한 의존성 취약점 검사
- 코드 내 secret 스캔
- License 준수 검사
- CodeQL 정적 분석

### CI 트리거

```yaml
# 자동 실행
- Push: main, develop, claude/** 브랜치
- Pull Request: main, develop 브랜치 대상
- Schedule: 매주 월요일 (보안 검사)

# 수동 실행
- workflow_dispatch 이벤트
```

### 로컬에서 CI 검증

CI 파이프라인과 동일한 검사를 로컬에서 실행:

```bash
# 전체 검증 (lint + typecheck + format + test)
npm run validate

# 개별 검사
npm run lint
npm run typecheck
npm run format:check
npm test
```

### Badge 상태

프로젝트 README 상단의 배지를 통해 CI 상태를 실시간으로 확인할 수 있습니다:
- [![CI](https://img.shields.io/badge/CI-passing-brightgreen.svg)]() - 빌드 및 테스트 상태
- [![Security](https://img.shields.io/badge/Security-passing-brightgreen.svg)]() - 보안 검사 상태

## 성능 최적화

프로젝트는 다양한 성능 최적화 도구와 유틸리티를 포함합니다.

### Performance Monitor

성능 측정 및 모니터링:

```typescript
import {performanceMonitor} from '@utils/performance';

// 측정 시작/종료
performanceMonitor.mark('loadData');
const data = await fetchData();
performanceMonitor.measure('loadData');

// 비동기 함수 측정
const result = await performanceMonitor.measureAsync(
  'fetchSensorData',
  () => repository.findAll()
);

// 통계 조회
const stats = performanceMonitor.getStats('loadData');
console.log(`Average: ${stats.avg}ms`);

// 리포트 출력
performanceMonitor.printReport();
```

### Optimized List

FlatList 최적화:

```typescript
import {OptimizedFlatList} from '@utils/performance';

<OptimizedFlatList
  data={sessions}
  itemHeight={80}  // 고정 높이로 성능 향상
  renderItem={({item}) => <SessionItem session={item} />}
/>
```

### Bundle Analysis

번들 크기 분석:

```bash
# 번들 크기 및 의존성 분석
npm run analyze

# 또는
npm run perf
```

출력:
- 소스 코드 크기 분석
- Top 10 largest dependencies
- 파일/디렉토리 크기 순위
- 색상 코딩으로 대용량 파일 강조

### Performance Guide

상세한 성능 최적화 가이드는 [docs/PERFORMANCE.md](docs/PERFORMANCE.md)를 참조하세요.

**주요 내용**:
- React 컴포넌트 최적화 (React.memo, useMemo, useCallback)
- 리스트 렌더링 최적화 (FlatList, virtualization)
- 메모리 관리 (구독 정리, 타이머 관리)
- 번들 크기 최적화
- Best Practices

## 에러 처리 및 로깅

프로젝트는 포괄적인 에러 처리 및 로깅 시스템을 포함합니다.

### Logger Service

통합 로깅 서비스:

```typescript
import {logger, LogLevel} from '@services/logging';

// 로그 레벨별 메서드
logger.debug('Debug info', {data: value});
logger.info('User action', {userId: '123'});
logger.warn('Warning message', {code: 'WARN_001'});
logger.error('Error occurred', error, {context});
logger.fatal('Critical error', error, {context});

// 설정
logger.configure({
  minLevel: LogLevel.INFO,
  remoteLogging: true,
  remoteUrl: 'https://api.example.com/logs',
});

// 조회
const errorLogs = logger.getErrorLogs();
const stats = logger.getStats();
```

### Error Handler

전역 에러 핸들러:

```typescript
import {errorHandler} from '@services/logging';

// App.tsx에서 초기화
errorHandler.initialize({
  enableCrashReporting: true,
  onError: (error, isFatal) => {
    // 커스텀 에러 처리
  },
});
```

### Error Boundary

React 에러 경계:

```typescript
import {ErrorBoundary} from '@components/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Crash Reporter

크래시 리포팅:

```typescript
import {crashReporter} from '@services/logging';

await crashReporter.initialize();
await crashReporter.reportCrash(error, {context});

const stats = crashReporter.getStats();
// {totalReports: 25, reportsLast24h: 3}
```

### 에러 처리 가이드

상세한 에러 처리 가이드는 [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md)를 참조하세요.

**주요 내용**:
- Logger Service 사용법
- Error Handler 설정
- Error Boundary 적용
- Crash Reporter 활용
- Best Practices
- 원격 서비스 연동 (Sentry, Firebase)

## 문제 해결

### Android 빌드 실패
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS 빌드 실패
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Metro 번들러 캐시 삭제
```bash
npm start -- --reset-cache
```

## 라이선스

MIT License

## 기여

Pull Requests are welcome!

## 문의

- GitHub Issues: [https://github.com/yourusername/KooDTX/issues](https://github.com/yourusername/KooDTX/issues)

---

**최종 업데이트**: 2025-11-12
