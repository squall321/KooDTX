"""
Test Database Models
데이터베이스 모델 테스트
"""

import pytest
from app.models.user import User
from app.models.session import RecordingSession
from app.models.sensor_data import SensorData
from app.models.sync_log import SyncLog
from datetime import datetime
import uuid


@pytest.mark.unit
class TestUserModel:
    """User 모델 테스트"""

    def test_create_user(self, session):
        """사용자 생성 테스트"""
        user = User(
            username='newuser',
            email='newuser@example.com',
            device_id='device-new-123'
        )
        user.set_password('newpassword')

        session.add(user)
        session.commit()

        assert user.id is not None
        assert user.username == 'newuser'
        assert user.email == 'newuser@example.com'

    def test_password_hashing(self, session):
        """비밀번호 해싱 테스트"""
        user = User(
            username='hashtest',
            email='hash@example.com',
            device_id='device-hash-456'
        )
        password = 'mypassword123'
        user.set_password(password)

        session.add(user)
        session.commit()

        # 비밀번호가 해싱되어 저장됨
        assert user.password_hash != password

        # 올바른 비밀번호로 검증 성공
        assert user.check_password(password) is True

        # 잘못된 비밀번호로 검증 실패
        assert user.check_password('wrongpassword') is False

    def test_user_to_dict(self, user):
        """사용자 to_dict() 메서드 테스트"""
        user_dict = user.to_dict()

        assert user_dict['id'] == user.id
        assert user_dict['username'] == user.username
        assert user_dict['email'] == user.email
        assert 'password_hash' not in user_dict  # 비밀번호는 포함되지 않음


@pytest.mark.unit
class TestRecordingSessionModel:
    """RecordingSession 모델 테스트"""

    def test_create_session(self, session, user):
        """세션 생성 테스트"""
        rec_session = RecordingSession(
            user_id=user.id,
            session_id=str(uuid.uuid4()),
            start_time=datetime.utcnow(),
            enabled_sensors=['accelerometer', 'gyroscope'],
            sample_rate=100
        )

        session.add(rec_session)
        session.commit()

        assert rec_session.id is not None
        assert rec_session.user_id == user.id
        assert rec_session.is_active is True  # 기본값
        assert rec_session.data_count == 0  # 기본값

    def test_session_relationship(self, recording_session, user):
        """세션-사용자 관계 테스트"""
        assert recording_session.user_id == user.id
        # SQLAlchemy relationship이 설정되어 있다면:
        # assert recording_session.user.username == user.username


@pytest.mark.unit
class TestSensorDataModel:
    """SensorData 모델 테스트"""

    def test_create_sensor_data(self, session, recording_session):
        """센서 데이터 생성 테스트"""
        sensor_data = SensorData(
            session_id=recording_session.id,
            sensor_type='accelerometer',
            timestamp=int(datetime.utcnow().timestamp() * 1000),
            data={'x': 0.1, 'y': 0.2, 'z': 9.8},
            is_uploaded=False
        )

        session.add(sensor_data)
        session.commit()

        assert sensor_data.id is not None
        assert sensor_data.sensor_type == 'accelerometer'
        assert sensor_data.data['x'] == 0.1

    def test_sensor_data_jsonb(self, gps_sensor_data):
        """JSONB 필드 테스트"""
        assert gps_sensor_data.data['latitude'] == 37.5665
        assert gps_sensor_data.data['longitude'] == 126.9780
        assert 'altitude' in gps_sensor_data.data


@pytest.mark.unit
class TestSyncLogModel:
    """SyncLog 모델 테스트"""

    def test_create_sync_log(self, session, user):
        """동기화 로그 생성 테스트"""
        log = SyncLog(
            user_id=user.id,
            sync_type='push',
            status='success',
            started_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
            records_count=100
        )

        session.add(log)
        session.commit()

        assert log.id is not None
        assert log.sync_type == 'push'
        assert log.status == 'success'

    def test_sync_log_to_dict(self, sync_log):
        """동기화 로그 to_dict() 테스트"""
        log_dict = sync_log.to_dict()

        assert log_dict['id'] == sync_log.id
        assert log_dict['sync_type'] == 'push'
        assert log_dict['status'] == 'success'
        assert log_dict['records_count'] == 100
