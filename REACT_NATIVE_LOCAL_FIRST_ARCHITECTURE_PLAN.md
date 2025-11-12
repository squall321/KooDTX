# React Native 센서 데이터 수집 앱 개발 계획서

## Local-First Architecture + Flask 동기화 시스템

**작성일**: 2025-11-11
**아키텍처**: React Native (Frontend) + Flask (Backend Sync Server)
**데이터 전략**: Local-First (오프라인 우선, 온라인 시 동기화)
**예상 개발 기간**: 6-9개월
**목표 플랫폼**: Android 10+ (iOS 14+ 확장 가능)

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [아키텍처 철학](#아키텍처-철학)
3. [기술 스택](#기술-스택)
4. [시스템 아키텍처](#시스템-아키텍처)
5. [데이터 흐름](#데이터-흐름)
6. [개발 Phase](#개발-phase)
7. [동기화 전략](#동기화-전략)
8. [보안 및 프라이버시](#보안-및-프라이버시)
9. [성능 최적화](#성능-최적화)
10. [배포 전략](#배포-전략)

---

## 프로젝트 개요

### 목적

React Native로 크로스플랫폼 센서 데이터 수집 앱을 개발하고, **Local-First 원칙**에 따라 오프라인에서도 완전히 동작하며, 인터넷 연결 시 Flask 서버와 자동 동기화하는 시스템 구축.

### 핵심 요구사항

- ✅ **Local-First**: 앱은 오프라인에서 완전히 동작
- ✅ **자동 동기화**: 온라인 연결 시 Flask 서버로 데이터 업로드
- ✅ **크로스플랫폼**: Android 우선, iOS 확장 가능
- ✅ **고주파 센서 수집**: 가속도계, 자이로스코프 등 200-400Hz
- ✅ **배터리 효율**: Native Module 최적화
- ✅ **충돌 해결**: 동기화 충돌 자동 처리
- ✅ **오프라인 큐잉**: 네트워크 장애 시 큐에 저장 후 재전송

### 기존 계획과의 차이점

| 항목          | 기존 (Android Native)    | 새 계획 (React Native + Flask)      |
| ------------- | ------------------------ | ----------------------------------- |
| 프론트엔드    | Kotlin + Jetpack Compose | React Native + TypeScript           |
| 백엔드        | 별도 서버 (명시 안됨)    | Flask REST API                      |
| 데이터 저장   | 로컬 파일 시스템         | SQLite (WatermelonDB) + Local Files |
| 동기화        | 단방향 업로드            | 양방향 동기화 (Conflict Resolution) |
| 오프라인 지원 | 제한적                   | 완전한 오프라인 우선                |
| 크로스플랫폼  | Android만                | Android + iOS                       |
| UI 프레임워크 | Jetpack Compose          | React Native (Expo 또는 bare)       |

---

## 아키텍처 철학

### Local-First란?

> "소프트웨어는 네트워크 없이도 작동해야 하며, 데이터는 사용자 기기에서 먼저 생성되고 저장된다."

#### Local-First 원칙

1. **Fast**: 네트워크 지연 없이 즉시 반응
2. **Multi-device**: 여러 기기에서 동기화
3. **Offline**: 인터넷 없이 완전히 동작
4. **Collaboration**: 충돌 해결 메커니즘
5. **Longevity**: 서버 없이도 데이터 접근 가능
6. **Privacy**: 데이터는 사용자 소유
7. **User Control**: 언제 동기화할지 사용자 결정

### 우리 앱의 Local-First 구현

- **로컬 우선 저장**: 모든 센서 데이터는 먼저 SQLite + 로컬 파일에 저장
- **백그라운드 동기화**: 네트워크 연결 시 자동으로 Flask 서버에 업로드
- **충돌 해결**: 타임스탬프 기반 Last-Write-Wins (LWW) 전략
- **선택적 동기화**: WiFi 전용, 배터리 충전 시만 등 사용자 설정
- **데이터 소유권**: 사용자는 언제든지 로컬 데이터 삭제/내보내기 가능

---

## 기술 스택

### Frontend (React Native App)

#### Core Framework

- **React Native 0.73+**: 크로스플랫폼 프레임워크
- **TypeScript 5.0+**: 타입 안전성
- **Expo SDK 50+** (선택): 빠른 개발을 위해 Expo 사용 고려
  - 또는 **React Native CLI** (bare workflow): 더 많은 Native 제어 필요 시

#### 상태 관리

- **Zustand** 또는 **Redux Toolkit**: 전역 상태 관리
- **React Query (TanStack Query)**: 서버 상태 관리 및 동기화
- **WatermelonDB**: Local-First SQLite ORM
  - 반응형 데이터베이스
  - 빠른 성능 (10,000+ 레코드)
  - 동기화 어댑터 내장

#### UI Components

- **React Native Paper** 또는 **NativeBase**: Material Design UI
- **React Navigation 6**: 네비게이션
- **React Native Reanimated 3**: 고성능 애니메이션
- **React Native SVG**: 차트 및 아이콘

#### 센서 및 Native Modules

- **react-native-sensors**: 가속도계, 자이로스코프
- **@react-native-community/geolocation**: GPS
- **react-native-audio-record**: 오디오 녹음
- **react-native-camera** 또는 **expo-camera**: 카메라
- **Custom Native Modules**: 고주파 센서 수집 최적화
  - Android: Kotlin
  - iOS: Swift

#### 파일 및 저장소

- **react-native-fs**: 파일 시스템 접근
- **react-native-sqlite-storage**: SQLite (WatermelonDB 백엔드)
- **AsyncStorage** 또는 **MMKV**: 키-값 저장소 (설정)
- **react-native-zip-archive**: 압축 (선택)

#### 네트워크 및 동기화

- **Axios**: HTTP 클라이언트
- **react-native-netinfo**: 네트워크 상태 감지
- **react-native-background-fetch**: 백그라운드 동기화
- **react-native-background-upload**: 대용량 파일 업로드

#### 기타

- **react-native-device-info**: 기기 정보
- **react-native-permissions**: 권한 관리
- **@notifee/react-native**: 푸시 알림
- **Sentry React Native**: 에러 추적

---

### Backend (Flask Sync Server)

#### Core Framework

- **Flask 3.0+**: 경량 웹 프레임워크
- **Python 3.11+**: 최신 Python
- **Gunicorn** + **Nginx**: 프로덕션 서버

#### 데이터베이스

- **PostgreSQL 15+**: 메인 데이터베이스
  - JSONB 컬럼으로 유연한 센서 데이터 저장
  - 인덱싱 최적화
- **SQLAlchemy 2.0**: ORM
- **Alembic**: 마이그레이션

#### 파일 저장소

- **로컬 파일 시스템**: 개발/소규모
- **AWS S3** 또는 **MinIO**: 프로덕션 파일 저장소
- **Boto3**: S3 클라이언트

#### 인증 및 보안

- **Flask-JWT-Extended**: JWT 토큰 인증
- **Flask-Bcrypt**: 비밀번호 해싱
- **Flask-CORS**: CORS 처리
- **Flask-Limiter**: Rate Limiting

#### 데이터 처리

- **Pandas**: 센서 데이터 분석
- **NumPy**: 수치 연산
- **Celery**: 비동기 작업 큐
- **Redis**: Celery 브로커, 캐싱

#### 동기화

- **Flask-RESTful** 또는 **Flask-RESTX**: REST API
- **Marshmallow**: 직렬화/검증
- **WebSocket (Flask-SocketIO)**: 실시간 동기화 (선택)

#### 모니터링

- **Prometheus**: 메트릭 수집
- **Grafana**: 대시보드
- **Sentry Python**: 에러 추적
- **ELK Stack**: 로그 분석 (선택)

---

### DevOps 및 인프라

#### 개발 환경

- **Docker** + **Docker Compose**: 컨테이너화
- **Git**: 버전 관리
- **GitHub Actions** 또는 **GitLab CI**: CI/CD

#### 배포

- **AWS EC2** 또는 **DigitalOcean Droplet**: 서버 호스팅
- **AWS RDS PostgreSQL**: 관리형 데이터베이스
- **AWS S3**: 파일 저장소
- **Cloudflare**: CDN 및 DDoS 보호

#### 앱 배포

- **Google Play Console**: Android 배포
- **Apple App Store Connect**: iOS 배포 (선택)
- **Fastlane**: 자동 배포

---

## 시스템 아키텍처

### 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   UI Layer      │  │  Business Logic │  │  Native Bridge│ │
│  │  (React/TSX)    │  │  (TypeScript)   │  │  (Kotlin/Swift)│ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘ │
│           │                    │                   │          │
│  ┌────────┴────────────────────┴───────────────────┴───────┐ │
│  │              State Management (Zustand/Redux)            │ │
│  └────────┬────────────────────┬───────────────────┬───────┘ │
│           │                    │                   │          │
│  ┌────────┴────────┐  ┌────────┴────────┐  ┌──────┴──────┐  │
│  │ Local Database  │  │  File Storage   │  │ Sync Queue  │  │
│  │ (WatermelonDB)  │  │  (react-native- │  │ (AsyncQueue)│  │
│  │     SQLite      │  │       fs)       │  │             │  │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘  │
└───────────┼────────────────────┼───────────────────┼─────────┘
            │                    │                   │
            │    ┌───────────────┴───────────────┐   │
            │    │   Network Layer (Axios)       │   │
            │    │   - Auth Interceptor          │   │
            │    │   - Retry Logic               │   │
            │    │   - Offline Queue             │   │
            │    └───────────────┬───────────────┘   │
            │                    │                   │
            │                    ▼                   │
            │         ┌──────────────────┐           │
            │         │  Internet Connection Detector│
            │         │  (NetInfo)       │           │
            │         └──────────┬───────┘           │
            │                    │                   │
            └────────────────────┼───────────────────┘
                                 │
                        Network (HTTPS)
                                 │
┌────────────────────────────────┴─────────────────────────────┐
│                      Flask Sync Server                        │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐  │
│  │              API Layer (Flask Routes)                  │  │
│  │  /auth  /sync  /upload  /download  /sessions          │  │
│  └────────┬─────────────────────────────────┬─────────────┘  │
│           │                                 │                │
│  ┌────────┴────────┐              ┌─────────┴───────┐        │
│  │ Authentication  │              │  Sync Engine    │        │
│  │  (JWT/Session)  │              │ - Conflict Res. │        │
│  │                 │              │ - Delta Sync    │        │
│  └────────┬────────┘              └─────────┬───────┘        │
│           │                                 │                │
│  ┌────────┴─────────────────────────────────┴───────┐        │
│  │           Business Logic Layer                   │        │
│  │  - Data Validation (Marshmallow)                 │        │
│  │  - File Processing (Pandas/NumPy)                │        │
│  │  - Background Jobs (Celery)                      │        │
│  └────────┬─────────────────────────────────┬───────┘        │
│           │                                 │                │
│  ┌────────┴────────┐              ┌─────────┴───────┐        │
│  │   PostgreSQL    │              │   File Storage  │        │
│  │   - Sessions    │              │   - S3/MinIO    │        │
│  │   - Users       │              │   - Raw Sensor  │        │
│  │   - Sync Log    │              │     Data Files  │        │
│  └─────────────────┘              └─────────────────┘        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Redis (Cache + Celery Broker)            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

### 앱 내부 아키텍처 (React Native)

#### 폴더 구조

```
koodtx-app/
├── android/                    # Android Native 코드
│   └── app/src/main/
│       ├── java/com/koodtx/
│       │   └── SensorModule.kt # 센서 Native Module
│       └── AndroidManifest.xml
├── ios/                        # iOS Native 코드 (선택)
│   └── KooDTX/
│       └── SensorModule.swift
├── src/
│   ├── api/                    # API 클라이언트
│   │   ├── client.ts           # Axios 인스턴스
│   │   ├── auth.ts             # 인증 API
│   │   ├── sync.ts             # 동기화 API
│   │   └── upload.ts           # 파일 업로드 API
│   ├── components/             # 재사용 가능 컴포넌트
│   │   ├── SensorCard.tsx
│   │   ├── SessionList.tsx
│   │   └── SyncIndicator.tsx
│   ├── database/               # WatermelonDB 설정
│   │   ├── schema.ts           # 데이터베이스 스키마
│   │   ├── migrations.ts
│   │   ├── models/
│   │   │   ├── Session.ts
│   │   │   ├── SensorData.ts
│   │   │   └── SyncQueue.ts
│   │   └── sync.ts             # 동기화 어댑터
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useSensor.ts
│   │   ├── useSync.ts
│   │   └── useNetworkStatus.ts
│   ├── native/                 # Native Module 인터페이스
│   │   ├── SensorBridge.ts
│   │   └── FileSystemBridge.ts
│   ├── navigation/             # React Navigation
│   │   └── AppNavigator.tsx
│   ├── screens/                # 화면 컴포넌트
│   │   ├── HomeScreen.tsx
│   │   ├── RecordingScreen.tsx
│   │   ├── SessionsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── SyncScreen.tsx
│   ├── services/               # 비즈니스 로직
│   │   ├── SensorService.ts    # 센서 수집 로직
│   │   ├── StorageService.ts   # 파일 저장 로직
│   │   ├── SyncService.ts      # 동기화 로직
│   │   └── BackgroundService.ts# 백그라운드 작업
│   ├── store/                  # 상태 관리 (Zustand)
│   │   ├── useAppStore.ts
│   │   ├── useSensorStore.ts
│   │   └── useSyncStore.ts
│   ├── types/                  # TypeScript 타입
│   │   ├── sensor.ts
│   │   ├── session.ts
│   │   └── sync.ts
│   ├── utils/                  # 유틸리티 함수
│   │   ├── timestamp.ts
│   │   ├── compression.ts
│   │   └── validation.ts
│   └── App.tsx                 # 앱 엔트리포인트
├── __tests__/                  # 테스트
├── package.json
├── tsconfig.json
└── README.md
```

---

### 서버 아키텍처 (Flask)

#### 폴더 구조

```
koodtx-server/
├── app/
│   ├── __init__.py             # Flask 앱 초기화
│   ├── config.py               # 설정
│   ├── models/                 # SQLAlchemy 모델
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── sensor_data.py
│   │   └── sync_log.py
│   ├── routes/                 # API 엔드포인트
│   │   ├── auth.py             # POST /auth/login, /auth/register
│   │   ├── sync.py             # POST /sync/pull, /sync/push
│   │   ├── upload.py           # POST /upload, GET /upload/<id>
│   │   ├── sessions.py         # GET /sessions, POST /sessions
│   │   └── health.py           # GET /health
│   ├── schemas/                # Marshmallow 스키마
│   │   ├── user_schema.py
│   │   ├── session_schema.py
│   │   └── sync_schema.py
│   ├── services/               # 비즈니스 로직
│   │   ├── auth_service.py
│   │   ├── sync_service.py
│   │   ├── file_service.py
│   │   └── data_processor.py
│   ├── tasks/                  # Celery 태스크
│   │   ├── process_data.py
│   │   └── cleanup.py
│   ├── utils/                  # 유틸리티
│   │   ├── jwt.py
│   │   ├── validation.py
│   │   └── s3.py
│   └── extensions.py           # Flask extensions (db, jwt, etc.)
├── migrations/                 # Alembic 마이그레이션
├── tests/                      # 테스트
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

---

## 데이터 흐름

### 1. 센서 데이터 수집 흐름 (Recording)

```
[센서 하드웨어]
     ↓
[Native Module] (Kotlin SensorModule)
 - SensorManager 리스너
 - 고주파 버퍼링 (200-400Hz)
     ↓
[Native Bridge] (React Native Bridge)
 - 배치 전송 (50ms마다)
 - JSON 직렬화
     ↓
[TypeScript Service] (SensorService)
 - 타임스탬프 추가
 - 데이터 검증
     ↓
[WatermelonDB] (로컬 SQLite)
 - 트랜잭션 배치 Insert
 - 인덱싱 (session_id, timestamp)
     ↓
[File System] (react-native-fs)
 - 청크 파일 저장 (.jsonl, .pb)
 - 압축 (선택: gzip)
     ↓
[Sync Queue] (로컬 큐)
 - 업로드 대기 상태로 마킹
 - Pending 플래그 설정
```

### 2. 동기화 흐름 (Online Sync)

```
[Network Detector] (NetInfo)
 - WiFi 연결 감지
 - 충전 상태 체크 (설정에 따라)
     ↓
[Sync Service] (SyncService.ts)
 - Sync Queue에서 Pending 항목 조회
 - 우선순위 정렬 (오래된 것 우선)
     ↓
[API Client] (Axios)
 - POST /sync/push
 - 파일 업로드: POST /upload (multipart)
 - JWT 인증 헤더 추가
 - 재시도 로직 (exponential backoff)
     ↓
[Flask Server] (Sync API)
 - JWT 검증
 - 요청 검증 (Marshmallow)
 - 중복 체크 (session_id + timestamp)
     ↓
[Business Logic] (SyncService.py)
 - 충돌 해결 (Last-Write-Wins)
 - 델타 계산 (서버에 없는 데이터만)
     ↓
[PostgreSQL]
 - 메타데이터 저장
 - 트랜잭션 처리
     ↓
[S3/MinIO]
 - 원본 파일 저장
 - Key: {user_id}/{session_id}/{filename}
     ↓
[Celery Task] (비동기)
 - 데이터 처리 (Pandas)
 - 통계 계산
 - 알림 전송 (선택)
     ↓
[App Response] (JSON)
 - 동기화 성공 확인
 - 서버 타임스탬프
 - 충돌 정보 (있다면)
     ↓
[Local Update]
 - Sync Queue에서 항목 제거
 - sync_status = 'completed'
 - UI 업데이트 (React Query 캐시)
```

### 3. 오프라인 동작 흐름

```
[녹음 시작]
     ↓
[로컬에만 저장] (WatermelonDB + Files)
     ↓
[Sync Queue에 추가] (status = 'pending')
     ↓
[네트워크 상태] (offline)
     ↓
[백그라운드 체크] (15분마다)
 - 네트워크 상태 확인
 - 여전히 오프라인
     ↓
[사용자 알림] (선택)
 - "동기화 대기 중: 3개 세션"
     ↓
[온라인 복구]
     ↓
[자동 동기화 시작] (SyncService)
     ↓
[정상 동기화 흐름 진행]
```

---

## 개발 Phase

### Phase 1: 프로젝트 셋업 및 기본 인프라 (2주)

#### 1.1 프로젝트 초기화

- [ ] React Native 프로젝트 생성
  - `npx react-native init KooDTX --template react-native-template-typescript`
  - 또는 Expo: `npx create-expo-app KooDTX --template`
- [ ] Git 저장소 초기화
- [ ] ESLint + Prettier 설정
- [ ] TypeScript 설정 (strict mode)
- [ ] 폴더 구조 생성

#### 1.2 기본 의존성 설치

- [ ] Navigation: `@react-navigation/native`, `@react-navigation/stack`
- [ ] State: `zustand` 또는 `@reduxjs/toolkit`
- [ ] UI: `react-native-paper`
- [ ] Utils: `date-fns`, `lodash`

#### 1.3 Flask 서버 셋업

- [ ] Flask 프로젝트 생성
- [ ] 가상환경 설정
- [ ] requirements.txt 작성
  ```
  Flask==3.0.0
  Flask-SQLAlchemy==3.1.1
  Flask-JWT-Extended==4.5.3
  Flask-CORS==4.0.0
  psycopg2-binary==2.9.9
  python-dotenv==1.0.0
  ```
- [ ] Docker 환경 구성
  - `docker-compose.yml` (Flask + PostgreSQL + Redis)
- [ ] 기본 라우트 테스트 (`/health`)

#### 1.4 데이터베이스 설계

- [ ] PostgreSQL 스키마 설계
  - `users`: id, username, email, password_hash, created_at
  - `sessions`: id, user_id, device_id, start_time, end_time, status
  - `sensor_data`: id, session_id, sensor_type, data (JSONB), timestamp
  - `sync_log`: id, session_id, sync_time, status, error_message
  - `files`: id, session_id, file_path, file_size, uploaded_at
- [ ] Alembic 마이그레이션 초기화
- [ ] SQLAlchemy 모델 작성

#### 1.5 인증 시스템

- [ ] JWT 토큰 발급/검증
- [ ] Flask-JWT-Extended 설정
- [ ] 회원가입 API: `POST /auth/register`
- [ ] 로그인 API: `POST /auth/login`
- [ ] 토큰 갱신 API: `POST /auth/refresh`
- [ ] React Native에서 AsyncStorage에 토큰 저장

---

### Phase 2: 로컬 데이터베이스 및 저장소 (2주)

#### 2.1 WatermelonDB 설정

- [ ] 설치: `@nozbe/watermelondb`, `@nozbe/with-observables`
- [ ] 스키마 정의

  ```typescript
  // Session 테이블
  session: {
    id: string (UUID)
    device_id: string
    start_time: number (timestamp)
    end_time: number | null
    status: 'recording' | 'stopped' | 'synced'
    sync_status: 'pending' | 'syncing' | 'completed' | 'failed'
    created_at: number
    updated_at: number
  }

  // SensorData 테이블 (메타데이터만)
  sensor_data: {
    id: string
    session_id: string (foreign key)
    sensor_type: string
    file_path: string (로컬 파일 경로)
    sample_count: number
    start_timestamp: number
    end_timestamp: number
    created_at: number
  }

  // SyncQueue 테이블
  sync_queue: {
    id: string
    session_id: string
    file_id: string
    status: 'pending' | 'uploading' | 'completed' | 'failed'
    retry_count: number
    last_attempt: number | null
    error_message: string | null
  }
  ```

- [ ] 모델 클래스 작성 (`@field`, `@relation`)
- [ ] Database 인스턴스 생성

#### 2.2 파일 시스템 설정

- [ ] react-native-fs 설치
- [ ] 저장 경로 설정
  ```typescript
  const BASE_PATH = RNFS.DocumentDirectoryPath + '/koodtx';
  const SESSIONS_PATH = BASE_PATH + '/sessions';
  const TEMP_PATH = BASE_PATH + '/temp';
  ```
- [ ] 파일 네이밍 규칙
  ```
  {session_id}/
    ├── acc_1699876543210_001.jsonl
    ├── gyro_1699876543210_001.jsonl
    ├── gps_1699876543210_001.jsonl
    └── manifest.json
  ```
- [ ] 파일 저장 유틸리티 작성

#### 2.3 타임스탬프 동기화

- [ ] `timestamp.ts` 유틸리티
  ```typescript
  export const getTimestamp = () => ({
    utc_epoch_ms: Date.now(),
    elapsed_ns: performance.now() * 1_000_000, // 밀리초 → 나노초
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  ```
- [ ] 서버 시간 동기화 (NTP 옵션)

---

### Phase 3: Native Module 개발 - 센서 수집 (3주)

#### 3.1 Android Sensor Native Module

- [ ] Kotlin 파일 생성: `SensorModule.kt`
- [ ] SensorManager 초기화
- [ ] 센서 리스너 구현

  ```kotlin
  class SensorModule(reactContext: ReactApplicationContext) :
      ReactContextBaseJavaModule(reactContext), SensorEventListener {

      private val sensorManager = reactContext.getSystemService(SENSOR_SERVICE) as SensorManager
      private val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
      private val gyroscope = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

      @ReactMethod
      fun startAccelerometer(samplingRate: Int, promise: Promise) {
          // 리스너 등록
          sensorManager.registerListener(this, accelerometer, samplingRate)
          promise.resolve("started")
      }

      override fun onSensorChanged(event: SensorEvent) {
          // 배치 전송 (50ms 버퍼)
          sendEvent("SensorData", mapOf(
              "type" to "accelerometer",
              "x" to event.values[0],
              "y" to event.values[1],
              "z" to event.values[2],
              "timestamp" to event.timestamp
          ))
      }
  }
  ```

- [ ] React Native Package 등록

#### 3.2 TypeScript Bridge

- [ ] `SensorBridge.ts` 작성

  ```typescript
  import {NativeModules, NativeEventEmitter} from 'react-native';

  const {SensorModule} = NativeModules;
  const sensorEmitter = new NativeEventEmitter(SensorModule);

  export const startAccelerometer = (samplingRate: number) => {
    return SensorModule.startAccelerometer(samplingRate);
  };

  export const subscribeSensorData = (callback: (data: SensorData) => void) => {
    return sensorEmitter.addListener('SensorData', callback);
  };
  ```

#### 3.3 센서 서비스 레이어

- [ ] `SensorService.ts` 작성

  ```typescript
  class SensorService {
    private buffer: SensorSample[] = [];
    private sessionId: string | null = null;

    async startRecording(sessionId: string) {
      this.sessionId = sessionId;
      await startAccelerometer(200); // 200Hz

      subscribeSensorData(data => {
        this.buffer.push({
          ...data,
          session_id: sessionId,
          utc_timestamp: Date.now(),
        });

        if (this.buffer.length >= 100) {
          this.flushBuffer();
        }
      });
    }

    private async flushBuffer() {
      const batch = [...this.buffer];
      this.buffer = [];

      // WatermelonDB 저장
      await database.write(async () => {
        // 파일에 저장
        const filePath = await this.saveToFile(batch);

        // 메타데이터 저장
        await sensorDataCollection.create(record => {
          record.sessionId = this.sessionId;
          record.sensorType = 'accelerometer';
          record.filePath = filePath;
          record.sampleCount = batch.length;
        });
      });
    }
  }
  ```

#### 3.4 다중 센서 지원

- [ ] Accelerometer (가속도계)
- [ ] Gyroscope (자이로스코프)
- [ ] Magnetometer (자기장)
- [ ] GPS (위치)
- [ ] Microphone (오디오 - Phase 4에서)

---

### Phase 4: UI 개발 - 녹음 화면 (2주)

#### 4.1 Recording Screen

- [ ] 녹음 시작/중지 버튼
- [ ] 실시간 센서 값 표시
  - 가속도계: X, Y, Z 그래프
  - 자이로스코프: 회전 시각화
- [ ] 녹음 시간 타이머
- [ ] 세션 메타데이터 입력 (이름, 설명)

#### 4.2 Sessions Screen

- [ ] 세션 리스트 (FlatList)
  - 세션명, 시작 시간, 지속 시간
  - 동기화 상태 아이콘
- [ ] 세션 상세 보기
  - 센서 데이터 요약
  - 파일 목록
  - 내보내기 버튼
- [ ] 세션 삭제 기능

#### 4.3 Sync Screen

- [ ] 동기화 큐 표시
- [ ] 수동 동기화 버튼
- [ ] 네트워크 상태 표시
- [ ] 동기화 로그

#### 4.4 Settings Screen

- [ ] 센서 설정
  - 샘플링율 조정
  - 활성화할 센서 선택
- [ ] 동기화 설정
  - WiFi 전용 모드
  - 충전 중에만 동기화
  - 자동/수동 동기화
- [ ] 서버 설정
  - 서버 URL
  - 로그인/로그아웃
- [ ] 데이터 관리
  - 로컬 데이터 삭제
  - 캐시 크기 표시

---

### Phase 5: 동기화 시스템 (3주)

#### 5.1 Sync Service 구현

- [ ] `SyncService.ts` 작성

  ```typescript
  class SyncService {
    async syncAll() {
      const pendingItems = await database.collections
        .get('sync_queue')
        .query(Q.where('status', 'pending'))
        .fetch();

      for (const item of pendingItems) {
        await this.syncItem(item);
      }
    }

    async syncItem(item: SyncQueue) {
      try {
        await item.update(q => { q.status = 'uploading'; });

        const file = await RNFS.readFile(item.filePath, 'base64');

        await api.post('/upload', {
          session_id: item.sessionId,
          file_data: file,
          metadata: {...},
        });

        await item.update(q => { q.status = 'completed'; });
      } catch (error) {
        await item.update(q => {
          q.status = 'failed';
          q.retryCount += 1;
          q.errorMessage = error.message;
        });
      }
    }
  }
  ```

#### 5.2 네트워크 상태 감지

- [ ] NetInfo 통합
  ```typescript
  NetInfo.addEventListener(state => {
    if (state.isConnected && state.type === 'wifi') {
      syncService.syncAll();
    }
  });
  ```

#### 5.3 백그라운드 동기화

- [ ] react-native-background-fetch 설치
  ```typescript
  BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // 15분
    },
    async taskId => {
      await syncService.syncAll();
      BackgroundFetch.finish(taskId);
    },
  );
  ```

#### 5.4 Flask 동기화 API

- [ ] `POST /sync/push` - 클라이언트 → 서버

  ```python
  @app.route('/sync/push', methods=['POST'])
  @jwt_required()
  def sync_push():
      data = request.json
      user_id = get_jwt_identity()

      # 중복 체크
      existing = Session.query.filter_by(
          id=data['session_id'],
          user_id=user_id
      ).first()

      if existing:
          # 충돌 해결 (Last-Write-Wins)
          if data['updated_at'] > existing.updated_at:
              existing.update(data)
      else:
          # 새 세션 생성
          session = Session(**data, user_id=user_id)
          db.session.add(session)

      db.session.commit()
      return jsonify({'status': 'success'})
  ```

- [ ] `POST /sync/pull` - 서버 → 클라이언트 (선택적)

  ```python
  @app.route('/sync/pull', methods=['POST'])
  @jwt_required()
  def sync_pull():
      user_id = get_jwt_identity()
      last_sync = request.json.get('last_sync_time', 0)

      # 마지막 동기화 이후 변경된 세션만
      sessions = Session.query.filter(
          Session.user_id == user_id,
          Session.updated_at > last_sync
      ).all()

      return jsonify({
          'sessions': [s.to_dict() for s in sessions],
          'server_time': time.time()
      })
  ```

#### 5.5 파일 업로드 API

- [ ] `POST /upload` - Multipart 파일 업로드

  ```python
  @app.route('/upload', methods=['POST'])
  @jwt_required()
  def upload_file():
      file = request.files['file']
      session_id = request.form['session_id']
      user_id = get_jwt_identity()

      # S3 업로드
      s3_key = f"{user_id}/{session_id}/{file.filename}"
      s3_client.upload_fileobj(file, BUCKET_NAME, s3_key)

      # DB에 파일 정보 저장
      file_record = File(
          session_id=session_id,
          file_path=s3_key,
          file_size=file.content_length
      )
      db.session.add(file_record)
      db.session.commit()

      return jsonify({'status': 'uploaded', 'file_id': file_record.id})
  ```

#### 5.6 충돌 해결 전략

- [ ] Last-Write-Wins (LWW) 구현
  ```typescript
  function resolveConflict(local: Session, remote: Session): Session {
    if (local.updated_at > remote.updated_at) {
      return local;
    } else {
      return remote;
    }
  }
  ```
- [ ] 충돌 로그 기록
- [ ] 사용자에게 충돌 알림 (선택적)

---

### Phase 6: 오디오 및 고급 센서 (2주)

#### 6.1 오디오 녹음

- [ ] react-native-audio-record 설치
- [ ] Native Module 확장 (고주파 수집)

  ```kotlin
  class AudioRecorderModule {
      private val recorder = AudioRecord(
          MediaRecorder.AudioSource.MIC,
          44100, // 샘플링율
          AudioFormat.CHANNEL_IN_MONO,
          AudioFormat.ENCODING_PCM_16BIT,
          bufferSize
      )

      fun startRecording() {
          recorder.startRecording()
          thread {
              val buffer = ShortArray(1024)
              while (isRecording) {
                  val read = recorder.read(buffer, 0, buffer.size)
                  // RMS 계산, dB 변환
                  sendEvent("AudioData", ...)
              }
          }
      }
  }
  ```

#### 6.2 카메라 메타데이터

- [ ] expo-camera 또는 react-native-camera 사용
- [ ] 주기적 스냅샷 (1Hz)
- [ ] 메타데이터만 저장 (노출, ISO, 초점 거리)

#### 6.3 배터리 및 시스템 센서

- [ ] react-native-device-info
- [ ] 배터리 레벨, 온도
- [ ] CPU/메모리 사용량 (Native Module)

---

### Phase 7: 최적화 및 안정성 (2주)

#### 7.1 성능 최적화

- [ ] React.memo 적용
- [ ] useMemo, useCallback 최적화
- [ ] FlatList 가상화 (windowSize, initialNumToRender)
- [ ] 이미지 최적화 (react-native-fast-image)

#### 7.2 배터리 최적화

- [ ] 센서 샘플링율 동적 조정
- [ ] 백그라운드에서 저전력 모드
- [ ] Wake Lock 최소화

#### 7.3 메모리 최적화

- [ ] 센서 버퍼 크기 제한
- [ ] 파일 스트리밍 (청크 단위)
- [ ] 메모리 누수 체크 (Hermes Profiler)

#### 7.4 에러 처리

- [ ] Sentry 통합
- [ ] 전역 에러 바운더리
- [ ] 네트워크 에러 재시도 로직
- [ ] 사용자 친화적 에러 메시지

#### 7.5 로깅

- [ ] 구조화된 로깅 (`winston` 또는 커스텀)
- [ ] 로그 레벨 (debug, info, warn, error)
- [ ] 로컬 로그 파일 저장 (디버깅용)

---

### Phase 8: 보안 강화 (1주)

#### 8.1 앱 보안

- [ ] JWT 토큰 안전한 저장 (react-native-keychain)
- [ ] SSL Pinning (react-native-ssl-pinning)
- [ ] 코드 난독화 (ProGuard/R8)
- [ ] 루팅/탈옥 감지

#### 8.2 서버 보안

- [ ] HTTPS 강제 (Let's Encrypt)
- [ ] Rate Limiting (Flask-Limiter)

  ```python
  limiter = Limiter(app, key_func=get_remote_address)

  @app.route('/auth/login')
  @limiter.limit("5 per minute")
  def login():
      ...
  ```

- [ ] CORS 설정
- [ ] SQL Injection 방지 (SQLAlchemy parameterized queries)
- [ ] XSS 방지 (입력 검증)

#### 8.3 데이터 프라이버시

- [ ] GDPR 준수 (데이터 삭제 API)
- [ ] 민감 정보 암호화 (GPS 좌표 선택적)
- [ ] 사용자 동의 화면

---

### Phase 9: 테스트 (2주)

#### 9.1 Unit 테스트

- [ ] Jest 설정
- [ ] 유틸리티 함수 테스트
- [ ] Redux/Zustand 스토어 테스트
- [ ] 서비스 로직 테스트

#### 9.2 Integration 테스트

- [ ] API 통신 테스트 (Mock Server)
- [ ] 데이터베이스 CRUD 테스트
- [ ] 동기화 로직 테스트

#### 9.3 E2E 테스트

- [ ] Detox 또는 Appium 설정
- [ ] 녹음 → 저장 → 동기화 플로우 테스트
- [ ] 오프라인 → 온라인 복구 테스트

#### 9.4 서버 테스트

- [ ] pytest 설정
- [ ] API 엔드포인트 테스트
- [ ] 데이터베이스 트랜잭션 테스트
- [ ] 동기화 충돌 시나리오 테스트

---

### Phase 10: 배포 준비 (1주)

#### 10.1 앱 빌드

- [ ] Android Release 빌드
  - Signing Key 생성
  - build.gradle 설정
  - AAB (Android App Bundle) 빌드
- [ ] iOS Release 빌드 (선택)
  - Xcode Archive
  - App Store Connect 설정

#### 10.2 서버 배포

- [ ] Docker 이미지 빌드
- [ ] AWS EC2 인스턴스 설정
- [ ] Nginx 리버스 프록시
- [ ] Gunicorn + Supervisor
- [ ] PostgreSQL RDS 설정
- [ ] S3 버킷 생성
- [ ] Redis 설정

#### 10.3 CI/CD

- [ ] GitHub Actions 워크플로우
  ```yaml
  name: Build and Test
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Install dependencies
          run: npm install
        - name: Run tests
          run: npm test
        - name: Build APK
          run: cd android && ./gradlew assembleRelease
  ```

#### 10.4 모니터링 설정

- [ ] Sentry (앱 + 서버)
- [ ] Prometheus + Grafana (서버 메트릭)
- [ ] AWS CloudWatch (인프라)

---

### Phase 11: 베타 테스트 및 피드백 (2주)

#### 11.1 내부 베타

- [ ] Google Play Internal Testing
- [ ] 5-10명 내부 테스터
- [ ] 피드백 수집 (Google Forms)

#### 11.2 오픈 베타

- [ ] Google Play Open Beta
- [ ] 버그 리포트 시스템
- [ ] 충돌 로그 분석

#### 11.3 피드백 반영

- [ ] 우선순위 버그 수정
- [ ] UX 개선
- [ ] 성능 튜닝

---

### Phase 12: 정식 출시 (1주)

#### 12.1 스토어 등록

- [ ] Google Play Console
  - 스크린샷, 앱 설명
  - 개인정보 처리방침
  - 콘텐츠 등급
- [ ] 출시

#### 12.2 문서화

- [ ] 사용자 가이드
- [ ] API 문서 (Swagger/OpenAPI)
- [ ] 개발자 문서 (README, Wiki)

#### 12.3 마케팅 (선택)

- [ ] 랜딩 페이지
- [ ] 소셜 미디어 홍보

---

## 동기화 전략

### 동기화 모드

#### 1. 자동 동기화 (기본)

- **트리거**: WiFi 연결 + 배터리 20% 이상
- **주기**: 15분마다 체크
- **방식**: 백그라운드 fetch

#### 2. 수동 동기화

- **트리거**: 사용자 버튼 클릭
- **방식**: 즉시 동기화 시작

#### 3. 실시간 동기화 (선택적)

- **트리거**: 데이터 생성 시 즉시
- **방식**: WebSocket 또는 HTTP/2 Server Push
- **사용 사례**: 중요 이벤트만 (낙하 감지, 충격 등)

### 동기화 알고리즘

#### Delta Sync (차등 동기화)

```typescript
async function deltaSync() {
  // 1. 마지막 동기화 시간 가져오기
  const lastSync = await getLastSyncTime();

  // 2. 로컬에서 변경된 데이터 조회
  const localChanges = await database.collections
    .get('sessions')
    .query(Q.where('updated_at', Q.gt(lastSync)))
    .fetch();

  // 3. 서버에서 변경된 데이터 가져오기
  const response = await api.post('/sync/pull', {last_sync_time: lastSync});
  const serverChanges = response.data.sessions;

  // 4. 충돌 해결
  const merged = resolveConflicts(localChanges, serverChanges);

  // 5. 로컬 적용
  await applyServerChanges(merged.serverWins);

  // 6. 서버 업로드
  await uploadLocalChanges(merged.localWins);

  // 7. 동기화 시간 업데이트
  await setLastSyncTime(response.data.server_time);
}
```

#### 충돌 해결 전략

**1. Last-Write-Wins (LWW)**

```typescript
function resolveConflicts(local: Session[], remote: Session[]): MergeResult {
  const merged = {serverWins: [], localWins: []};

  for (const localItem of local) {
    const remoteItem = remote.find(r => r.id === localItem.id);

    if (!remoteItem) {
      // 서버에 없음 → 업로드
      merged.localWins.push(localItem);
    } else {
      // 충돌: 최신 타임스탬프 우선
      if (localItem.updated_at > remoteItem.updated_at) {
        merged.localWins.push(localItem);
      } else {
        merged.serverWins.push(remoteItem);
      }
    }
  }

  return merged;
}
```

**2. Custom Resolution (센서 데이터는 병합 불가)**

- 센서 데이터 파일은 불변 (Immutable)
- 충돌 시 두 버전 모두 유지 (`file_v1.jsonl`, `file_v2.jsonl`)
- 사용자에게 알림

### 재시도 로직

```typescript
async function uploadWithRetry(file: File, maxRetries = 3) {
  let attempt = 0;
  let delay = 1000; // 1초

  while (attempt < maxRetries) {
    try {
      await api.post('/upload', file);
      return {success: true};
    } catch (error) {
      attempt++;

      if (attempt >= maxRetries) {
        return {success: false, error};
      }

      // Exponential backoff: 1s, 2s, 4s
      await sleep(delay);
      delay *= 2;
    }
  }
}
```

### 동기화 우선순위

| 우선순위 | 데이터 타입               | 조건              |
| -------- | ------------------------- | ----------------- |
| 1 (최고) | 에러 로그                 | 항상              |
| 2        | 세션 메타데이터           | 크기 작음         |
| 3        | GPS 데이터                | 중요도 높음       |
| 4        | IMU 센서 (가속도, 자이로) | 파일 크기 큼      |
| 5        | 오디오 메타데이터         | 중간              |
| 6 (최저) | 오디오 원본 (PCM)         | 파일 크기 매우 큼 |

---

## 보안 및 프라이버시

### 앱 보안

#### 1. 토큰 저장

```typescript
import Keychain from 'react-native-keychain';

// 저장
await Keychain.setGenericPassword('auth_token', jwtToken, {
  service: 'com.koodtx.auth',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
});

// 조회
const credentials = await Keychain.getGenericPassword({
  service: 'com.koodtx.auth',
});
const token = credentials.password;
```

#### 2. SSL Pinning

```typescript
import {fetch as sslFetch} from 'react-native-ssl-pinning';

const response = await sslFetch('https://api.koodtx.com/sync', {
  method: 'POST',
  pkPinning: true,
  sslPinning: {
    certs: ['cert1', 'cert2'], // SHA-256 해시
  },
});
```

#### 3. 루팅 감지

```typescript
import {isJailBroken} from 'jail-monkey';

if (isJailBroken()) {
  Alert.alert('보안 경고', '루팅된 기기에서는 앱을 사용할 수 없습니다.');
}
```

### 서버 보안

#### 1. JWT 검증

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route('/protected')
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    return jsonify(logged_in_as=user_id)
```

#### 2. Rate Limiting

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/upload')
@limiter.limit("10 per minute")
@jwt_required()
def upload():
    ...
```

#### 3. 입력 검증

```python
from marshmallow import Schema, fields, validate

class SessionSchema(Schema):
    session_id = fields.Str(required=True, validate=validate.Length(max=100))
    device_id = fields.Str(required=True)
    start_time = fields.Int(required=True)

schema = SessionSchema()
errors = schema.validate(request.json)
if errors:
    return jsonify(errors), 400
```

### 데이터 프라이버시

#### GDPR 준수

- [ ] 사용자 동의 화면
- [ ] 데이터 수집 목적 명시
- [ ] 데이터 삭제 권리 (`DELETE /user/data`)
- [ ] 데이터 이동 권리 (`GET /user/export`)

#### 민감 정보 처리

- [ ] GPS 좌표: 사용자 선택적 수집
- [ ] 오디오: 명시적 권한 요청
- [ ] 개인정보: 암호화 저장 (AES-256)

---

## 성능 최적화

### 앱 성능

#### 1. 센서 버퍼링

```typescript
class SensorBuffer {
  private buffer: SensorSample[] = [];
  private readonly BATCH_SIZE = 100;
  private readonly FLUSH_INTERVAL_MS = 1000;

  add(sample: SensorSample) {
    this.buffer.push(sample);

    if (this.buffer.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  async flush() {
    const batch = [...this.buffer];
    this.buffer = [];
    await this.saveBatch(batch);
  }
}
```

#### 2. 메모리 최적화

- WatermelonDB 쿼리 최적화 (인덱스)
- 이미지 압축 (react-native-image-resizer)
- 파일 스트리밍 (청크 단위 읽기/쓰기)

#### 3. UI 최적화

- React.memo 적용
- FlatList 가상화
  ```typescript
  <FlatList
    data={sessions}
    renderItem={renderSession}
    windowSize={5}
    initialNumToRender={10}
    maxToRenderPerBatch={10}
    removeClippedSubviews={true}
  />
  ```

### 서버 성능

#### 1. 데이터베이스 인덱싱

```sql
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_updated_at ON sessions(updated_at);
CREATE INDEX idx_sensor_data_session_id ON sensor_data(session_id);
CREATE INDEX idx_sensor_data_timestamp ON sensor_data(timestamp);
```

#### 2. 캐싱

```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@app.route('/sessions/<user_id>')
@cache.cached(timeout=300, key_prefix='sessions')
def get_sessions(user_id):
    return Session.query.filter_by(user_id=user_id).all()
```

#### 3. 비동기 처리

```python
from celery import Celery

celery = Celery('tasks', broker='redis://localhost:6379')

@celery.task
def process_sensor_data(session_id):
    # 무거운 데이터 처리 (Pandas, 통계 계산)
    session = Session.query.get(session_id)
    data = load_sensor_data(session)
    stats = calculate_statistics(data)
    session.stats = stats
    db.session.commit()

# API에서 호출
@app.route('/upload')
def upload():
    # ... 파일 저장 ...
    process_sensor_data.delay(session_id)  # 비동기 실행
    return jsonify({'status': 'processing'})
```

#### 4. 파일 압축

- Gzip 압축 (Nginx)
- 센서 데이터 Protobuf 인코딩 (선택)

---

## 배포 전략

### 개발 환경

```bash
# 로컬 개발
docker-compose up -d  # PostgreSQL + Redis
python run.py         # Flask 개발 서버
npm start             # React Native Metro
```

### 스테이징 환경

- AWS EC2 t3.medium
- PostgreSQL RDS (db.t3.micro)
- S3 버킷 (개발용)
- Cloudflare CDN

### 프로덕션 환경

- AWS EC2 t3.large (오토스케일링)
- PostgreSQL RDS (db.t3.medium, Multi-AZ)
- S3 버킷 (프로덕션)
- Redis ElastiCache
- Load Balancer (ALB)

### CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  build-app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Android APK
        run: |
          cd android
          ./gradlew assembleRelease
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJson: ${{ secrets.PLAY_STORE_JSON }}
          packageName: com.koodtx
          releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
          track: production

  deploy-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to AWS
        run: |
          docker build -t koodtx-server .
          docker tag koodtx-server:latest $ECR_REGISTRY/koodtx-server:latest
          docker push $ECR_REGISTRY/koodtx-server:latest
          aws ecs update-service --cluster koodtx --service api --force-new-deployment
```

---

## 위험 요소 및 대응 전략

### 기술적 위험

| 위험                                 | 영향도 | 확률 | 대응 전략                            |
| ------------------------------------ | ------ | ---- | ------------------------------------ |
| React Native 성능 문제 (고주파 센서) | 높음   | 중간 | Native Module로 센서 수집, 배치 전송 |
| 대용량 파일 동기화 실패              | 높음   | 높음 | 청크 업로드, 재시도 로직, 압축       |
| 배터리 소모                          | 중간   | 높음 | 샘플링율 조정, 배터리 최적화         |
| 동기화 충돌                          | 중간   | 중간 | LWW 전략, 충돌 로그                  |
| 저장 공간 부족                       | 중간   | 중간 | 자동 정리, 사용자 알림               |
| 서버 비용 증가                       | 높음   | 높음 | S3 Lifecycle 정책, 압축, CDN         |

### 일정 위험

| 마일스톤               | 예상 기간 | 버퍼    | 총 기간            |
| ---------------------- | --------- | ------- | ------------------ |
| Phase 1-2: 인프라      | 4주       | 1주     | 5주                |
| Phase 3: Native Module | 3주       | 1주     | 4주                |
| Phase 4: UI            | 2주       | 1주     | 3주                |
| Phase 5: 동기화        | 3주       | 1주     | 4주                |
| Phase 6-7: 고급 기능   | 4주       | 1주     | 5주                |
| Phase 8-9: 보안/테스트 | 3주       | 1주     | 4주                |
| Phase 10-12: 배포      | 4주       | 1주     | 5주                |
| **총 기간**            | **23주**  | **7주** | **30주 (7.5개월)** |

---

## 다음 단계

### 즉시 시작

1. ✅ 이 계획서 검토
2. ⬜ React Native 프로젝트 생성
3. ⬜ Flask 서버 boilerplate 구축
4. ⬜ PostgreSQL + Docker 환경 셋업

### 의사결정 필요

- [ ] Expo vs React Native CLI 선택
- [ ] 파일 포맷 (JSON Lines vs Protobuf)
- [ ] 서버 호스팅 (AWS vs DigitalOcean vs GCP)
- [ ] 오디오 수집 여부 (배터리/저장소 트레이드오프)
- [ ] iOS 지원 여부 (개발 기간 +50%)

### 추가 고려사항

- [ ] 멀티 기기 동기화 (같은 사용자, 여러 폰)
- [ ] 웹 대시보드 (센서 데이터 시각화)
- [ ] 데이터 내보내기 (CSV, HDF5)
- [ ] API 문서 (Swagger UI)
- [ ] 사용자 커뮤니티 (포럼, Discord)

---

## 부록

### A. 참고 자료

- React Native 공식 문서: https://reactnative.dev
- WatermelonDB: https://watermelondb.dev
- Flask 공식 문서: https://flask.palletsprojects.com
- Local-First 소프트웨어: https://www.inkandswitch.com/local-first/

### B. 오픈소스 라이브러리 라이선스

- React Native: MIT
- WatermelonDB: MIT
- Flask: BSD-3-Clause
- SQLAlchemy: MIT

### C. 용어 정의

- **Local-First**: 로컬 우선 아키텍처
- **LWW**: Last-Write-Wins (마지막 쓰기 우선)
- **Delta Sync**: 차등 동기화
- **IMU**: Inertial Measurement Unit (관성 측정 장치)

---

**작성자**: Claude Code
**버전**: 1.0.0
**최종 수정일**: 2025-11-11
**검토 상태**: ⏳ 검토 대기 중
