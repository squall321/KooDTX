# Phase 251-255 Implementation Guide

**고급 기능 구현 가이드** | Advanced Features Implementation Guide

이 문서는 Phase 251-255의 고급 기능 구현을 위한 가이드입니다.

---

## 📋 목차

1. [Phase 251: 데이터 시각화 개선](#phase-251-데이터-시각화-개선)
2. [Phase 252: 센서 데이터 분석 기능](#phase-252-센서-데이터-분석-기능)
3. [Phase 253: 머신러닝 모델 통합](#phase-253-머신러닝-모델-통합)
4. [Phase 254: 웹 대시보드](#phase-254-웹-대시보드)
5. [Phase 255: API 공개](#phase-255-api-공개)

---

## Phase 251: 데이터 시각화 개선

**예상 시간**: 8시간
**우선순위**: P2 - Medium (추천)

### 📝 작업 개요

고급 차트 라이브러리를 통합하여 센서 데이터를 더 풍부하게 시각화합니다.

### 🛠️ 필요한 패키지

```bash
# Victory Native - 강력한 React Native 차트 라이브러리
npm install victory-native

# 의존성
npm install react-native-svg
```

### 📁 생성할 파일 구조

```
src/
├── components/
│   └── charts/
│       ├── MultiLineChart.tsx      # 다중 라인 차트
│       ├── AreaChart.tsx            # 영역 차트
│       ├── BarChart.tsx             # 막대 차트
│       ├── ScatterPlot.tsx          # 산점도
│       └── ChartConfig.ts           # 차트 설정
├── screens/
│   └── DataVisualizationScreen.tsx  # 시각화 메인 화면
└── utils/
    └── statistics.ts                # 통계 계산 유틸리티
```

### 🔧 구현 단계

#### Step 1: 통계 유틸리티 구현

**파일**: `src/utils/statistics.ts`

```typescript
export interface Statistics {
  mean: number;        // 평균
  median: number;      // 중앙값
  mode: number;        // 최빈값
  stdDev: number;      // 표준편차
  variance: number;    // 분산
  min: number;         // 최소값
  max: number;         // 최대값
  range: number;       // 범위
  sum: number;         // 합계
  count: number;       // 개수
  quartiles: [number, number, number]; // Q1, Q2, Q3
}

export function calculateStatistics(data: number[]): Statistics {
  // 구현 필요
}

export function calculateMovingAverage(data: number[], windowSize: number): number[] {
  // 구현 필요
}

export function detectOutliers(data: number[], method: 'zscore' | 'iqr'): number[] {
  // 구현 필요
}
```

#### Step 2: Multi-Line Chart 컴포넌트

**파일**: `src/components/charts/MultiLineChart.tsx`

```typescript
import React from 'react';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';

interface DataPoint {
  x: number; // timestamp or index
  y: number; // value
}

interface MultiLineChartProps {
  datasets: {
    data: DataPoint[];
    label: string;
    color: string;
  }[];
  width?: number;
  height?: number;
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  datasets,
  width = 350,
  height = 250,
}) => {
  return (
    <VictoryChart width={width} height={height} theme={VictoryTheme.material}>
      <VictoryAxis />
      <VictoryAxis dependentAxis />
      {datasets.map((dataset, index) => (
        <VictoryLine
          key={index}
          data={dataset.data}
          style={{
            data: { stroke: dataset.color },
          }}
        />
      ))}
    </VictoryChart>
  );
};
```

#### Step 3: 데이터 시각화 화면

**파일**: `src/screens/DataVisualizationScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { MultiLineChart } from '@/components/charts/MultiLineChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChart } from '@/components/charts/BarChart';
import { ScatterPlot } from '@/components/charts/ScatterPlot';

interface DataVisualizationScreenProps {
  sessionId: string;
}

export const DataVisualizationScreen: React.FC<DataVisualizationScreenProps> = ({
  sessionId,
}) => {
  const [selectedChart, setSelectedChart] = useState<'line' | 'area' | 'bar' | 'scatter'>('line');

  // TODO: Load sensor data from database
  const sensorData = {
    accelerometer: [/* ... */],
    gyroscope: [/* ... */],
    gps: [/* ... */],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Data Visualization</Text>

      {/* Chart Type Selector */}
      {/* TODO: Implement chart type selector */}

      {/* Charts */}
      {selectedChart === 'line' && (
        <MultiLineChart
          datasets={[
            {
              data: sensorData.accelerometer,
              label: 'Accelerometer X',
              color: '#FF6384',
            },
            {
              data: sensorData.gyroscope,
              label: 'Gyroscope X',
              color: '#36A2EB',
            },
          ]}
        />
      )}

      {/* Statistics Summary */}
      {/* TODO: Show statistics */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
});
```

### ✅ 완료 기준

- [ ] Victory Native 설치 및 설정
- [ ] 5개 차트 타입 구현 (Multi-line, Area, Bar, Scatter, Box plot)
- [ ] 통계 계산 함수 (mean, median, stdDev 등)
- [ ] 차트 커스터마이징 UI (색상, 축 범위)
- [ ] 차트를 이미지로 내보내기 (react-native-view-shot)

---

## Phase 252: 센서 데이터 분석 기능

**예상 시간**: 10시간
**우선순위**: P2 - Medium (추천)

### 📝 작업 개요

센서 데이터에 대한 고급 분석 기능을 구현합니다.

### 🛠️ 필요한 패키지

```bash
# 통계 및 분석
npm install simple-statistics

# FFT (선택사항)
npm install fft.js

# PDF 리포트 생성 (선택사항)
npm install react-native-html-to-pdf
```

### 📁 생성할 파일 구조

```
src/
├── utils/
│   ├── dataAnalysis.ts              # 데이터 분석 함수
│   ├── fft.ts                       # FFT 분석 (선택)
│   └── reportGenerator.ts           # 리포트 생성
└── screens/
    └── AnalysisScreen.tsx           # 분석 화면
```

### 🔧 구현 단계

#### Step 1: 데이터 분석 유틸리티

**파일**: `src/utils/dataAnalysis.ts`

```typescript
import * as ss from 'simple-statistics';

export class DataAnalysis {
  /**
   * Calculate basic statistics
   */
  static calculateStatistics(data: number[]) {
    return {
      mean: ss.mean(data),
      median: ss.median(data),
      mode: ss.mode(data),
      stdDev: ss.standardDeviation(data),
      variance: ss.variance(data),
      min: ss.min(data),
      max: ss.max(data),
      quantile: [
        ss.quantile(data, 0.25),  // Q1
        ss.quantile(data, 0.5),   // Q2 (median)
        ss.quantile(data, 0.75),  // Q3
      ],
    };
  }

  /**
   * Detect outliers using Z-score method
   */
  static detectOutliersZScore(data: number[], threshold: number = 3): number[] {
    const mean = ss.mean(data);
    const stdDev = ss.standardDeviation(data);

    return data.map((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      return zScore > threshold ? index : -1;
    }).filter(index => index !== -1);
  }

  /**
   * Detect outliers using IQR method
   */
  static detectOutliersIQR(data: number[]): number[] {
    const q1 = ss.quantile(data, 0.25);
    const q3 = ss.quantile(data, 0.75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.map((value, index) => {
      return value < lowerBound || value > upperBound ? index : -1;
    }).filter(index => index !== -1);
  }

  /**
   * Detect peaks in signal
   */
  static detectPeaks(data: number[], threshold: number = 0.5): number[] {
    const peaks: number[] = [];
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > threshold) {
        peaks.push(i);
      }
    }
    return peaks;
  }

  /**
   * Calculate moving average
   */
  static movingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length - windowSize + 1; i++) {
      const window = data.slice(i, i + windowSize);
      result.push(ss.mean(window));
    }
    return result;
  }
}
```

#### Step 2: 분석 화면

**파일**: `src/screens/AnalysisScreen.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { DataAnalysis } from '@/utils/dataAnalysis';

interface AnalysisScreenProps {
  sessionId: string;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ sessionId }) => {
  const [stats, setStats] = useState<any>(null);
  const [outliers, setOutliers] = useState<number[]>([]);

  useEffect(() => {
    // TODO: Load sensor data
    const sensorData = [/* ... */];

    // Calculate statistics
    const statistics = DataAnalysis.calculateStatistics(sensorData);
    setStats(statistics);

    // Detect outliers
    const outlierIndices = DataAnalysis.detectOutliersZScore(sensorData);
    setOutliers(outlierIndices);
  }, [sessionId]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Data Analysis</Text>

      {/* Statistics */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <Text>Mean: {stats.mean.toFixed(2)}</Text>
          <Text>Median: {stats.median.toFixed(2)}</Text>
          <Text>Std Dev: {stats.stdDev.toFixed(2)}</Text>
          <Text>Min: {stats.min.toFixed(2)}</Text>
          <Text>Max: {stats.max.toFixed(2)}</Text>
        </View>
      )}

      {/* Outliers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Outliers Detected</Text>
        <Text>{outliers.length} outliers found</Text>
      </View>

      {/* TODO: Add charts, pattern recognition, report export */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});
```

### ✅ 완료 기준

- [ ] simple-statistics 통합
- [ ] 이상치 탐지 알고리즘 (Z-score, IQR)
- [ ] 패턴 인식 (Peak detection, Moving average)
- [ ] PDF 리포트 생성 (선택사항)

---

## Phase 253: 머신러닝 모델 통합

**예상 시간**: 16시간
**우선순위**: P3 - Low (선택)

### 📝 작업 개요

TensorFlow Lite를 사용하여 활동 인식 모델을 통합합니다.

### 🛠️ 필요한 패키지

```bash
# TensorFlow.js for React Native
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
npm install @react-native-async-storage/async-storage
npm install expo-gl  # For WebGL backend
```

### 📁 생성할 파일 구조

```
src/
├── ml/
│   ├── models/                      # 모델 파일 (.tflite)
│   │   └── activity_recognition.tflite
│   ├── inference.ts                 # 추론 엔진
│   └── preprocessing.ts             # 데이터 전처리
└── screens/
    └── ActivityRecognitionScreen.tsx
```

### 🔧 구현 단계

#### Step 1: TensorFlow 설정

**파일**: `src/ml/inference.ts`

```typescript
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

export class ActivityRecognition {
  private model: tf.LayersModel | null = null;
  private isReady = false;

  async initialize() {
    // Initialize TensorFlow.js
    await tf.ready();

    // Load model
    // this.model = await tf.loadLayersModel('path/to/model.json');

    this.isReady = true;
    console.log('[ML] Model initialized');
  }

  async predict(sensorData: number[][]): Promise<string> {
    if (!this.model || !this.isReady) {
      throw new Error('Model not initialized');
    }

    // Preprocess data
    const input = tf.tensor2d(sensorData);

    // Run inference
    const output = this.model.predict(input) as tf.Tensor;
    const predictions = await output.data();

    // Get activity label
    const activityIndex = predictions.indexOf(Math.max(...Array.from(predictions)));
    const activities = ['walking', 'running', 'sitting', 'standing', 'stairs'];

    input.dispose();
    output.dispose();

    return activities[activityIndex];
  }
}

export const activityRecognition = new ActivityRecognition();
```

#### Step 2: 활동 인식 화면

**파일**: `src/screens/ActivityRecognitionScreen.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { activityRecognition } from '@/ml/inference';

export const ActivityRecognitionScreen: React.FC = () => {
  const [currentActivity, setCurrentActivity] = useState<string>('Unknown');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeML();
  }, []);

  const initializeML = async () => {
    try {
      await activityRecognition.initialize();
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize ML:', error);
    }
  };

  // TODO: Implement real-time inference loop

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading ML model...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Recognition</Text>
      <View style={styles.activityCard}>
        <Text style={styles.activityLabel}>Current Activity:</Text>
        <Text style={styles.activityValue}>{currentActivity}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  activityCard: {
    padding: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
  },
  activityLabel: {
    fontSize: 16,
    color: '#666',
  },
  activityValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
});
```

### ✅ 완료 기준

- [ ] TensorFlow Lite 설치 및 설정
- [ ] 활동 인식 모델 통합
- [ ] 실시간 추론 구현
- [ ] 결과 화면 구현

---

## Phase 254: 웹 대시보드

**예상 시간**: 20시간
**우선순위**: P3 - Low (선택)

### 📝 작업 개요

React 웹 앱을 생성하여 데이터를 시각화합니다.

### 🔧 구현 단계

#### Step 1: React 앱 생성

```bash
# 프로젝트 루트에서
npx create-react-app web-dashboard --template typescript
cd web-dashboard
npm install recharts axios react-router-dom
```

#### Step 2: 프로젝트 구조

```
web-dashboard/
├── src/
│   ├── components/
│   │   ├── SessionList.tsx
│   │   ├── DataChart.tsx
│   │   └── StatisticsCard.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── SessionDetail.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   └── index.tsx
└── package.json
```

#### Step 3: API 서비스

**파일**: `web-dashboard/src/services/api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  // Sessions
  getSessions: () => axios.get(`${API_BASE_URL}/sessions`),
  getSession: (id: string) => axios.get(`${API_BASE_URL}/sessions/${id}`),

  // Data
  getSensorData: (sessionId: string, sensorType: string) =>
    axios.get(`${API_BASE_URL}/sessions/${sessionId}/data/${sensorType}`),

  // Auth
  login: (email: string, password: string) =>
    axios.post(`${API_BASE_URL}/auth/login`, { email, password }),
};
```

### ✅ 완료 기준

- [ ] React 웹 앱 생성
- [ ] API 연동
- [ ] 세션 목록 및 상세 보기
- [ ] 데이터 차트 표시
- [ ] Vercel/Netlify 배포

---

## Phase 255: API 공개

**예상 시간**: 12시간
**우선순위**: P4 - Low (선택)

### 📝 작업 개요

공개 API를 설계하고 개발자 포털을 생성합니다.

### 🔧 구현 단계

#### Step 1: API 키 시스템

**파일**: `server/middleware/apiKey.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

interface APIKey {
  id: string;
  key: string;
  userId: string;
  rateLimit: number;
  createdAt: Date;
}

export const validateAPIKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // TODO: Validate API key in database
  // TODO: Check rate limit
  // TODO: Log usage

  next();
};
```

#### Step 2: Rate Limiting

```bash
npm install express-rate-limit
```

**파일**: `server/middleware/rateLimit.ts`

```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: 'Too many requests from this API key',
  standardHeaders: true,
  legacyHeaders: false,
});
```

#### Step 3: 공개 API 엔드포인트

**파일**: `server/routes/public-api.ts`

```typescript
import express from 'express';
import { validateAPIKey } from '../middleware/apiKey';
import { apiLimiter } from '../middleware/rateLimit';

const router = express.Router();

// Apply middleware
router.use(validateAPIKey);
router.use(apiLimiter);

// Public API endpoints
router.get('/sessions', async (req, res) => {
  // Get user's sessions
  // TODO: Implement
});

router.get('/sessions/:id/data', async (req, res) => {
  // Get session data
  // TODO: Implement
});

export default router;
```

### ✅ 완료 기준

- [ ] API 키 생성 및 관리 시스템
- [ ] Rate limiting 구현
- [ ] 공개 API 엔드포인트
- [ ] Swagger/OpenAPI 문서

---

## 🚀 빠른 시작 가이드

### 우선순위 순서

1. **Phase 251** (데이터 시각화) - 사용자 경험 개선에 직접적 영향
2. **Phase 252** (데이터 분석) - 앱의 가치를 높임
3. **Phase 256** (내보내기 확장) - 사용자 요구사항
4. **Phase 254** (웹 대시보드) - 추가 가치 제공
5. **Phase 253** (ML 모델) - 고급 기능, 선택사항
6. **Phase 255** (API 공개) - 엔터프라이즈용, 선택사항

### 패키지 설치 한 번에

```bash
# Phase 251 & 252
npm install victory-native react-native-svg simple-statistics

# Phase 253 (선택)
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native expo-gl

# 기타 유용한 패키지
npm install react-native-view-shot  # 차트 캡처
npm install fft.js  # FFT 분석 (선택)
```

---

**마지막 업데이트**: 2025-01-16
**작성자**: KooDTX Team
**버전**: 1.0.0

이 가이드는 Phase 251-255의 구현을 위한 출발점입니다. 각 Phase를 순차적으로 진행하며 필요에 따라 조정하세요.
