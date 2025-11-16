# KooDTX Web Dashboard

**React 기반 웹 대시보드** | React-based Web Dashboard

센서 데이터를 웹 브라우저에서 시각화하고 분석하는 대시보드입니다.

---

## 📋 개요

KooDTX 웹 대시보드는 모바일 앱에서 수집된 센서 데이터를 웹 브라우저에서 확인하고 분석할 수 있는 도구입니다.

### 주요 기능

- 📊 **데이터 시각화**: 센서 데이터를 다양한 차트로 표시
- 📁 **세션 관리**: 모든 녹음 세션 목록 및 상세 보기
- 📈 **통계 분석**: 실시간 통계 및 분석 결과
- 🔐 **사용자 인증**: 안전한 로그인 시스템
- 💾 **데이터 다운로드**: CSV/JSON 형식으로 다운로드

---

## 🚀 빠른 시작

### 1. 프로젝트 생성

```bash
# 프로젝트 루트 디렉토리에서
npx create-react-app web-dashboard --template typescript
cd web-dashboard
```

### 2. 필요한 패키지 설치

```bash
# 차트 라이브러리
npm install recharts

# API 통신
npm install axios

# 라우팅
npm install react-router-dom

# UI 라이브러리 (선택사항)
npm install @mui/material @emotion/react @emotion/styled

# 상태 관리 (선택사항)
npm install zustand
```

### 3. 프로젝트 구조

```
web-dashboard/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/           # 재사용 컴포넌트
│   │   ├── SessionList.tsx
│   │   ├── DataChart.tsx
│   │   ├── StatisticsCard.tsx
│   │   └── Header.tsx
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── Dashboard.tsx     # 메인 대시보드
│   │   ├── SessionDetail.tsx # 세션 상세 보기
│   │   ├── Login.tsx         # 로그인 페이지
│   │   └── Settings.tsx      # 설정 페이지
│   ├── services/             # API 서비스
│   │   └── api.ts
│   ├── types/                # TypeScript 타입
│   │   └── index.ts
│   ├── App.tsx               # 메인 App 컴포넌트
│   ├── index.tsx             # 엔트리 포인트
│   └── index.css
├── package.json
└── tsconfig.json
```

### 4. API 서비스 구현

**파일**: `src/services/api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sessionAPI = {
  // Get all sessions
  getAll: () => api.get('/sessions'),

  // Get session by ID
  getById: (id: string) => api.get(`/sessions/${id}`),

  // Get sensor data
  getSensorData: (sessionId: string, sensorType: string) =>
    api.get(`/sessions/${sessionId}/data/${sensorType}`),

  // Delete session
  delete: (id: string) => api.delete(`/sessions/${id}`),
};

export const authAPI = {
  // Login
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  // Register
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),

  // Logout
  logout: () => api.post('/auth/logout'),
};

export default api;
```

### 5. 메인 대시보드 페이지

**파일**: `src/pages/Dashboard.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { sessionAPI } from '../services/api';
import { SessionList } from '../components/SessionList';

interface Session {
  id: string;
  name: string;
  createdAt: string;
  duration: number;
  dataPoints: number;
}

export const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionAPI.getAll();
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>KooDTX Dashboard</h1>
      <SessionList sessions={sessions} onRefresh={loadSessions} />
    </div>
  );
};
```

### 6. 환경 변수 설정

**파일**: `.env`

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=KooDTX Dashboard
```

---

## 🎨 UI 라이브러리 (선택사항)

### Material-UI

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

### Ant Design

```bash
npm install antd
```

### Chakra UI

```bash
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

---

## 📊 차트 라이브러리

### Recharts (추천)

```bash
npm install recharts
```

**사용 예시:**

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { time: 0, value: 10 },
  { time: 1, value: 15 },
  { time: 2, value: 12 },
];

<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="time" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
```

---

## 🚢 배포

### Vercel (추천)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel
```

### Netlify

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 빌드
npm run build

# 배포
netlify deploy --prod --dir=build
```

### GitHub Pages

```bash
# package.json에 추가
"homepage": "https://your-username.github.io/web-dashboard",

# gh-pages 설치
npm install --save-dev gh-pages

# scripts 추가
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# 배포
npm run deploy
```

---

## 🔐 인증 구현

### JWT 기반 인증

```typescript
// src/services/auth.ts
export const auth = {
  login: async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
```

---

## 📱 반응형 디자인

```css
/* Mobile */
@media (max-width: 768px) {
  .dashboard {
    padding: 8px;
  }

  .chart {
    width: 100%;
    height: 300px;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard {
    padding: 16px;
  }

  .chart {
    width: 100%;
    height: 400px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .dashboard {
    padding: 24px;
  }

  .chart {
    width: 800px;
    height: 500px;
  }
}
```

---

## 🧪 테스트

```bash
# 테스트 라이브러리 설치
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# 테스트 실행
npm test
```

---

## 📚 참고 자료

- [React 공식 문서](https://react.dev/)
- [Recharts 문서](https://recharts.org/)
- [Material-UI 문서](https://mui.com/)
- [React Router 문서](https://reactrouter.com/)

---

**마지막 업데이트**: 2025-01-16
**작성자**: KooDTX Team
**버전**: 1.0.0
