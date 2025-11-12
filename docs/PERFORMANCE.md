# Performance Optimization Guide

KooDTX 앱의 성능 최적화 가이드입니다.

## 목차

1. [React 컴포넌트 최적화](#react-컴포넌트-최적화)
2. [리스트 렌더링 최적화](#리스트-렌더링-최적화)
3. [메모리 관리](#메모리-관리)
4. [번들 크기 최적화](#번들-크기-최적화)
5. [성능 모니터링](#성능-모니터링)
6. [Best Practices](#best-practices)

## React 컴포넌트 최적화

### React.memo 사용

불필요한 리렌더링을 방지하기 위해 `React.memo`를 사용합니다:

```typescript
import React from 'react';

interface SessionItemProps {
  session: RecordingSession;
  onPress: (id: string) => void;
}

export const SessionItem = React.memo<SessionItemProps>(
  ({session, onPress}) => {
    return (
      <TouchableOpacity onPress={() => onPress(session.id)}>
        <Text>{session.name}</Text>
      </TouchableOpacity>
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    return prevProps.session.id === nextProps.session.id;
  },
);
```

### useMemo와 useCallback

계산 비용이 큰 값과 함수를 메모이제이션:

```typescript
import {useMemo, useCallback} from 'react';

function SessionList({sessions}: Props) {
  // 계산 비용이 큰 값 메모이제이션
  const sortedSessions = useMemo(() => {
    return sessions.sort((a, b) => b.startTime - a.startTime);
  }, [sessions]);

  // 콜백 함수 메모이제이션
  const handlePress = useCallback(
    (id: string) => {
      navigation.navigate('Detail', {sessionId: id});
    },
    [navigation],
  );

  return (
    <FlatList
      data={sortedSessions}
      renderItem={({item}) => (
        <SessionItem session={item} onPress={handlePress} />
      )}
    />
  );
}
```

## 리스트 렌더링 최적화

### OptimizedFlatList 사용

성능 최적화된 FlatList 컴포넌트 사용:

```typescript
import {OptimizedFlatList} from '@utils/performance/OptimizedList';

function HistoryScreen() {
  return (
    <OptimizedFlatList
      data={sessions}
      itemHeight={80} // 고정 높이 지정 시 성능 향상
      renderItem={({item}) => <SessionItem session={item} />}
      keyExtractor={item => item.id}
    />
  );
}
```

### FlatList 최적화 설정

```typescript
<FlatList
  data={data}
  // 초기 렌더링 항목 수
  initialNumToRender={10}
  // 한 번에 렌더링할 배치 크기
  maxToRenderPerBatch={5}
  // 업데이트 빈도
  updateCellsBatchingPeriod={50}
  // 뷰포트 배수
  windowSize={5}
  // 화면 밖 항목 제거
  removeClippedSubviews={true}
  // 고정 높이 항목일 때 성능 향상
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 가상화 (Virtualization)

큰 리스트는 반드시 `FlatList` 또는 `SectionList` 사용:

```typescript
// ❌ 나쁜 예
{sessions.map(session => <SessionItem key={session.id} session={session} />)}

// ✅ 좋은 예
<FlatList
  data={sessions}
  renderItem={({item}) => <SessionItem session={item} />}
  keyExtractor={item => item.id}
/>
```

## 메모리 관리

### 구독 정리

useEffect에서 구독은 반드시 정리:

```typescript
useEffect(() => {
  const subscription = sensorService.subscribe(data => {
    setData(data);
  });

  // Cleanup
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 타이머 정리

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    updateData();
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);
```

### 대용량 데이터 처리

배치 처리 및 청크 단위 처리:

```typescript
async function processBatchData(data: SensorData[]) {
  const BATCH_SIZE = 100;

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await repository.saveBatch(batch);

    // UI 블로킹 방지
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

## 번들 크기 최적화

### 번들 분석

```bash
# 번들 크기 분석
npm run analyze

# 또는
npm run perf
```

### 동적 Import

필요할 때만 모듈 로드:

```typescript
// ❌ 나쁜 예
import Chart from 'react-native-chart-kit';

// ✅ 좋은 예
const Chart = React.lazy(() => import('react-native-chart-kit'));
```

### 의존성 최적화

1. **불필요한 의존성 제거**
```bash
npm uninstall unused-package
```

2. **가벼운 대안 사용**
```typescript
// moment.js (heavy) → date-fns (light)
import {format} from 'date-fns';

// lodash → lodash-es (tree-shakeable)
import debounce from 'lodash-es/debounce';
```

3. **peer dependencies 확인**
```bash
npm list --depth=0
```

## 성능 모니터링

### PerformanceMonitor 사용

```typescript
import {performanceMonitor} from '@utils/performance/PerformanceMonitor';

function loadData() {
  performanceMonitor.mark('loadData');

  // 데이터 로드 작업
  const data = await fetchData();

  performanceMonitor.measure('loadData');
  return data;
}

// 비동기 함수 측정
const data = await performanceMonitor.measureAsync(
  'fetchSensorData',
  () => repository.findAll(),
);

// 동기 함수 측정
const result = performanceMonitor.measureSync(
  'processData',
  () => processData(rawData),
);

// 통계 확인
const stats = performanceMonitor.getStats('loadData');
console.log(`Average: ${stats.avg}ms`);

// 리포트 출력
performanceMonitor.printReport();
```

### 렌더링 추적

```typescript
import {useRenderTracking} from '@utils/performance/PerformanceMonitor';

function MyComponent() {
  useRenderTracking('MyComponent');

  // Component logic
}
```

### Performance Metrics

React Native의 성능 지표:

```typescript
import {InteractionManager} from 'react-native';

// 애니메이션 완료 후 작업
InteractionManager.runAfterInteractions(() => {
  // Heavy computation
  processData();
});
```

## Best Practices

### 1. 이미지 최적화

```typescript
<Image
  source={{uri: imageUrl}}
  // 리사이징
  style={{width: 100, height: 100}}
  // 캐싱
  cache="force-cache"
  // 우선순위
  priority="high"
/>
```

### 2. 네트워크 요청 최적화

```typescript
// 디바운싱
const debouncedSearch = useCallback(
  debounce((query: string) => {
    searchData(query);
  }, 300),
  [],
);

// 병렬 요청
const [sessions, sensorData, audioFiles] = await Promise.all([
  sessionRepo.findAll(),
  dataRepo.findAll(),
  audioRepo.findAll(),
]);
```

### 3. 상태 업데이트 최적화

```typescript
// ❌ 나쁜 예 - 여러 번 렌더링
setCount(count + 1);
setLoading(false);
setError(null);

// ✅ 좋은 예 - 한 번만 렌더링
setState(prev => ({
  ...prev,
  count: prev.count + 1,
  loading: false,
  error: null,
}));
```

### 4. 조건부 렌더링

```typescript
// ❌ 나쁜 예
{data && data.length > 0 && <ExpensiveComponent data={data} />}

// ✅ 좋은 예
{data?.length > 0 && <ExpensiveComponent data={data} />}
```

### 5. Key 사용

```typescript
// ❌ 나쁜 예
{items.map((item, index) => <Item key={index} />)}

// ✅ 좋은 예
{items.map(item => <Item key={item.id} />)}
```

## 성능 체크리스트

- [ ] React.memo로 불필요한 리렌더링 방지
- [ ] useMemo/useCallback로 값/함수 메모이제이션
- [ ] FlatList 최적화 설정 적용
- [ ] getItemLayout 제공 (고정 높이 항목)
- [ ] 구독/타이머 정리
- [ ] 번들 크기 분석 및 최적화
- [ ] 성능 모니터링 설정
- [ ] 이미지 최적화
- [ ] 네트워크 요청 최적화
- [ ] 대용량 데이터 배치 처리

## 성능 목표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 앱 시작 시간 | < 3초 | Time to Interactive |
| 화면 전환 | < 300ms | Navigation performance |
| 리스트 스크롤 | 60 FPS | React Native Debugger |
| 메모리 사용량 | < 150MB | Xcode/Android Studio |
| 번들 크기 | < 5MB | npm run analyze |

## 참고 자료

- [React Native Performance](https://reactnative.dev/docs/performance)
- [React Optimization](https://react.dev/learn/render-and-commit)
- [FlatList Optimization](https://reactnative.dev/docs/optimizing-flatlist-configuration)
- [Metro Bundler](https://facebook.github.io/metro/)
