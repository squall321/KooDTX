# Analytics Events Reference

**Firebase Analytics 이벤트 정의** | Analytics Events Definition

이 문서는 KooDTX 앱에서 추적하는 모든 Analytics 이벤트를 정의합니다.

---

## 📊 이벤트 카테고리

1. [App Lifecycle Events](#app-lifecycle-events) - 앱 생명주기
2. [Recording Events](#recording-events) - 녹음 관련
3. [Export Events](#export-events) - 데이터 내보내기
4. [Sync Events](#sync-events) - 클라우드 동기화
5. [Session Management Events](#session-management-events) - 세션 관리
6. [Settings Events](#settings-events) - 설정 변경
7. [Error Events](#error-events) - 오류 추적
8. [Feedback Events](#feedback-events) - 사용자 피드백
9. [User Engagement Events](#user-engagement-events) - 사용자 참여

---

## App Lifecycle Events

### `app_opened`

앱이 열렸을 때 기록됩니다.

**Parameters:**
- `is_first_open` (boolean): 첫 실행 여부
- `days_since_install` (number): 설치 후 경과 일수
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
import { AnalyticsEvents } from '@/events/analyticsEvents';

AnalyticsEvents.logAppOpened({ isFirstOpen: true });
```

**Firebase Console에서 확인:**
- Events > `app_opened`
- 첫 실행 사용자 비율 확인 (`is_first_open = true`)

---

### `app_backgrounded`

앱이 백그라운드로 전환될 때 기록됩니다.

**Parameters:**
- `timestamp` (number): 타임스탬프

**사용 사례:**
- 앱 사용 시간 계산
- 세션 길이 분석

---

### `app_foregrounded`

앱이 포어그라운드로 복귀할 때 기록됩니다.

**Parameters:**
- `timestamp` (number): 타임스탬프

**사용 사례:**
- 백그라운드 → 포어그라운드 전환 빈도 분석

---

## Recording Events

### `recording_started`

녹음이 시작될 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `sensor_count` (number): 활성화된 센서 수
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
AnalyticsEvents.logRecordingStarted({
  sessionId: 'session_123',
  sensorCount: 5,
});
```

**분석 목적:**
- 녹음 시작 빈도
- 사용자가 활성화하는 센서 수 평균

---

### `recording_stopped`

녹음이 중지될 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `duration` (number): 녹음 시간 (초)
- `data_points_collected` (number): 수집된 데이터 포인트 수
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
AnalyticsEvents.logRecordingStopped({
  sessionId: 'session_123',
  duration: 3600, // 1 hour
  dataPointsCollected: 36000,
});
```

**분석 목적:**
- 평균 녹음 시간
- 녹음 완료율 (started vs stopped)

---

### `recording_completed`

녹음이 성공적으로 완료될 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `duration` (number): 녹음 시간 (초)
- `timestamp` (number): 타임스탬프

**분석 목적:**
- 녹음 성공률
- 평균 녹음 시간

---

### `recording_paused`

녹음이 일시정지될 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `timestamp` (number): 타임스탬프

---

### `recording_resumed`

일시정지된 녹음이 재개될 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `timestamp` (number): 타임스탬프

---

## Export Events

### `export_started`

데이터 내보내기가 시작될 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `format` (string): 내보내기 형식 (`csv` or `json`)
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
AnalyticsEvents.logExportStarted({
  sessionId: 'session_123',
  format: 'csv',
});
```

**분석 목적:**
- 어떤 형식이 더 많이 사용되는지 (CSV vs JSON)
- 내보내기 빈도

---

### `export_success`

데이터 내보내기가 성공할 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `format` (string): 내보내기 형식
- `file_size_bytes` (number): 파일 크기 (바이트)
- `timestamp` (number): 타임스탬프

**분석 목적:**
- 내보내기 성공률
- 평균 파일 크기

---

### `export_failed`

데이터 내보내기가 실패할 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `format` (string): 내보내기 형식
- `error_message` (string): 오류 메시지 (최대 100자)
- `timestamp` (number): 타임스탬프

**분석 목적:**
- 내보내기 실패 원인 파악
- 실패율 추적

---

## Sync Events

### `sync_started`

클라우드 동기화가 시작될 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `timestamp` (number): 타임스탬프

---

### `sync_completed`

동기화가 성공적으로 완료될 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `duration_ms` (number): 동기화 소요 시간 (밀리초)
- `data_size_bytes` (number): 동기화된 데이터 크기
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
AnalyticsEvents.logSyncCompleted({
  sessionId: 'session_123',
  durationMs: 5000,
  dataSizeBytes: 2048000,
});
```

**분석 목적:**
- 동기화 성공률
- 평균 동기화 시간
- 동기화 데이터 크기 분포

---

### `sync_failed`

동기화가 실패할 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `error_message` (string): 오류 메시지
- `timestamp` (number): 타임스탬프

**분석 목적:**
- 동기화 실패 원인 파악 (네트워크, 서버, 인증 등)

---

## Session Management Events

### `session_viewed`

사용자가 세션 상세 정보를 볼 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `timestamp` (number): 타임스탬프

**분석 목적:**
- 사용자가 과거 세션을 얼마나 자주 확인하는지

---

### `session_deleted`

세션이 삭제될 때 기록됩니다.

**Parameters:**
- `session_id` (string): 세션 ID
- `duration` (number): 세션 길이 (초)
- `timestamp` (number): 타임스탬프

**분석 목적:**
- 삭제되는 세션의 특성 (짧은 세션이 더 자주 삭제되는가?)

---

## Settings Events

### `setting_changed`

설정이 변경될 때 기록됩니다.

**Parameters:**
- `setting_name` (string): 설정 이름
- `new_value` (string): 새로운 값 (최대 36자)
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
AnalyticsEvents.logSettingChanged({
  settingName: 'sampling_rate',
  newValue: '10Hz',
});
```

**분석 목적:**
- 어떤 설정이 자주 변경되는지
- 사용자가 선호하는 설정 값

---

### `sensor_toggled`

센서가 활성화/비활성화될 때 기록됩니다.

**Parameters:**
- `sensor_type` (string): 센서 타입 (`gps`, `accelerometer`, `gyroscope`, etc.)
- `enabled` (boolean): 활성화 여부
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
AnalyticsEvents.logSensorToggled({
  sensorType: 'accelerometer',
  enabled: true,
});
```

**분석 목적:**
- 가장 많이 사용되는 센서
- 비활성화되는 센서 파악

---

## Error Events

### `error_occurred`

일반 오류가 발생할 때 기록됩니다.

**Parameters:**
- `error_type` (string): 오류 타입
- `error_message` (string): 오류 메시지 (최대 100자)
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
AnalyticsEvents.logError({
  errorType: 'network_error',
  errorMessage: 'Failed to connect to server',
});
```

**주의:** Critical 크래시는 Sentry로 전송되므로, 이 이벤트는 비크래시 오류에만 사용하세요.

---

### `permission_denied`

권한이 거부될 때 기록됩니다.

**Parameters:**
- `permission_type` (string): 권한 타입 (`location`, `storage`, etc.)
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
AnalyticsEvents.logPermissionDenied({
  permissionType: 'location',
});
```

**분석 목적:**
- 어떤 권한이 자주 거부되는지
- 권한 거부율 추적

---

### `permission_granted`

권한이 허용될 때 기록됩니다.

**Parameters:**
- `permission_type` (string): 권한 타입
- `timestamp` (number): 타임스탬프

**분석 목적:**
- 권한 허용율 추적

---

## Feedback Events

### `feedback_submitted`

사용자가 피드백을 제출할 때 기록됩니다.

**Parameters:**
- `feedback_type` (string): 피드백 타입 (`bug`, `feature`, `general`)
- `has_email` (boolean): 이메일 제공 여부
- `timestamp` (number): 타임스탬프

**Example:**
```typescript
AnalyticsEvents.logFeedbackSubmitted({
  feedbackType: 'bug',
  hasEmail: true,
});
```

**분석 목적:**
- 피드백 제출 빈도
- 피드백 타입 분포 (버그 vs 기능 요청)

---

## User Engagement Events

### `tutorial_completed`

튜토리얼 단계가 완료될 때 기록됩니다.

**Parameters:**
- `step_number` (number): 완료된 단계 번호
- `timestamp` (number): 타임스탬프

**분석 목적:**
- 튜토리얼 완료율
- 어느 단계에서 이탈하는지

---

### `share`

사용자가 앱 또는 세션을 공유할 때 기록됩니다.

**Parameters:**
- `content_type` (string): 공유한 컨텐츠 타입 (`app`, `session`)
- `timestamp` (number): 타임스탬프

**분석 목적:**
- 공유 빈도
- 바이럴 계수 추정

---

## 🎯 User Properties

사용자 속성은 사용자 세그먼트를 정의하는 데 사용됩니다.

### `device_brand`

기기 브랜드 (예: `Samsung`, `Google`, `Xiaomi`)

**설정 방법:**
```typescript
import { AnalyticsUserProperties } from '@/events/analyticsEvents';
import DeviceInfo from 'react-native-device-info';

AnalyticsUserProperties.setDeviceInfo({
  deviceBrand: DeviceInfo.getBrand(),
  deviceModel: DeviceInfo.getModel(),
});
```

### `device_model`

기기 모델 (예: `Galaxy S23`, `Pixel 7`)

### `app_version`

앱 버전 (예: `0.1.0`)

### `user_type`

사용자 타입 (예: `researcher`, `student`, `general`)

### `total_recordings`

총 녹음 횟수

### `sync_enabled`

동기화 활성화 여부 (`true` or `false`)

### `app_open_count`

앱 실행 횟수

---

## 📈 주요 분석 지표

### 1. Retention (재방문율)

**이벤트:**
- `retention_day_1`: D1 retention (설치 후 1일)
- `retention_day_7`: D7 retention (설치 후 7일)
- `retention_day_30`: D30 retention (설치 후 30일)

**Firebase Console:**
- Analytics > Retention Cohorts
- 각 코호트의 D1, D7, D30 재방문율 확인

**목표:**
- D1: > 60%
- D7: > 40%
- D30: > 25%

---

### 2. Funnel Analysis (퍼널 분석)

**녹음 퍼널:**
```
app_opened (100%)
  ↓
recording_started (70%)
  ↓
recording_completed (90%)
  ↓
export_success (50%)
  ↓
sync_completed (40%)
```

**Firebase Console:**
- Analytics > Funnels > Create Funnel
- 각 단계별 전환율 확인

---

### 3. User Engagement (사용자 참여도)

**지표:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Sessions per user
- Average session duration

**Firebase Console:**
- Analytics > Engagement

---

### 4. Feature Usage (기능 사용률)

**가장 많이 사용되는 기능:**
- 녹음 시작 횟수 (`recording_started`)
- 내보내기 횟수 (`export_success`)
- 동기화 횟수 (`sync_completed`)

**Firebase Console:**
- Analytics > Events
- 각 이벤트별 발생 횟수 확인

---

## 🛠️ Analytics 구현 가이드

### 1. App.tsx에서 초기화

```typescript
// App.tsx
import { useEffect } from 'react';
import { retentionTracker } from '@/utils/retentionTracking';
import { AnalyticsUserProperties } from '@/events/analyticsEvents';
import DeviceInfo from 'react-native-device-info';

function App() {
  useEffect(() => {
    // Track app open on startup
    retentionTracker.trackAppOpen();

    // Set user properties
    AnalyticsUserProperties.setDeviceInfo({
      deviceBrand: DeviceInfo.getBrand(),
      deviceModel: DeviceInfo.getModel(),
    });
    AnalyticsUserProperties.setAppVersion(DeviceInfo.getVersion());
  }, []);

  return <RootNavigator />;
}
```

### 2. RecordingScreen.tsx 예시

```typescript
// screens/RecordingScreen.tsx
import { AnalyticsEvents } from '@/events/analyticsEvents';

const RecordingScreen = () => {
  const startRecording = async () => {
    const sessionId = generateSessionId();

    // Log event
    await AnalyticsEvents.logRecordingStarted({
      sessionId,
      sensorCount: enabledSensors.length,
    });

    // Start recording...
  };

  const stopRecording = async () => {
    const duration = calculateDuration();

    // Log event
    await AnalyticsEvents.logRecordingStopped({
      sessionId,
      duration,
      dataPointsCollected,
    });

    // Stop recording...
  };

  return (
    // UI...
  );
};
```

### 3. Navigation에서 Screen View 추적

```typescript
// navigation/RootNavigator.tsx
import { useNavigationContainerRef } from '@react-navigation/native';
import { analyticsService } from '@/utils/analytics';

const RootNavigator = () => {
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        // Track initial screen
        const currentRoute = navigationRef.getCurrentRoute();
        if (currentRoute) {
          analyticsService.logScreenView(currentRoute.name);
        }
      }}
      onStateChange={() => {
        // Track screen changes
        const currentRoute = navigationRef.getCurrentRoute();
        if (currentRoute) {
          analyticsService.logScreenView(currentRoute.name);
        }
      }}
    >
      {/* Screens... */}
    </NavigationContainer>
  );
};
```

---

## ✅ Analytics 체크리스트

### 초기 설정
- [ ] Firebase 프로젝트 생성
- [ ] `google-services.json` 다운로드 및 추가
- [ ] Firebase Analytics SDK 설치 (`@react-native-firebase/analytics`)
- [ ] `.env.production`에 `ENABLE_ANALYTICS=true` 설정

### 구현
- [ ] `App.tsx`에서 `retentionTracker.trackAppOpen()` 호출
- [ ] User Properties 설정 (device, app version 등)
- [ ] 주요 화면에서 `analyticsService.logScreenView()` 호출
- [ ] 핵심 이벤트 로깅 (녹음, 내보내기, 동기화 등)

### 테스트
- [ ] 개발 모드에서 이벤트 로그 확인 (console.log)
- [ ] Firebase Console > DebugView에서 실시간 이벤트 확인
- [ ] 프로덕션 빌드에서 이벤트 전송 확인

### 모니터링
- [ ] Firebase Console > Analytics > Events 정기 확인
- [ ] Retention Cohorts 추적
- [ ] Funnel Analysis 설정
- [ ] User Properties 세그먼트 생성

---

## 📚 참고 자료

- [Firebase Analytics 공식 문서](https://firebase.google.com/docs/analytics)
- [React Native Firebase Analytics](https://rnfirebase.io/analytics/usage)
- `src/utils/analytics.ts`: Analytics 서비스 구현
- `src/events/analyticsEvents.ts`: 이벤트 정의
- `src/utils/retentionTracking.ts`: Retention 추적

---

**마지막 업데이트**: 2025-01-16
**작성자**: KooDTX Team
**버전**: 1.0.0
