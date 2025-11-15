# 코드 문서화 가이드

## 개요

이 문서는 KooDTX 프로젝트의 코드 문서화 표준 및 베스트 프랙티스를 정의합니다.

## 문서화 원칙

### 1. 명확성 (Clarity)
- 코드의 **왜(Why)**를 설명하라, **무엇(What)**이 아니라
- 복잡한 로직은 반드시 주석으로 설명
- 가독성 좋은 코드는 주석보다 우선

### 2. 간결성 (Conciseness)
- 불필요한 주석 지양
- 자명한 코드에는 주석 불필요
- 핵심만 간결하게 작성

### 3. 일관성 (Consistency)
- 프로젝트 전체에서 동일한 스타일 유지
- JSDoc 형식 준수
- TypeScript 타입을 적극 활용

## JSDoc 주석 스타일

### 함수 문서화

**기본 형식**:
```typescript
/**
 * 함수의 간단한 설명 (한 줄)
 *
 * 더 자세한 설명이 필요한 경우 여기에 작성
 * - 목록 형태로 작성 가능
 * - 알고리즘 설명
 * - 제약사항 등
 *
 * @param paramName - 매개변수 설명
 * @param optionalParam - 선택적 매개변수 설명
 * @returns 반환값 설명
 * @throws {ErrorType} 에러 발생 조건
 *
 * @example
 * ```typescript
 * const result = functionName('value', true);
 * console.log(result); // 'expected output'
 * ```
 */
function functionName(paramName: string, optionalParam?: boolean): string {
  // 구현
}
```

**실제 예시**:
```typescript
/**
 * 센서 데이터를 버퍼에 저장하고 임계값 초과 시 배치 저장
 *
 * FIFO 큐를 사용하여 최대 100개의 데이터 포인트를 유지합니다.
 * 버퍼가 가득 차면 가장 오래된 데이터부터 제거됩니다.
 *
 * @param sensorId - 센서 고유 ID
 * @param data - 센서 데이터 객체
 * @param immediate - true일 경우 즉시 저장 (기본값: false)
 * @returns 버퍼에 저장된 데이터 개수
 * @throws {SensorNotFoundError} 센서가 등록되지 않은 경우
 *
 * @example
 * ```typescript
 * const count = sensorService.bufferData('accel-1', {
 *   x: 0.5, y: 0.2, z: 9.8, timestamp: Date.now()
 * });
 * console.log(`Buffered: ${count} items`);
 * ```
 */
public bufferData(
  sensorId: string,
  data: SensorData,
  immediate: boolean = false
): number {
  // 구현
}
```

### 클래스 문서화

```typescript
/**
 * 센서 데이터 수집 및 관리 서비스
 *
 * Singleton 패턴으로 구현되어 앱 전체에서 하나의 인스턴스만 사용됩니다.
 * 여러 센서(가속도계, 자이로스코프 등)를 동시에 관리하고,
 * 수집된 데이터를 버퍼링하여 배치 단위로 저장합니다.
 *
 * @example
 * ```typescript
 * const sensorService = new SensorService();
 * await sensorService.startSensor('accelerometer', { sampleRate: 50 });
 * ```
 */
class SensorService {
  private static instance: SensorService;

  /**
   * Singleton 인스턴스 반환
   *
   * @returns SensorService 인스턴스
   */
  public static getInstance(): SensorService {
    if (!SensorService.instance) {
      SensorService.instance = new SensorService();
    }
    return SensorService.instance;
  }
}
```

### 인터페이스 문서화

```typescript
/**
 * 센서 데이터 인터페이스
 *
 * 모든 센서 데이터는 이 인터페이스를 구현해야 합니다.
 */
export interface SensorData {
  /** 센서 고유 ID */
  sensorId: string;

  /** 측정값 */
  value: number;

  /** Unix timestamp (밀리초) */
  timestamp: number;

  /** 측정 단위 (예: m/s², deg/s) */
  unit: string;

  /** 추가 메타데이터 (선택사항) */
  metadata?: Record<string, any>;
}
```

### 타입 문서화

```typescript
/**
 * 센서 타입 정의
 *
 * - accelerometer: 가속도계 (m/s²)
 * - gyroscope: 자이로스코프 (deg/s)
 * - magnetometer: 자기계 (μT)
 * - gps: GPS (위도/경도)
 */
export type SensorType =
  | 'accelerometer'
  | 'gyroscope'
  | 'magnetometer'
  | 'gps';

/**
 * 동기화 상태
 */
export type SyncStatus =
  | 'idle'      // 대기 중
  | 'syncing'   // 동기화 중
  | 'success'   // 성공
  | 'error';    // 실패
```

### Enum 문서화

```typescript
/**
 * 로그 레벨
 */
export enum LogLevel {
  /** 디버그 정보 (개발 환경만) */
  DEBUG = 'debug',

  /** 일반 정보 */
  INFO = 'info',

  /** 경고 */
  WARN = 'warn',

  /** 에러 */
  ERROR = 'error',

  /** 치명적 에러 (앱 크래시) */
  FATAL = 'fatal',
}
```

## 복잡한 로직 주석

### 알고리즘 설명

```typescript
/**
 * 센서 데이터 스무딩 (Moving Average Filter)
 */
private smoothData(data: number[], windowSize: number = 5): number[] {
  const result: number[] = [];

  // 슬라이딩 윈도우를 사용한 이동 평균 계산
  for (let i = 0; i < data.length; i++) {
    // 윈도우 범위 계산 (현재 인덱스 기준 앞뒤로 windowSize/2)
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));

    // 윈도우 내 평균 계산
    const window = data.slice(start, end);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;

    result.push(average);
  }

  return result;
}
```

### 비즈니스 로직 설명

```typescript
/**
 * 동기화 우선순위 결정
 *
 * 우선순위 계산 로직:
 * 1. 최근 24시간 이내 데이터: 높은 우선순위 (+100)
 * 2. 실패 횟수가 적을수록 우선순위 증가 (-failCount * 10)
 * 3. 데이터 크기가 작을수록 우선순위 증가 (-size / 1024)
 */
private calculatePriority(item: SyncItem): number {
  let priority = 0;

  // 최근 데이터 우선
  const ageInHours = (Date.now() - item.createdAt) / (1000 * 60 * 60);
  if (ageInHours < 24) {
    priority += 100;
  }

  // 실패 횟수 페널티
  priority -= item.failCount * 10;

  // 작은 파일 우선
  priority -= item.size / 1024;

  return priority;
}
```

### 성능 최적화 설명

```typescript
/**
 * 센서 데이터 배치 저장
 *
 * 성능 최적화:
 * - 단일 트랜잭션으로 여러 레코드 저장 (DB I/O 최소화)
 * - 배치 크기 100개로 제한 (메모리 사용량 제어)
 * - Non-blocking 방식으로 UI 스레드 차단 방지
 */
private async saveBatch(records: SensorDataRecord[]): Promise<void> {
  // WatermelonDB의 배치 write 사용
  await database.write(async () => {
    await database.batch(
      ...records.map(record =>
        sensorDataCollection.prepareCreate(record)
      )
    );
  });
}
```

## 특수 주석 태그

### TODO 주석

```typescript
/**
 * TODO: 센서 자동 보정 기능 추가
 * - 센서 드리프트 감지
 * - 자동 영점 조정
 * - 관련 이슈: #123
 */

// TODO(작성자): 에러 핸들링 개선 필요

// TODO: 성능 최적화 - 캐싱 추가 (우선순위: 높음)
```

### FIXME 주석

```typescript
// FIXME: 메모리 누수 발생 - 이벤트 리스너 정리 필요

/**
 * FIXME: Race condition 발생 가능
 * - 동시에 여러 센서 시작 시 충돌
 * - Lock 메커니즘 추가 필요
 */
```

### HACK 주석

```typescript
// HACK: 임시 해결책 - Android 10 버그 우회
// 정식 수정은 react-native-sensors 라이브러리 업데이트 대기 중

/**
 * HACK: iOS에서 백그라운드 위치 권한 이슈
 * - Apple 정책상 백그라운드 위치는 "Always" 권한 필요
 * - 임시로 포그라운드에서만 동작하도록 제한
 */
```

### NOTE 주석

```typescript
// NOTE: 이 함수는 UI 스레드에서 호출되므로 빠르게 실행되어야 함

/**
 * NOTE: WatermelonDB 제약사항
 * - Write는 반드시 database.write() 내부에서 실행
 * - 중첩된 write는 허용되지 않음
 */
```

## React 컴포넌트 문서화

### Functional Component

```typescript
/**
 * 센서 데이터 차트 컴포넌트
 *
 * Line Chart를 사용하여 센서 데이터를 시각화합니다.
 * 최대 100개의 데이터 포인트를 표시하며, 수평 스크롤을 지원합니다.
 *
 * @param props - 컴포넌트 props
 * @returns 렌더링된 차트 컴포넌트
 *
 * @example
 * ```tsx
 * <SensorChart
 *   data={sensorData}
 *   sensorType="accelerometer"
 *   showLegend={true}
 * />
 * ```
 */
export const SensorChart: React.FC<SensorChartProps> = ({
  data,
  sensorType,
  showLegend = false,
}) => {
  // 구현
};

/**
 * SensorChart Props
 */
export interface SensorChartProps {
  /** 센서 데이터 배열 */
  data: SensorData[];

  /** 센서 타입 */
  sensorType: SensorType;

  /** 범례 표시 여부 (기본값: false) */
  showLegend?: boolean;

  /** 차트 높이 (기본값: 220) */
  height?: number;

  /** 데이터 업데이트 시 콜백 */
  onDataUpdate?: (data: SensorData[]) => void;
}
```

### Custom Hook

```typescript
/**
 * 센서 데이터 수집 Hook
 *
 * 센서를 시작/중지하고 실시간 데이터를 수집합니다.
 * 컴포넌트 언마운트 시 자동으로 센서를 중지합니다.
 *
 * @param sensorType - 수집할 센서 타입
 * @param options - 센서 옵션
 * @returns 센서 상태 및 제어 함수
 *
 * @example
 * ```tsx
 * const { data, isRunning, start, stop } = useSensorCollection('accelerometer');
 *
 * // 센서 시작
 * await start({ sampleRate: 50 });
 *
 * // 데이터 사용
 * console.log(data);
 *
 * // 센서 중지
 * await stop();
 * ```
 */
export function useSensorCollection(
  sensorType: SensorType,
  options?: SensorOptions
): UseSensorCollectionReturn {
  // 구현
}

/**
 * useSensorCollection 반환 타입
 */
export interface UseSensorCollectionReturn {
  /** 수집된 센서 데이터 */
  data: SensorData[];

  /** 센서 실행 여부 */
  isRunning: boolean;

  /** 센서 시작 함수 */
  start: (options?: SensorOptions) => Promise<void>;

  /** 센서 중지 함수 */
  stop: () => Promise<void>;

  /** 에러 정보 */
  error: Error | null;
}
```

## 파일 헤더 주석

각 파일의 상단에 파일 목적을 설명하는 주석 추가:

```typescript
/**
 * @file SensorService.ts
 * @description 센서 데이터 수집 및 관리 서비스
 * @author KooDTX Team
 * @created 2024-01-15
 * @modified 2024-03-20
 */

import { ... } from '...';
```

## TypeScript 타입을 통한 문서화

TypeScript 타입 시스템을 적극 활용하여 코드 자체가 문서가 되도록 작성:

### 명확한 타입 정의

```typescript
// ❌ 나쁜 예
function process(data: any): any {
  // ...
}

// ✅ 좋은 예
function processSensorData(
  data: SensorData[],
  options: ProcessOptions
): ProcessedResult {
  // ...
}
```

### Utility Types 활용

```typescript
/**
 * API 요청 옵션
 *
 * Partial<T>를 사용하여 모든 필드가 선택사항임을 명시
 */
export type ApiRequestOptions = Partial<{
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}>;

/**
 * 센서 설정 업데이트
 *
 * Pick<T>을 사용하여 특정 필드만 업데이트 가능
 */
export type SensorConfigUpdate = Pick<
  SensorConfig,
  'sampleRate' | 'enabled'
>;
```

## 문서화 체크리스트

코드 리뷰 시 다음 항목을 확인:

- [ ] 모든 public 함수에 JSDoc 주석 작성
- [ ] 복잡한 알고리즘에 설명 주석 추가
- [ ] 인터페이스 및 타입에 설명 추가
- [ ] React 컴포넌트 Props 문서화
- [ ] Custom Hook 사용법 예시 포함
- [ ] TODO/FIXME 주석에 이슈 번호 포함
- [ ] 매직 넘버를 상수로 추출하고 주석 추가
- [ ] TypeScript 타입으로 의도 명확히 표현

## TypeDoc 사용 (선택사항)

### 설치

```bash
npm install --save-dev typedoc
```

### 설정

`typedoc.json`:
```json
{
  "entryPoints": ["src"],
  "out": "docs/api",
  "exclude": [
    "**/__tests__/**",
    "**/*.test.ts"
  ],
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "README.md"
}
```

### 문서 생성

```bash
# HTML 문서 생성
npx typedoc

# Markdown 문서 생성
npx typedoc --plugin typedoc-plugin-markdown
```

### package.json 스크립트 추가

```json
{
  "scripts": {
    "docs": "typedoc",
    "docs:watch": "typedoc --watch"
  }
}
```

## 베스트 프랙티스

### 1. 자명한 코드 작성

```typescript
// ❌ 주석이 필요한 나쁜 코드
const d = new Date();
const t = d.getTime();
const r = t + 86400000; // 하루 추가

// ✅ 주석이 필요 없는 좋은 코드
const currentDate = new Date();
const currentTimestamp = currentDate.getTime();
const oneDayInMs = 24 * 60 * 60 * 1000;
const tomorrowTimestamp = currentTimestamp + oneDayInMs;
```

### 2. 의미 있는 변수명

```typescript
// ❌ 나쁜 예
const d = users.filter(u => u.age > 18);

// ✅ 좋은 예
const adultUsers = users.filter(user => user.age > 18);
```

### 3. 함수는 하나의 역할만

```typescript
// ❌ 나쁜 예 - 여러 역할
function processData(data: any) {
  // 데이터 검증
  // 데이터 변환
  // 데이터 저장
  // 알림 전송
}

// ✅ 좋은 예 - 단일 책임
function validateData(data: SensorData): boolean { }
function transformData(data: SensorData): TransformedData { }
function saveData(data: TransformedData): Promise<void> { }
function sendNotification(message: string): Promise<void> { }
```

### 4. 주석 업데이트

코드를 수정할 때 관련 주석도 함께 업데이트:

```typescript
/**
 * 센서 데이터 저장
 *
 * UPDATED: 2024-03-20 - 배치 저장 로직 추가
 */
```

## 참고 자료

- [TSDoc 표준](https://tsdoc.org/)
- [TypeScript Deep Dive - JSDoc](https://basarat.gitbook.io/typescript/type-system/jsdoc)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

## 문서화 예시 파일

프로젝트에서 문서화가 잘 된 파일 예시:
- `src/services/NotificationService.ts` - 서비스 클래스 문서화
- `src/services/RecordingNotificationService.ts` - 복잡한 로직 설명
- `src/utils/logger.ts` - 유틸리티 함수 문서화
- `src/utils/sentry.ts` - 에러 처리 문서화
