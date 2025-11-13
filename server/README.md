# KooDTX Flask Backend

센서 데이터 동기화 서버 - Phase 41-50 완료

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
- ✅ **Phase 43: Celery 설치 및 Redis 브로커 설정**
  - Celery 비동기 작업 큐
  - Redis 메시지 브로커
  - Celery Beat 스케줄러 (주기적 작업)
  - Worker 및 Beat 실행 스크립트
- ✅ **Phase 44: 센서 데이터 처리 작업**
  - Pandas를 이용한 센서 데이터 분석
  - 통계 생성 (평균, 표준편차, 피크값 등)
  - 이상치 탐지 (Z-score 방법)
  - GPS 이동 거리 계산
  - 세션 메트릭 계산
- ✅ **Phase 45: 파일 정리 작업**
  - 오래된 센서 데이터 자동 정리
  - 동기화 로그 정리
  - 업로드 파일 정리
  - 실패/중단 세션 정리
  - 데이터베이스 최적화
  - Celery Beat 스케줄링
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

### 5. Redis 설치 및 실행

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Redis 상태 확인
redis-cli ping  # 응답: PONG
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

### 6. 데이터베이스 초기화

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

### Celery Worker (비동기 작업 처리)

**터미널 1 - Celery Worker 시작:**
```bash
./start_celery_worker.sh
# 또는
celery -A celery_app.celery worker --loglevel=info
```

**터미널 2 - Celery Beat 시작 (스케줄러):**
```bash
./start_celery_beat.sh
# 또는
celery -A celery_app.celery beat --loglevel=info
```

**Flower (Celery 모니터링 웹 UI):**
```bash
pip install flower
celery -A celery_app.celery flower --port=5555
# 브라우저에서 http://localhost:5555 접속
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

### Phase 43-45: Celery 비동기 작업 시스템

#### Phase 43: Celery 설치 및 설정

**Celery 앱 구조:**
```python
# celery_app.py
celery = Celery(
    'koodtx',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0',
    include=['app.tasks.data_processing', 'app.tasks.file_cleanup']
)
```

**설정:**
- 작업 타임아웃: 5분 (하드), 4분 (소프트)
- 직렬화: JSON
- Worker prefetch: 1 (한 번에 하나씩 처리)
- Worker 재시작 주기: 1000개 작업마다

**Beat 스케줄:**
- 센서 데이터 정리: 24시간마다 (30일 이상 된 데이터)
- 동기화 로그 정리: 7일마다 (90일 이상 된 로그)

#### Phase 44: 데이터 처리 작업

**1. analyze_sensor_data(session_id)**
- 센서 데이터 통계 분석
- 센서 타입별 평균, 표준편차, min/max
- GPS 이동 거리 계산 (Haversine formula)
- 세션 지속 시간 및 레코드 수

**2. generate_statistics(user_id, start_date, end_date)**
- 사용자별 통계 생성
- 총 세션 수, 총 데이터 레코드 수
- 총 지속 시간, 평균 세션 시간
- 센서 타입 사용 빈도

**3. detect_anomalies(session_id, sensitivity=3.0)**
- Z-score 기반 이상치 탐지
- 3축 센서 magnitude 계산
- 표준편차 3배 이상 값 감지
- 이상치 비율 및 타임스탬프 반환

**4. calculate_session_metrics(session_id)**
- 세션 주요 메트릭 계산
- 각 축별 통계 (mean, std, min, max, peak-to-peak)
- 샘플 카운트 및 데이터 품질 지표

**사용 예시:**
```python
# 비동기 작업 예약
from app.tasks.data_processing import analyze_sensor_data

result = analyze_sensor_data.delay(session_id=123)

# 결과 확인
if result.ready():
    analysis = result.get()
    print(analysis)
```

#### Phase 45: 파일 정리 작업

**1. cleanup_old_sensor_data(days=30)**
- 업로드 완료되고 종료된 세션의 오래된 센서 데이터 삭제
- 기본값: 30일 이상 된 데이터
- 세션 메타데이터는 유지 (분석용)

**2. cleanup_old_sync_logs(days=90)**
- 오래된 동기화 로그 삭제
- 기본값: 90일 이상 된 로그

**3. cleanup_uploaded_files(days=7)**
- 임시 업로드 파일 정리
- 처리 완료된 파일 삭제
- 기본값: 7일 이상 된 파일

**4. cleanup_failed_sessions(hours=24)**
- 실패하거나 중단된 세션 정리
- is_active=True 상태로 24시간 이상 방치된 세션
- 자동으로 종료 처리 및 노트 추가

**5. optimize_database()**
- PostgreSQL VACUUM ANALYZE
- 테이블별 통계 수집
- 인덱스 최적화

**6. generate_cleanup_report()**
- 전체 시스템 통계 리포트
- 디스크 사용량
- 최근 30일 활동 통계

**Celery Beat 스케줄:**
```python
beat_schedule = {
    'cleanup-old-data': {
        'task': 'app.tasks.file_cleanup.cleanup_old_sensor_data',
        'schedule': 3600.0 * 24,  # 매일
        'args': (30,)  # 30일
    },
    'cleanup-sync-logs': {
        'task': 'app.tasks.file_cleanup.cleanup_old_sync_logs',
        'schedule': 3600.0 * 24 * 7,  # 매주
        'args': (90,)  # 90일
    },
}
```

**수동 실행:**
```python
from app.tasks.file_cleanup import cleanup_old_sensor_data

# 즉시 실행
result = cleanup_old_sensor_data.apply_async(args=[30])

# 지연 실행 (10분 후)
result = cleanup_old_sensor_data.apply_async(args=[30], countdown=600)

# 특정 시간에 실행
from datetime import datetime, timedelta
eta = datetime.utcnow() + timedelta(hours=1)
result = cleanup_old_sensor_data.apply_async(args=[30], eta=eta)
```

## 다음 단계

- [x] Phase 41: Push API 구현
- [x] Phase 42: Pull API 구현
- [x] Phase 43: Celery 설치 및 Redis 브로커 설정
- [x] Phase 44: 센서 데이터 처리 작업 (Pandas, 통계 분석)
- [x] Phase 45: 파일 정리 작업 (Celery Beat 스케줄링)
- [x] Phase 46: Swagger/OpenAPI 문서 자동 생성
- [x] Phase 47: pytest 설치 및 기본 설정
- [x] Phase 48: Auth 및 Sync API 테스트 작성
- [x] Phase 49: Gunicorn 프로덕션 서버 설정
- [x] Phase 50: Supervisor 프로세스 관리 설정

## 라이선스

MIT

### Phase 46-47: API 문서화 및 테스트 설정

#### Phase 46: Swagger/OpenAPI 문서

**Swagger UI**: `http://localhost:5000/docs/`

**flask-restx** 기반 자동 API 문서 생성:
- 인터랙티브 API 탐색기
- 요청/응답 스키마 정의
- JWT 인증 지원
- Try it out 기능

**문서화된 엔드포인트**:
```
GET  /docs/            # Swagger UI
GET  /                 # API 정보
GET  /health           # 헬스 체크

POST /api/auth/register  # 사용자 등록
POST /api/auth/login     # 로그인
POST /api/auth/refresh   # 토큰 갱신
GET  /api/auth/me        # 현재 사용자

POST /api/sync/push      # 센서 데이터 Push
POST /api/sync/pull      # 센서 데이터 Pull
GET  /api/sync/status    # 동기화 상태
```

**Swagger 모델**:
- AuthRegister, AuthLogin, AuthResponse
- SyncPushRequest, SyncPushResponse
- SyncPullRequest, SyncPullResponse
- SensorDataItem, RecordingSession
- ErrorResponse

#### Phase 47: pytest 테스트 설정

**테스트 실행**:
```bash
# 모든 테스트 실행
pytest

# 특정 마커만 실행
pytest -m unit          # 단위 테스트
pytest -m integration   # 통합 테스트
pytest -m api           # API 테스트

# Coverage 리포트
pytest --cov=app --cov-report=html
open htmlcov/index.html

# Verbose 출력
pytest -v

# 특정 파일만 테스트
pytest tests/test_app.py
```

**pytest.ini 설정**:
- Coverage 80% 목표
- HTML, XML, Terminal 리포트
- 마커 기반 테스트 분류
- 자동 데이터베이스 정리

**테스트 픽스처 (conftest.py)**:
```python
# 애플리케이션
- app: Flask 앱 인스턴스
- client: 테스트 클라이언트
- db: 데이터베이스 세션

# 사용자
- user: 테스트 사용자
- auth_headers: JWT 인증 헤더

# 세션
- recording_session: 활성 세션
- completed_session: 완료된 세션

# 센서 데이터
- sensor_data_batch: 100개 데이터
- gps_sensor_data: GPS 데이터

# 헬퍼
- create_user_func: 사용자 생성 함수
- create_session_func: 세션 생성 함수
```

**테스트 마커**:
- `@pytest.mark.unit` - 단위 테스트 (빠름)
- `@pytest.mark.integration` - 통합 테스트
- `@pytest.mark.api` - API 엔드포인트 테스트
- `@pytest.mark.auth` - 인증 테스트
- `@pytest.mark.sync` - 동기화 테스트
- `@pytest.mark.celery` - Celery 작업 테스트
- `@pytest.mark.smoke` - 스모크 테스트

**테스트 구조**:
```
tests/
├── conftest.py           # 픽스처 정의
├── test_app.py           # 앱 기본 테스트
├── test_models.py        # 모델 테스트
├── test_auth.py          # 인증 API 테스트 (Phase 48)
├── test_sync.py          # 동기화 API 테스트 (Phase 48)
└── test_tasks.py         # Celery 작업 테스트 (Phase 48)
```


### Phase 48-50: 테스트 작성 및 프로덕션 배포 설정

#### Phase 48: Auth 및 Sync API 테스트 작성

**테스트 파일**:
- `tests/test_auth.py` - Auth API 테스트 (40+ tests)
- `tests/test_sync.py` - Sync API 테스트 (35+ tests)
- `tests/test_tasks.py` - Celery 작업 테스트 (20+ tests)

**test_auth.py** - 인증 API 테스트:
```python
# 사용자 등록 테스트
- test_register_success
- test_register_duplicate_username
- test_register_duplicate_email

# 로그인 테스트
- test_login_success
- test_login_wrong_password

# 토큰 갱신 테스트
- test_refresh_token_success

# 전체 플로우 테스트
- test_complete_auth_flow (등록→로그인→정보조회→토큰갱신)
```

**test_sync.py** - 동기화 API 테스트:
```python
# Push API 테스트
- test_push_new_session_success
- test_push_update_existing_session
- test_push_duplicate_data (Last-Write-Wins)
- test_push_large_batch (100개 데이터)

# Pull API 테스트
- test_pull_with_data
- test_pull_delta_sync
- test_pull_pagination
- test_pull_specific_sessions

# 전체 플로우 테스트
- test_complete_sync_flow (Push→Pull→Status)
```

**test_tasks.py** - Celery 작업 테스트:
```python
# 데이터 처리 테스트
- test_analyze_sensor_data
- test_generate_statistics
- test_detect_anomalies
- test_calculate_session_metrics

# 파일 정리 테스트
- test_cleanup_old_sensor_data
- test_cleanup_old_sync_logs
- test_cleanup_failed_sessions

# 성능 테스트
- test_analyze_large_dataset (1000개 데이터)
```

**테스트 실행**:
```bash
# 모든 테스트
pytest

# Auth 테스트만
pytest tests/test_auth.py -v

# Sync 테스트만
pytest tests/test_sync.py -v

# 마커별 실행
pytest -m unit
pytest -m integration
pytest -m api

# Coverage 리포트
pytest --cov=app --cov-report=html
```

#### Phase 49: Gunicorn 프로덕션 서버 설정

**gunicorn_config.py** - Gunicorn 설정:
```python
# Worker 설정
workers = CPU * 2 + 1
worker_class = 'sync'
timeout = 30
keepalive = 2

# 로깅
accesslog = '-'  # stdout
errorlog = '-'   # stderr
loglevel = 'info'

# 최적화
preload_app = True
max_requests = 1000
max_requests_jitter = 50
```

**프로덕션 서버 시작**:
```bash
# 스크립트 사용
./start_production.sh

# 또는 직접 실행
gunicorn --config gunicorn_config.py run:app

# 데몬 모드
gunicorn --config gunicorn_config.py --daemon run:app
```

**systemd service** (선택):
```bash
# Service 파일 복사
sudo cp koodtx-backend.service /etc/systemd/system/

# 서비스 활성화
sudo systemctl enable koodtx-backend
sudo systemctl start koodtx-backend

# 상태 확인
sudo systemctl status koodtx-backend
```

#### Phase 50: Supervisor 프로세스 관리 설정

**supervisor.conf** - Supervisor 설정:
```ini
[group:koodtx]
programs=koodtx-backend,koodtx-celery-worker,koodtx-celery-beat

# Flask Backend (Gunicorn)
[program:koodtx-backend]
command=gunicorn --config gunicorn_config.py run:app
autostart=true
autorestart=true

# Celery Worker
[program:koodtx-celery-worker]
command=celery -A celery_app.celery worker --loglevel=info

# Celery Beat
[program:koodtx-celery-beat]
command=celery -A celery_app.celery beat --loglevel=info
```

**Supervisor 설치 및 설정**:
```bash
# Supervisor 설치 및 설정
./supervisor_setup.sh

# 프로세스 관리 (간편 스크립트)
./manage_processes.sh start    # 모두 시작
./manage_processes.sh stop     # 모두 중지
./manage_processes.sh restart  # 모두 재시작
./manage_processes.sh status   # 상태 확인
./manage_processes.sh logs     # 로그 보기

# 개별 프로세스 관리
./manage_processes.sh backend-restart
./manage_processes.sh worker-restart
./manage_processes.sh beat-restart

# 또는 직접 supervisorctl 사용
sudo supervisorctl status koodtx:*
sudo supervisorctl start koodtx:*
sudo supervisorctl stop koodtx:*
sudo supervisorctl restart koodtx:*
```

**프로세스 로그**:
```bash
# 실시간 로그
sudo supervisorctl tail -f koodtx-backend
sudo supervisorctl tail -f koodtx-celery-worker
sudo supervisorctl tail -f koodtx-celery-beat

# 로그 파일 위치
/var/log/supervisor/koodtx-backend.log
/var/log/supervisor/koodtx-celery-worker.log
/var/log/supervisor/koodtx-celery-beat.log
```

### 프로덕션 배포 체크리스트

1. **환경 변수 설정**:
   ```bash
   cp .env.example .env
   # .env 파일 수정 (비밀키, 데이터베이스 URL 등)
   ```

2. **데이터베이스 초기화**:
   ```bash
   flask db upgrade
   ```

3. **정적 파일 수집** (필요시):
   ```bash
   # Nginx/Apache 설정에 따라
   ```

4. **Gunicorn 테스트**:
   ```bash
   gunicorn --config gunicorn_config.py run:app
   ```

5. **Supervisor 설정**:
   ```bash
   ./supervisor_setup.sh
   ./manage_processes.sh start
   ```

6. **상태 확인**:
   ```bash
   ./manage_processes.sh status
   curl http://localhost:5000/health
   ```

7. **모니터링 설정** (권장):
   - Prometheus + Grafana
   - ELK Stack (로그)
   - Sentry (에러 트래킹)

