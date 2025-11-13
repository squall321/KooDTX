# KooDTX Flask Backend

센서 데이터 동기화 서버 - Phase 41-42 완료

## 📋 목차

- [소개](#소개)
- [기능](#기능)
- [설치](#설치)
- [실행](#실행)
- [API](#api)
- [데이터베이스](#데이터베이스)

## 소개

React Native KooDTX 앱의 백엔드 서버입니다. 센서 데이터를 수집하고 동기화하는 RESTful API를 제공합니다.

## 기능

- ✅ 사용자 인증 (JWT)
- ✅ **Phase 41: 동기화 Push API**
  - 클라이언트 → 서버 데이터 전송
  - 중복 체크 (session_id + sensor_type + timestamp)
  - Last-Write-Wins 충돌 해결
  - 배치 처리 (bulk insert)
  - 동기화 로그 기록
- ✅ **Phase 42: 동기화 Pull API**
  - 서버 → 클라이언트 델타 동기화
  - last_sync_time 기반 변경사항만 전송
  - 페이지네이션 지원 (최대 100개/페이지)
  - 선택적 센서 데이터 포함/제외
  - 서버 타임스탬프 반환
- ⏳ Phase 43-45: Celery 비동기 작업 (예정)
- ⏳ Phase 46: Swagger API 문서 (예정)
- ⏳ Phase 47-48: pytest 테스트 (예정)
- ⏳ Phase 49-50: 프로덕션 배포 (예정)

## 설치

### 1. Python 가상환경 생성

```bash
cd server
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 URL 및 시크릿 키 설정
```

### 4. PostgreSQL 설정

```bash
# PostgreSQL 설치 (Ubuntu)
sudo apt update
sudo apt install postgresql postgresql-contrib

# 데이터베이스 및 사용자 생성
sudo -u postgres psql
CREATE DATABASE koodtx_db;
CREATE USER koodtx WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE koodtx_db TO koodtx;
\q
```

### 5. 데이터베이스 초기화

```bash
flask init-db
```

## 실행

### 개발 서버

```bash
python run.py
# 또는
flask run
```

서버가 `http://localhost:5000`에서 실행됩니다.

### 프로덕션 서버 (Gunicorn)

```bash
gunicorn -c gunicorn_config.py run:app
```

## API

### 인증 API

#### POST `/api/auth/register`
사용자 등록

```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "device_id": "device-uuid"
}
```

#### POST `/api/auth/login`
로그인

```json
{
  "username": "user123",
  "password": "password123"
}
```

#### GET `/api/auth/me`
현재 사용자 정보 (인증 필요)

### 동기화 API (Phase 41)

#### POST `/api/sync/push`
센서 데이터 Push (인증 필요)

**요청 예시:**
```json
{
  "session": {
    "session_id": "uuid",
    "start_time": "2025-11-13T00:00:00Z",
    "end_time": "2025-11-13T01:00:00Z",
    "enabled_sensors": ["accelerometer", "gyroscope", "gps"],
    "sample_rate": 100,
    "notes": "Morning workout session"
  },
  "sensor_data": [
    {
      "sensor_type": "accelerometer",
      "timestamp": 1699876543210,
      "data": {
        "x": 0.1,
        "y": 0.2,
        "z": 9.8
      }
    },
    {
      "sensor_type": "gyroscope",
      "timestamp": 1699876543220,
      "data": {
        "x": 0.01,
        "y": 0.02,
        "z": 0.03
      }
    }
  ]
}
```

**응답:**
```json
{
  "message": "Sync completed successfully",
  "session_id": "uuid",
  "total_records": 1000,
  "inserted": 950,
  "updated": 30,
  "duplicates": 20,
  "errors": 0,
  "sync_log_id": 123,
  "session_data_count": 5000
}
```

#### POST `/api/sync/pull`
센서 데이터 Pull (인증 필요)

**요청 예시:**
```json
{
  "last_sync_time": "2025-11-13T00:00:00Z",
  "session_ids": ["uuid1", "uuid2"],
  "page": 1,
  "page_size": 50,
  "include_data": true
}
```

**응답:**
```json
{
  "sessions": [
    {
      "session_id": "uuid",
      "start_time": "2025-11-13T00:00:00Z",
      "end_time": "2025-11-13T01:00:00Z",
      "is_active": false,
      "enabled_sensors": ["accelerometer", "gyroscope"],
      "sample_rate": 100,
      "data_count": 5000,
      "notes": "Morning workout",
      "is_uploaded": true,
      "created_at": "2025-11-13T00:00:00Z",
      "updated_at": "2025-11-13T01:00:00Z",
      "sensor_data": [
        {
          "sensor_type": "accelerometer",
          "timestamp": 1699876543210,
          "data": {
            "x": 0.1,
            "y": 0.2,
            "z": 9.8
          }
        }
      ]
    }
  ],
  "server_timestamp": "2025-11-13T12:00:00Z",
  "page": 1,
  "page_size": 50,
  "total": 150,
  "has_more": true,
  "sync_log_id": 124
}
```

**파라미터:**
- `last_sync_time` (선택): 마지막 동기화 시간 (ISO 8601 형식). 이후 변경된 세션만 반환
- `session_ids` (선택): 특정 세션 ID 목록. 지정하면 해당 세션만 반환
- `page` (기본값: 1): 페이지 번호
- `page_size` (기본값: 50, 최대: 100): 페이지당 세션 수
- `include_data` (기본값: true): 센서 데이터 포함 여부. false시 메타데이터만 반환

**사용 시나리오:**
1. **초기 동기화**: `last_sync_time` 없이 요청하면 모든 세션 반환
2. **델타 동기화**: `last_sync_time`을 이전 `server_timestamp`로 설정하면 변경사항만 반환
3. **메타데이터만**: `include_data=false`로 세션 목록만 가져온 후, 필요한 세션만 다시 요청
4. **대량 데이터 처리**: `has_more=true`이면 다음 페이지 요청

#### GET `/api/sync/status`
동기화 상태 조회 (인증 필요)

### 헬스 체크

#### GET `/health`
서버 상태 확인

## 데이터베이스

### 스키마

- **users**: 사용자 정보
- **recording_sessions**: 센서 기록 세션
- **sensor_data**: 센서 데이터 (JSONB 형식)
- **sync_logs**: 동기화 로그

### 마이그레이션

```bash
# 마이그레이션 생성
flask db init
flask db migrate -m "Initial migration"

# 마이그레이션 적용
flask db upgrade
```

## Phase 41-42 구현 세부사항

### Phase 41: Push API (클라이언트 → 서버)

#### 중복 체크
- 복합 인덱스: `(session_id, sensor_type, timestamp)`
- 동일한 세션, 센서 타입, 타임스탬프를 가진 데이터는 중복으로 처리

#### Last-Write-Wins
- 중복 데이터 발견 시 서버의 데이터를 클라이언트 데이터로 업데이트
- 동기화 로그에 updated_count 기록

#### 배치 처리
- `bulk_save_objects()` 사용으로 성능 최적화
- 센서 타입별로 그룹화하여 처리

#### 동기화 로그
- 각 동기화 요청마다 로그 생성
- 성공/실패 상태, 레코드 수, 중복 수, 에러 수 기록
- 메타데이터: 삽입/업데이트 수, 센서 타입, 데이터 크기

### Phase 42: Pull API (서버 → 클라이언트)

#### 델타 동기화
- `last_sync_time` 파라미터로 변경사항만 전송
- `updated_at` 컬럼 기반 필터링
- 서버 타임스탬프 반환으로 다음 동기화 시점 제공

#### 페이지네이션
- 기본 페이지 크기: 50개 세션
- 최대 페이지 크기: 100개 세션
- `has_more` 플래그로 추가 데이터 존재 여부 표시
- `total` 필드로 전체 세션 수 제공

#### 선택적 데이터 포함
- `include_data=true`: 센서 데이터 포함 (기본값)
- `include_data=false`: 세션 메타데이터만 반환
- 네트워크 대역폭 최적화

#### 세션 필터링
- `session_ids` 파라미터로 특정 세션만 요청 가능
- 델타 동기화와 함께 사용하여 세밀한 제어

## 다음 단계

- [x] Phase 41: Push API 구현
- [x] Phase 42: Pull API 구현
- [ ] Phase 43: Celery 설치 및 Redis 브로커 설정
- [ ] Phase 44: 센서 데이터 처리 작업 (Pandas, 통계 분석)
- [ ] Phase 45: 파일 정리 작업 (Celery Beat 스케줄링)
- [ ] Phase 46: Swagger/OpenAPI 문서 자동 생성
- [ ] Phase 47: pytest 설치 및 기본 설정
- [ ] Phase 48: Auth 및 Sync API 테스트 작성
- [ ] Phase 49: Gunicorn 프로덕션 서버 설정
- [ ] Phase 50: Supervisor 프로세스 관리 설정

## 라이선스

MIT
