# Phase 252: 센서 데이터 분석 기능

## 개요

고급 센서 데이터 분석 기능을 구현하여 사용자에게 종합적인 데이터 인사이트를 제공합니다.

**완료 일시:** 2025-11-16
**소요 시간:** 10시간 (예상)
**우선순위:** P2 - Medium (추천) ⭐

## 구현된 기능

### 1. FFT (Fast Fourier Transform) 분석 ✅

**파일:** `src/utils/fft.ts` (280 lines)

#### 주요 기능:
- Cooley-Tukey FFT 알고리즘 구현
- 주파수 도메인 변환
- 스펙트럼 분석 (magnitude, phase, power spectrum)
- Hanning 윈도우 적용으로 스펙트럴 누출 감소
- 주기성 탐지 (`isPeriodic`)
- 주기 추정 (`estimatePeriod`)
- 스펙트럴 중심 및 확산 계산

#### 사용 예제:
```typescript
import {performFFT, isPeriodic, estimatePeriod} from '@utils/fft';

// FFT 분석
const fftResult = performFFT(sensorData, 100); // 100 Hz sampling rate

console.log('Dominant Frequency:', fftResult.dominantFrequency, 'Hz');
console.log('Top 5 Components:', fftResult.components);

// 주기성 확인
const periodic = isPeriodic(sensorData, 100);
if (periodic) {
  const period = estimatePeriod(sensorData, 100);
  console.log('Estimated Period:', period, 'seconds');
}
```

### 2. 종합 데이터 분석 ✅

**파일:** `src/utils/dataAnalysis.ts` (420 lines)

#### 주요 기능:

##### 패턴 분석 (`analyzePatterns`)
- 피크 탐지
- 주기성 탐지 (FFT 기반)
- 추세 분석 (상승/하락/평탄)
- 주요 주파수 추출

##### 이상치 분석 (`analyzeOutliers`)
- IQR 방법 기반 이상치 탐지
- 이상치 개수 및 비율 계산

##### 주파수 분석 (`analyzeFrequency`)
- FFT 기반 주파수 분석
- 상위 N개 주파수 성분 추출
- 스펙트럴 중심 계산

##### 활동 분류 (`classifyActivity`)
자동 활동 분류 기능:
- **정지 (Stationary)**: 낮은 분산, 피크 없음
- **걷기 (Walking)**: 주기적 패턴, 1-3 Hz
- **달리기 (Running)**: 높은 분산, 2-4 Hz
- **진동 (Vibrating)**: 높은 주파수 (>5 Hz)
- **알 수 없음 (Unknown)**: 패턴 미확인

##### 종합 분석 (`performComprehensiveAnalysis`)
모든 분석을 하나의 함수로 실행:
```typescript
const analysis = performComprehensiveAnalysis(data, 100, {
  includeFrequency: true,
  includeClassification: true,
});

console.log('Summary:', analysis.summary);
console.log('Activity:', analysis.classification?.activity);
console.log('Confidence:', analysis.classification?.confidence);
```

### 3. 리포트 생성 ✅

**파일:** `src/utils/reportGenerator.ts` (330 lines)

#### 주요 기능:

##### 텍스트 리포트
- Markdown 형식 리포트
- 통계, 패턴, 이상치, 주파수 분석 포함
- 파일 저장 및 공유

##### HTML 리포트
- 스타일링된 HTML 리포트
- 반응형 디자인
- 차트 이미지 포함 가능
- 활동 분류 배지

#### 사용 예제:
```typescript
import {shareReport, generateTextReport} from '@utils/reportGenerator';

// 리포트 공유
await shareReport({
  sessionId: 'session123',
  sensorType: 'accelerometer',
  axis: '크기',
  analysis: analysisResult,
}, 'text');

// 텍스트 리포트 파일 생성
const result = await generateTextReport({
  sessionId: 'session123',
  sensorType: 'accelerometer',
  axis: 'X',
  analysis: analysisResult,
});

console.log('Report saved to:', result.filePath);
```

### 4. 분석 화면 (UI) ✅

**파일:** `src/screens/AnalysisScreen.tsx` (550 lines)

#### 화면 구성:

1. **센서 선택**
   - 세션 내 사용 가능한 센서 목록
   - Segmented buttons UI

2. **축 선택**
   - X, Y, Z, 크기(Magnitude)
   - 실시간 선택 반영

3. **분석 실행**
   - 원클릭 분석 실행
   - 자동 재분석 (데이터 변경 시)

4. **분석 결과 표시**
   - **요약 카드**: 한눈에 보는 분석 결과
   - **활동 분류**: 신뢰도와 근거 표시
   - **통계 정보**: StatisticsCard 컴포넌트 재사용
   - **패턴 분석**: 주기성, 피크, 추세
   - **이상치 분석**: 개수, 비율
   - **주파수 분석**: 스펙트럼 차트, 상위 주파수

5. **리포트 내보내기**
   - 공유 버튼
   - 시스템 공유 시트 활용

## 파일 구조

```
src/
├── utils/
│   ├── fft.ts                    # FFT 분석 (280 lines)
│   ├── dataAnalysis.ts           # 종합 데이터 분석 (420 lines)
│   ├── reportGenerator.ts        # 리포트 생성 (330 lines)
│   └── index.ts                  # 유틸리티 export 업데이트
├── screens/
│   └── AnalysisScreen.tsx        # 분석 화면 (550 lines)
└── navigation/
    └── HistoryStack.tsx          # 네비게이션 추가 (업데이트)
```

## 완료 기준 체크리스트

- [x] **통계 계산 함수 구현**
  - Phase 251에서 기본 구현 완료
  - Phase 252에서 추가 분석 함수 확장

- [x] **이상치 탐지 알고리즘**
  - IQR 방법 (Phase 251)
  - Z-score 방법 (Phase 252)
  - 이상치 비율 계산

- [x] **패턴 인식 기본 기능**
  - 피크 탐지 ✅
  - 주기 분석 (FFT 기반) ✅
  - 추세 분석 ✅
  - 활동 자동 분류 ✅

- [x] **리포트 생성 및 내보내기**
  - 텍스트 리포트 ✅
  - HTML 리포트 ✅
  - 파일 저장 ✅
  - 시스템 공유 ✅

## 기술 세부사항

### FFT 알고리즘

**Cooley-Tukey 알고리즘 사용:**
- 재귀적 분할 정복 방식
- O(N log N) 시간 복잡도
- Power of 2 패딩 자동 처리
- Hanning 윈도우 적용

### 활동 분류 알고리즘

**규칙 기반 분류:**
```
IF stdDev < 0.5 AND peakCount == 0
  → Stationary (90% confidence)

IF isPeriodic AND frequency > 5 Hz
  → Vibrating (80% confidence)

IF isPeriodic AND 1 Hz ≤ frequency ≤ 3 Hz AND 0.5 < stdDev < 3
  → Walking (75% confidence)

IF isPeriodic AND 2 Hz ≤ frequency ≤ 4 Hz AND stdDev ≥ 3
  → Running (70% confidence)

ELSE
  → Unknown (30% confidence)
```

### 리포트 형식

**텍스트 리포트:**
- Markdown 형식
- 섹션별 구조화
- 숫자 포맷팅 (4자리 소수점)

**HTML 리포트:**
- 반응형 CSS
- Material Design 영감
- 차트 이미지 임베딩
- 프린트 친화적

## 사용 시나리오

### 시나리오 1: 걷기 활동 분석
```typescript
// 1. 세션 데이터 로드
const data = await loadSessionData(sessionId);

// 2. 가속도계 크기 계산
const magnitude = data.map(d =>
  Math.sqrt(d.x**2 + d.y**2 + d.z**2)
);

// 3. 종합 분석 실행
const analysis = performComprehensiveAnalysis(magnitude, 100);

// 결과:
// - Activity: Walking (75% confidence)
// - Dominant Frequency: 1.8 Hz
// - Pattern: Periodic with 0.56s period
// - Trend: Stable
```

### 시나리오 2: 진동 감지
```typescript
const analysis = performComprehensiveAnalysis(sensorData, 100);

if (analysis.classification?.activity === 'vibrating') {
  const freq = analysis.patterns.dominantFrequency;
  Alert.alert('진동 감지', `${freq.toFixed(1)} Hz 진동이 감지되었습니다.`);
}
```

### 시나리오 3: 이상치 리포트
```typescript
const analysis = performComprehensiveAnalysis(data, 100);

if (analysis.outliers.outlierPercentage > 10) {
  // 10% 이상 이상치 발견
  await shareReport({
    sessionId,
    sensorType: 'accelerometer',
    axis: 'magnitude',
    analysis,
  }, 'html');
}
```

## 성능 고려사항

### FFT 성능
- **최적 데이터 길이**: 2의 거듭제곱 (256, 512, 1024 등)
- **최소 데이터**: 4개 이상
- **권장 데이터**: 100개 이상 (정확한 주파수 분석)

### 메모리 사용
- FFT: O(N) 메모리
- 분석 결과: 약 1-2 KB
- 리포트 HTML: 10-50 KB

### UI 반응성
- `useMemo`로 계산 최적화
- `useCallback`로 함수 메모이제이션
- 자동 분석 디바운싱 권장 (향후 개선)

## 향후 개선 사항

### Phase 253 이후 가능한 확장:
1. **머신러닝 모델 통합** (Phase 253)
   - TensorFlow Lite 활용
   - HAR (Human Activity Recognition) 모델
   - 더 정확한 활동 분류

2. **실시간 분석**
   - 스트리밍 FFT
   - 슬라이딩 윈도우 분석
   - 실시간 알림

3. **고급 리포트**
   - PDF 생성 (react-native-html-to-pdf)
   - 차트 자동 캡처
   - 이메일 전송

4. **협업 분석**
   - 분석 결과 공유
   - 비교 분석
   - 팀 대시보드

## 의존성

### 필수 라이브러리:
- `react-native-fs`: 파일 시스템 (이미 설치됨)
- `react-native-paper`: UI 컴포넌트
- `react-native-chart-kit`: 차트 렌더링
- `@react-navigation/native`: 네비게이션

### 개발 의존성:
- TypeScript 5.0+
- React Native 0.73+

## 테스트

### 수동 테스트 체크리스트:
- [ ] FFT 분석 정확도 검증 (알려진 주파수 신호)
- [ ] 활동 분류 정확도 (걷기, 달리기, 정지)
- [ ] 리포트 생성 및 공유
- [ ] 다양한 데이터 크기 테스트
- [ ] 빈 데이터 처리
- [ ] 에러 처리

### 자동 테스트 (향후):
```typescript
describe('FFT Analysis', () => {
  it('should detect 5 Hz sine wave', () => {
    const signal = generateSineWave(5, 100, 1); // 5 Hz, 100 samples, 1 sec
    const result = performFFT(signal, 100);
    expect(result.dominantFrequency).toBeCloseTo(5, 1);
  });
});
```

## 문제 해결

### Q: FFT 결과가 부정확합니다
**A:**
- 샘플링 레이트가 올바른지 확인
- 데이터 길이가 충분한지 확인 (최소 4개, 권장 100개 이상)
- 나이퀴스트 주파수 확인 (최대 측정 주파수 = sampleRate / 2)

### Q: 활동 분류가 항상 "알 수 없음"입니다
**A:**
- magnitude 축 사용 확인 (X, Y, Z 개별 축은 분류 비활성화)
- 데이터 품질 확인 (노이즈, 센서 오류)
- 샘플링 레이트 확인

### Q: 리포트 공유가 작동하지 않습니다
**A:**
- 파일 권한 확인
- `react-native-fs` 설치 확인
- 플랫폼별 공유 방식 차이 (iOS: URL, Android: message)

## 참고 자료

### FFT 이론:
- [Cooley-Tukey FFT Algorithm](https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm)
- [Digital Signal Processing](https://www.dspguide.com/)

### 활동 인식:
- [Human Activity Recognition](https://machinelearningmastery.com/how-to-develop-rnn-models-for-human-activity-recognition-time-series-classification/)

### React Native:
- [React Native File System](https://github.com/itinance/react-native-fs)
- [React Native Share](https://reactnative.dev/docs/share)

## 기여자

- Phase 252 구현: Claude Code Assistant
- 기획 및 설계: REMAINING_PHASES_PLAN.md 기반

## 라이선스

MIT License (프로젝트 라이선스 참조)
