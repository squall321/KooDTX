"""
Pytest Configuration and Fixtures
테스트 픽스처 및 설정
"""

import pytest
from app import create_app, db as _db
from app.config import TestingConfig
from app.models.user import User
from app.models.session import RecordingSession
from app.models.sensor_data import SensorData
from app.models.sync_log import SyncLog
from flask_jwt_extended import create_access_token
from datetime import datetime
import uuid


# ============================================================
# Application Fixtures
# ============================================================

@pytest.fixture(scope='session')
def app():
    """
    Flask 애플리케이션 픽스처 (세션 스코프)
    """
    app = create_app(TestingConfig)

    # Push application context
    ctx = app.app_context()
    ctx.push()

    yield app

    ctx.pop()


@pytest.fixture(scope='session')
def client(app):
    """
    Flask 테스트 클라이언트 픽스처
    """
    return app.test_client()


@pytest.fixture(scope='session')
def runner(app):
    """
    Flask CLI 러너 픽스처
    """
    return app.test_cli_runner()


# ============================================================
# Database Fixtures
# ============================================================

@pytest.fixture(scope='session')
def db(app):
    """
    데이터베이스 픽스처 (세션 스코프)
    SQLite in-memory 데이터베이스
    """
    _db.create_all()

    yield _db

    _db.drop_all()


@pytest.fixture(scope='function')
def session(db):
    """
    데이터베이스 세션 픽스처 (함수 스코프)
    각 테스트 후 자동 롤백
    """
    connection = db.engine.connect()
    transaction = connection.begin()

    # Bind session to connection
    options = dict(bind=connection, binds={})
    session = db.create_scoped_session(options=options)

    db.session = session

    yield session

    transaction.rollback()
    connection.close()
    session.remove()


# ============================================================
# User Fixtures
# ============================================================

@pytest.fixture
def user(session):
    """
    테스트 사용자 픽스처
    """
    user = User(
        username='testuser',
        email='test@example.com',
        device_id='test-device-123'
    )
    user.set_password('password123')

    session.add(user)
    session.commit()

    return user


@pytest.fixture
def another_user(session):
    """
    다른 테스트 사용자 픽스처 (권한 테스트용)
    """
    user = User(
        username='anotheruser',
        email='another@example.com',
        device_id='another-device-456'
    )
    user.set_password('password456')

    session.add(user)
    session.commit()

    return user


@pytest.fixture
def auth_headers(user):
    """
    인증 헤더 픽스처 (JWT 토큰)
    """
    access_token = create_access_token(identity=user.id)
    return {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }


@pytest.fixture
def another_auth_headers(another_user):
    """
    다른 사용자 인증 헤더 픽스처
    """
    access_token = create_access_token(identity=another_user.id)
    return {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }


# ============================================================
# Session Fixtures
# ============================================================

@pytest.fixture
def recording_session(session, user):
    """
    센서 기록 세션 픽스처
    """
    rec_session = RecordingSession(
        user_id=user.id,
        session_id=str(uuid.uuid4()),
        start_time=datetime.utcnow(),
        end_time=None,
        is_active=True,
        enabled_sensors=['accelerometer', 'gyroscope', 'gps'],
        sample_rate=100,
        notes='Test session'
    )

    session.add(rec_session)
    session.commit()

    return rec_session


@pytest.fixture
def completed_session(session, user):
    """
    완료된 세션 픽스처
    """
    from datetime import timedelta

    start_time = datetime.utcnow() - timedelta(hours=1)
    end_time = datetime.utcnow()

    rec_session = RecordingSession(
        user_id=user.id,
        session_id=str(uuid.uuid4()),
        start_time=start_time,
        end_time=end_time,
        is_active=False,
        enabled_sensors=['accelerometer', 'gyroscope'],
        sample_rate=100,
        data_count=1000,
        notes='Completed test session',
        is_uploaded=True
    )

    session.add(rec_session)
    session.commit()

    return rec_session


# ============================================================
# Sensor Data Fixtures
# ============================================================

@pytest.fixture
def sensor_data_batch(session, recording_session):
    """
    센서 데이터 배치 픽스처 (100개)
    """
    import random

    data_list = []
    base_timestamp = int(datetime.utcnow().timestamp() * 1000)

    for i in range(100):
        # Accelerometer data
        data = SensorData(
            session_id=recording_session.id,
            sensor_type='accelerometer',
            timestamp=base_timestamp + i * 10,
            data={
                'x': random.uniform(-2.0, 2.0),
                'y': random.uniform(-2.0, 2.0),
                'z': random.uniform(8.0, 11.0)
            },
            is_uploaded=False
        )
        data_list.append(data)

    session.bulk_save_objects(data_list)
    session.commit()

    return data_list


@pytest.fixture
def gps_sensor_data(session, recording_session):
    """
    GPS 센서 데이터 픽스처
    """
    base_timestamp = int(datetime.utcnow().timestamp() * 1000)

    gps_data = SensorData(
        session_id=recording_session.id,
        sensor_type='gps',
        timestamp=base_timestamp,
        data={
            'latitude': 37.5665,
            'longitude': 126.9780,
            'altitude': 100.0,
            'accuracy': 10.0,
            'speed': 5.0,
            'heading': 90.0
        },
        is_uploaded=False
    )

    session.add(gps_data)
    session.commit()

    return gps_data


# ============================================================
# Sync Log Fixtures
# ============================================================

@pytest.fixture
def sync_log(session, user, recording_session):
    """
    동기화 로그 픽스처
    """
    log = SyncLog(
        user_id=user.id,
        session_id=recording_session.id,
        sync_type='push',
        status='success',
        started_at=datetime.utcnow(),
        completed_at=datetime.utcnow(),
        records_count=100,
        duplicates_count=0,
        errors_count=0,
        metadata={'inserted': 100, 'updated': 0}
    )

    session.add(log)
    session.commit()

    return log


# ============================================================
# Sample Data Fixtures
# ============================================================

@pytest.fixture
def sample_push_data(recording_session):
    """
    Push API 샘플 데이터 픽스처
    """
    return {
        'session': {
            'session_id': str(recording_session.session_id),
            'start_time': recording_session.start_time.isoformat() + 'Z',
            'end_time': datetime.utcnow().isoformat() + 'Z',
            'enabled_sensors': ['accelerometer', 'gyroscope'],
            'sample_rate': 100,
            'notes': 'Test push data'
        },
        'sensor_data': [
            {
                'sensor_type': 'accelerometer',
                'timestamp': int(datetime.utcnow().timestamp() * 1000),
                'data': {'x': 0.1, 'y': 0.2, 'z': 9.8}
            },
            {
                'sensor_type': 'gyroscope',
                'timestamp': int(datetime.utcnow().timestamp() * 1000) + 10,
                'data': {'x': 0.01, 'y': 0.02, 'z': 0.03}
            }
        ]
    }


@pytest.fixture
def sample_pull_data():
    """
    Pull API 샘플 요청 데이터 픽스처
    """
    return {
        'last_sync_time': datetime.utcnow().isoformat() + 'Z',
        'page': 1,
        'page_size': 50,
        'include_data': True
    }


# ============================================================
# Helper Functions
# ============================================================

@pytest.fixture
def create_user_func(session):
    """
    사용자 생성 헬퍼 함수 픽스처
    """
    def _create_user(username=None, email=None, password='password123'):
        if not username:
            username = f'user_{uuid.uuid4().hex[:8]}'
        if not email:
            email = f'{username}@example.com'

        user = User(
            username=username,
            email=email,
            device_id=f'device-{uuid.uuid4()}'
        )
        user.set_password(password)

        session.add(user)
        session.commit()

        return user

    return _create_user


@pytest.fixture
def create_session_func(session):
    """
    세션 생성 헬퍼 함수 픽스처
    """
    def _create_session(user_id, **kwargs):
        rec_session = RecordingSession(
            user_id=user_id,
            session_id=kwargs.get('session_id', str(uuid.uuid4())),
            start_time=kwargs.get('start_time', datetime.utcnow()),
            end_time=kwargs.get('end_time'),
            is_active=kwargs.get('is_active', True),
            enabled_sensors=kwargs.get('enabled_sensors', ['accelerometer']),
            sample_rate=kwargs.get('sample_rate', 100),
            notes=kwargs.get('notes', '')
        )

        session.add(rec_session)
        session.commit()

        return rec_session

    return _create_session


# ============================================================
# Cleanup
# ============================================================

@pytest.fixture(autouse=True)
def reset_database(session):
    """
    각 테스트 후 데이터베이스 자동 정리
    """
    yield

    # 테스트 후 실행
    session.rollback()
