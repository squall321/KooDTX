"""
Swagger API Models
요청/응답 스키마 정의
"""

from flask_restx import fields
from app.swagger import api

# ============================================================
# Auth Models
# ============================================================

auth_register = api.model('AuthRegister', {
    'username': fields.String(required=True, description='사용자명', example='testuser'),
    'email': fields.String(required=True, description='이메일', example='test@example.com'),
    'password': fields.String(required=True, description='비밀번호', example='password123'),
    'device_id': fields.String(required=True, description='기기 고유 ID', example='device-uuid-123')
})

auth_login = api.model('AuthLogin', {
    'username': fields.String(required=True, description='사용자명', example='testuser'),
    'password': fields.String(required=True, description='비밀번호', example='password123')
})

auth_response = api.model('AuthResponse', {
    'access_token': fields.String(description='JWT 액세스 토큰'),
    'refresh_token': fields.String(description='JWT 리프레시 토큰'),
    'user': fields.Nested(api.model('User', {
        'id': fields.Integer(description='사용자 ID'),
        'username': fields.String(description='사용자명'),
        'email': fields.String(description='이메일'),
        'device_id': fields.String(description='기기 ID')
    }))
})

auth_refresh = api.model('AuthRefresh', {
    'refresh_token': fields.String(required=True, description='리프레시 토큰')
})

# ============================================================
# Sync Models
# ============================================================

sensor_data_item = api.model('SensorDataItem', {
    'sensor_type': fields.String(required=True, description='센서 타입',
                                  example='accelerometer',
                                  enum=['accelerometer', 'gyroscope', 'magnetometer', 'gps',
                                        'proximity', 'light', 'pressure', 'gravity',
                                        'linear_acceleration', 'rotation_vector',
                                        'temperature', 'humidity']),
    'timestamp': fields.Integer(required=True, description='타임스탬프 (밀리초)', example=1699876543210),
    'data': fields.Raw(required=True, description='센서 데이터 (JSONB)',
                       example={'x': 0.1, 'y': 0.2, 'z': 9.8})
})

recording_session = api.model('RecordingSession', {
    'session_id': fields.String(required=True, description='세션 UUID', example='uuid-123'),
    'start_time': fields.String(required=True, description='시작 시간 (ISO 8601)',
                                 example='2025-11-13T00:00:00Z'),
    'end_time': fields.String(description='종료 시간 (ISO 8601)', example='2025-11-13T01:00:00Z'),
    'enabled_sensors': fields.List(fields.String, description='활성화된 센서 목록',
                                    example=['accelerometer', 'gyroscope']),
    'sample_rate': fields.Integer(description='샘플링 레이트 (Hz)', example=100),
    'notes': fields.String(description='메모', example='Morning workout session')
})

sync_push_request = api.model('SyncPushRequest', {
    'session': fields.Nested(recording_session, required=True, description='세션 정보'),
    'sensor_data': fields.List(fields.Nested(sensor_data_item), required=True,
                                description='센서 데이터 배열')
})

sync_push_response = api.model('SyncPushResponse', {
    'message': fields.String(description='결과 메시지'),
    'session_id': fields.String(description='세션 UUID'),
    'total_records': fields.Integer(description='총 레코드 수'),
    'inserted': fields.Integer(description='삽입된 레코드 수'),
    'updated': fields.Integer(description='업데이트된 레코드 수'),
    'duplicates': fields.Integer(description='중복 레코드 수'),
    'errors': fields.Integer(description='에러 수'),
    'sync_log_id': fields.Integer(description='동기화 로그 ID'),
    'session_data_count': fields.Integer(description='세션의 총 데이터 수')
})

sync_pull_request = api.model('SyncPullRequest', {
    'last_sync_time': fields.String(description='마지막 동기화 시간 (ISO 8601)',
                                     example='2025-11-13T00:00:00Z'),
    'session_ids': fields.List(fields.String, description='특정 세션 ID 목록 (선택)',
                                example=['uuid1', 'uuid2']),
    'page': fields.Integer(description='페이지 번호', default=1, example=1),
    'page_size': fields.Integer(description='페이지 크기 (1-100)', default=50, example=50),
    'include_data': fields.Boolean(description='센서 데이터 포함 여부', default=True, example=True)
})

session_with_data = api.model('SessionWithData', {
    'session_id': fields.String(description='세션 UUID'),
    'start_time': fields.String(description='시작 시간 (ISO 8601)'),
    'end_time': fields.String(description='종료 시간 (ISO 8601)'),
    'is_active': fields.Boolean(description='활성 상태'),
    'enabled_sensors': fields.List(fields.String, description='활성화된 센서'),
    'sample_rate': fields.Integer(description='샘플링 레이트'),
    'data_count': fields.Integer(description='데이터 개수'),
    'notes': fields.String(description='메모'),
    'is_uploaded': fields.Boolean(description='업로드 완료 여부'),
    'created_at': fields.String(description='생성 시간'),
    'updated_at': fields.String(description='업데이트 시간'),
    'sensor_data': fields.List(fields.Nested(sensor_data_item), description='센서 데이터')
})

sync_pull_response = api.model('SyncPullResponse', {
    'sessions': fields.List(fields.Nested(session_with_data), description='세션 목록'),
    'server_timestamp': fields.String(description='서버 타임스탬프 (ISO 8601)'),
    'page': fields.Integer(description='현재 페이지'),
    'page_size': fields.Integer(description='페이지 크기'),
    'total': fields.Integer(description='전체 세션 수'),
    'has_more': fields.Boolean(description='추가 페이지 존재 여부'),
    'sync_log_id': fields.Integer(description='동기화 로그 ID')
})

sync_status_response = api.model('SyncStatusResponse', {
    'total_sessions': fields.Integer(description='총 세션 수'),
    'active_sessions': fields.Integer(description='활성 세션 수'),
    'uploaded_sessions': fields.Integer(description='업로드 완료 세션 수'),
    'recent_syncs': fields.List(fields.Raw, description='최근 동기화 로그')
})

# ============================================================
# Error Models
# ============================================================

error_response = api.model('ErrorResponse', {
    'error': fields.String(description='에러 메시지'),
    'details': fields.String(description='상세 정보')
})

# ============================================================
# Task Models (Celery)
# ============================================================

task_result = api.model('TaskResult', {
    'task_id': fields.String(description='작업 ID'),
    'status': fields.String(description='작업 상태', enum=['PENDING', 'STARTED', 'SUCCESS', 'FAILURE']),
    'result': fields.Raw(description='작업 결과')
})

analyze_request = api.model('AnalyzeRequest', {
    'session_id': fields.Integer(required=True, description='세션 ID', example=123)
})

statistics_request = api.model('StatisticsRequest', {
    'user_id': fields.Integer(required=True, description='사용자 ID', example=1),
    'start_date': fields.String(description='시작 날짜 (ISO 8601)', example='2025-11-01T00:00:00Z'),
    'end_date': fields.String(description='종료 날짜 (ISO 8601)', example='2025-11-13T23:59:59Z')
})

anomaly_request = api.model('AnomalyRequest', {
    'session_id': fields.Integer(required=True, description='세션 ID', example=123),
    'sensitivity': fields.Float(description='민감도 (Z-score 임계값)', default=3.0, example=3.0)
})

cleanup_request = api.model('CleanupRequest', {
    'days': fields.Integer(description='보관 기간 (일)', default=30, example=30)
})
