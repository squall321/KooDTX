"""
Test Sync API
동기화 API 엔드포인트 통합 테스트
"""

import pytest
import json
from datetime import datetime, timedelta
from app.models.session import RecordingSession
from app.models.sensor_data import SensorData
from app.models.sync_log import SyncLog
import uuid


@pytest.mark.api
@pytest.mark.sync
class TestSyncPush:
    """센서 데이터 Push API 테스트"""

    def test_push_new_session_success(self, client, user, auth_headers):
        """새 세션 Push 성공 테스트"""
        session_id = str(uuid.uuid4())
        data = {
            'session': {
                'session_id': session_id,
                'start_time': datetime.utcnow().isoformat() + 'Z',
                'end_time': (datetime.utcnow() + timedelta(hours=1)).isoformat() + 'Z',
                'enabled_sensors': ['accelerometer', 'gyroscope'],
                'sample_rate': 100,
                'notes': 'Test push session'
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

        response = client.post(
            '/api/sync/push',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 200
        result = response.get_json()

        assert result['message'] == 'Sync completed successfully'
        assert result['session_id'] == session_id
        assert result['total_records'] == 2
        assert result['inserted'] == 2
        assert result['updated'] == 0
        assert result['duplicates'] == 0

        # 데이터베이스 확인
        session = RecordingSession.query.filter_by(session_id=session_id).first()
        assert session is not None
        assert session.user_id == user.id

        sensor_data_count = SensorData.query.filter_by(session_id=session.id).count()
        assert sensor_data_count == 2

    def test_push_update_existing_session(self, client, user, auth_headers, recording_session):
        """기존 세션 업데이트 테스트"""
        data = {
            'session': {
                'session_id': str(recording_session.session_id),
                'start_time': recording_session.start_time.isoformat() + 'Z',
                'end_time': datetime.utcnow().isoformat() + 'Z',  # 종료 시간 추가
                'enabled_sensors': ['accelerometer'],
                'sample_rate': 100,
                'notes': 'Updated notes'
            },
            'sensor_data': [
                {
                    'sensor_type': 'accelerometer',
                    'timestamp': int(datetime.utcnow().timestamp() * 1000),
                    'data': {'x': 1.0, 'y': 2.0, 'z': 10.0}
                }
            ]
        }

        response = client.post(
            '/api/sync/push',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 200
        result = response.get_json()

        assert result['inserted'] == 1

        # 세션 업데이트 확인
        updated_session = RecordingSession.query.filter_by(
            session_id=recording_session.session_id
        ).first()
        assert updated_session.end_time is not None
        assert updated_session.notes == 'Updated notes'

    def test_push_duplicate_data(self, client, user, auth_headers, recording_session):
        """중복 데이터 Push 테스트 (Last-Write-Wins)"""
        timestamp = int(datetime.utcnow().timestamp() * 1000)

        # 첫 번째 Push
        data1 = {
            'session': {
                'session_id': str(recording_session.session_id),
                'start_time': recording_session.start_time.isoformat() + 'Z',
                'enabled_sensors': ['accelerometer'],
                'sample_rate': 100
            },
            'sensor_data': [
                {
                    'sensor_type': 'accelerometer',
                    'timestamp': timestamp,
                    'data': {'x': 1.0, 'y': 1.0, 'z': 1.0}
                }
            ]
        }

        response1 = client.post(
            '/api/sync/push',
            headers=auth_headers,
            data=json.dumps(data1)
        )

        assert response1.status_code == 200
        result1 = response1.get_json()
        assert result1['inserted'] == 1

        # 같은 타임스탬프로 두 번째 Push (중복)
        data2 = {
            'session': {
                'session_id': str(recording_session.session_id),
                'start_time': recording_session.start_time.isoformat() + 'Z',
                'enabled_sensors': ['accelerometer'],
                'sample_rate': 100
            },
            'sensor_data': [
                {
                    'sensor_type': 'accelerometer',
                    'timestamp': timestamp,  # 동일한 타임스탬프
                    'data': {'x': 2.0, 'y': 2.0, 'z': 2.0}  # 다른 값
                }
            ]
        }

        response2 = client.post(
            '/api/sync/push',
            headers=auth_headers,
            data=json.dumps(data2)
        )

        assert response2.status_code == 200
        result2 = response2.get_json()
        assert result2['updated'] == 1  # 업데이트됨
        assert result2['inserted'] == 0

        # Last-Write-Wins 확인
        sensor_data = SensorData.query.filter_by(
            session_id=recording_session.id,
            timestamp=timestamp
        ).first()
        assert sensor_data.data['x'] == 2.0  # 새 값으로 업데이트됨

    def test_push_without_auth(self, client):
        """인증 없이 Push 시도 테스트"""
        data = {
            'session': {
                'session_id': str(uuid.uuid4()),
                'start_time': datetime.utcnow().isoformat() + 'Z',
                'enabled_sensors': ['accelerometer'],
                'sample_rate': 100
            },
            'sensor_data': []
        }

        response = client.post(
            '/api/sync/push',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 401

    def test_push_invalid_data(self, client, auth_headers):
        """잘못된 데이터 형식 Push 테스트"""
        data = {
            'session': {
                # session_id 누락
                'start_time': datetime.utcnow().isoformat() + 'Z'
            },
            'sensor_data': []
        }

        response = client.post(
            '/api/sync/push',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 400
        result = response.get_json()
        assert 'error' in result

    def test_push_large_batch(self, client, user, auth_headers):
        """대량 데이터 Push 테스트"""
        session_id = str(uuid.uuid4())
        base_timestamp = int(datetime.utcnow().timestamp() * 1000)

        # 100개의 센서 데이터 생성
        sensor_data_list = []
        for i in range(100):
            sensor_data_list.append({
                'sensor_type': 'accelerometer',
                'timestamp': base_timestamp + i * 10,
                'data': {'x': i * 0.1, 'y': i * 0.2, 'z': 9.8 + i * 0.01}
            })

        data = {
            'session': {
                'session_id': session_id,
                'start_time': datetime.utcnow().isoformat() + 'Z',
                'enabled_sensors': ['accelerometer'],
                'sample_rate': 100
            },
            'sensor_data': sensor_data_list
        }

        response = client.post(
            '/api/sync/push',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 200
        result = response.get_json()
        assert result['total_records'] == 100
        assert result['inserted'] == 100


@pytest.mark.api
@pytest.mark.sync
class TestSyncPull:
    """센서 데이터 Pull API 테스트"""

    def test_pull_all_sessions(self, client, user, auth_headers, completed_session):
        """모든 세션 Pull 테스트"""
        data = {
            'page': 1,
            'page_size': 50,
            'include_data': False
        }

        response = client.post(
            '/api/sync/pull',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 200
        result = response.get_json()

        assert 'sessions' in result
        assert 'server_timestamp' in result
        assert result['page'] == 1
        assert result['page_size'] == 50
        assert result['total'] >= 1
        assert len(result['sessions']) >= 1

    def test_pull_with_data(self, client, user, auth_headers, recording_session, sensor_data_batch):
        """센서 데이터 포함 Pull 테스트"""
        data = {
            'page': 1,
            'page_size': 50,
            'include_data': True
        }

        response = client.post(
            '/api/sync/pull',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 200
        result = response.get_json()

        assert len(result['sessions']) >= 1
        session = result['sessions'][0]
        assert 'sensor_data' in session
        # sensor_data_batch는 100개
        assert len(session['sensor_data']) > 0

    def test_pull_delta_sync(self, client, user, auth_headers, completed_session):
        """델타 동기화 테스트"""
        # 과거 시간으로 last_sync_time 설정
        last_sync_time = (datetime.utcnow() - timedelta(hours=2)).isoformat() + 'Z'

        data = {
            'last_sync_time': last_sync_time,
            'page': 1,
            'page_size': 50,
            'include_data': False
        }

        response = client.post(
            '/api/sync/pull',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 200
        result = response.get_json()

        # 최근 업데이트된 세션만 반환
        assert 'sessions' in result

    def test_pull_specific_sessions(self, client, user, auth_headers, recording_session):
        """특정 세션만 Pull 테스트"""
        data = {
            'session_ids': [str(recording_session.session_id)],
            'page': 1,
            'page_size': 50,
            'include_data': True
        }

        response = client.post(
            '/api/sync/pull',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 200
        result = response.get_json()

        assert len(result['sessions']) == 1
        assert result['sessions'][0]['session_id'] == str(recording_session.session_id)

    def test_pull_pagination(self, client, user, auth_headers, create_session_func):
        """페이지네이션 테스트"""
        # 여러 세션 생성
        for i in range(5):
            create_session_func(user.id, notes=f'Session {i}')

        # 첫 페이지 (2개씩)
        data1 = {
            'page': 1,
            'page_size': 2,
            'include_data': False
        }

        response1 = client.post(
            '/api/sync/pull',
            headers=auth_headers,
            data=json.dumps(data1)
        )

        assert response1.status_code == 200
        result1 = response1.get_json()
        assert len(result1['sessions']) == 2
        assert result1['has_more'] is True

        # 두 번째 페이지
        data2 = {
            'page': 2,
            'page_size': 2,
            'include_data': False
        }

        response2 = client.post(
            '/api/sync/pull',
            headers=auth_headers,
            data=json.dumps(data2)
        )

        assert response2.status_code == 200
        result2 = response2.get_json()
        assert len(result2['sessions']) >= 1

    def test_pull_without_auth(self, client):
        """인증 없이 Pull 시도 테스트"""
        data = {
            'page': 1,
            'page_size': 50
        }

        response = client.post(
            '/api/sync/pull',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 401

    def test_pull_invalid_page(self, client, auth_headers):
        """잘못된 페이지 번호 테스트"""
        data = {
            'page': 0,  # 0은 유효하지 않음
            'page_size': 50
        }

        response = client.post(
            '/api/sync/pull',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 400

    def test_pull_invalid_page_size(self, client, auth_headers):
        """잘못된 페이지 크기 테스트"""
        data = {
            'page': 1,
            'page_size': 200  # 최대 100
        }

        response = client.post(
            '/api/sync/pull',
            headers=auth_headers,
            data=json.dumps(data)
        )

        assert response.status_code == 400


@pytest.mark.api
@pytest.mark.sync
class TestSyncStatus:
    """동기화 상태 API 테스트"""

    def test_get_sync_status(self, client, user, auth_headers, sync_log):
        """동기화 상태 조회 테스트"""
        response = client.get(
            '/api/sync/status',
            headers=auth_headers
        )

        assert response.status_code == 200
        result = response.get_json()

        assert 'total_sessions' in result
        assert 'active_sessions' in result
        assert 'uploaded_sessions' in result
        assert 'recent_syncs' in result
        assert isinstance(result['recent_syncs'], list)

    def test_get_sync_status_without_auth(self, client):
        """인증 없이 상태 조회 시도 테스트"""
        response = client.get('/api/sync/status')

        assert response.status_code == 401


@pytest.mark.api
@pytest.mark.sync
@pytest.mark.integration
class TestSyncFlow:
    """전체 동기화 플로우 통합 테스트"""

    def test_complete_sync_flow(self, client, user, auth_headers):
        """Push → Pull → Status 전체 플로우 테스트"""

        session_id = str(uuid.uuid4())

        # 1. Push: 새 세션과 데이터 업로드
        push_data = {
            'session': {
                'session_id': session_id,
                'start_time': datetime.utcnow().isoformat() + 'Z',
                'end_time': (datetime.utcnow() + timedelta(minutes=30)).isoformat() + 'Z',
                'enabled_sensors': ['accelerometer', 'gyroscope', 'gps'],
                'sample_rate': 100,
                'notes': 'Complete sync flow test'
            },
            'sensor_data': [
                {
                    'sensor_type': 'accelerometer',
                    'timestamp': int(datetime.utcnow().timestamp() * 1000),
                    'data': {'x': 0.5, 'y': 0.6, 'z': 9.9}
                },
                {
                    'sensor_type': 'gyroscope',
                    'timestamp': int(datetime.utcnow().timestamp() * 1000) + 10,
                    'data': {'x': 0.05, 'y': 0.06, 'z': 0.07}
                },
                {
                    'sensor_type': 'gps',
                    'timestamp': int(datetime.utcnow().timestamp() * 1000) + 20,
                    'data': {
                        'latitude': 37.5665,
                        'longitude': 126.9780,
                        'altitude': 100.0,
                        'accuracy': 10.0
                    }
                }
            ]
        }

        push_response = client.post(
            '/api/sync/push',
            headers=auth_headers,
            data=json.dumps(push_data)
        )

        assert push_response.status_code == 200
        push_result = push_response.get_json()
        assert push_result['inserted'] == 3

        # 2. Pull: 방금 Push한 데이터 조회
        pull_data = {
            'session_ids': [session_id],
            'page': 1,
            'page_size': 50,
            'include_data': True
        }

        pull_response = client.post(
            '/api/sync/pull',
            headers=auth_headers,
            data=json.dumps(pull_data)
        )

        assert pull_response.status_code == 200
        pull_result = pull_response.get_json()
        assert len(pull_result['sessions']) == 1

        pulled_session = pull_result['sessions'][0]
        assert pulled_session['session_id'] == session_id
        assert len(pulled_session['sensor_data']) == 3

        # 3. Status: 동기화 상태 확인
        status_response = client.get(
            '/api/sync/status',
            headers=auth_headers
        )

        assert status_response.status_code == 200
        status_result = status_response.get_json()
        assert status_result['total_sessions'] >= 1
        assert len(status_result['recent_syncs']) >= 2  # Push와 Pull 로그


@pytest.mark.smoke
def test_sync_smoke_test(client, user, auth_headers):
    """Sync API 스모크 테스트 - 빠른 검증"""
    session_id = str(uuid.uuid4())

    # Push
    push_data = {
        'session': {
            'session_id': session_id,
            'start_time': datetime.utcnow().isoformat() + 'Z',
            'enabled_sensors': ['accelerometer'],
            'sample_rate': 100
        },
        'sensor_data': [
            {
                'sensor_type': 'accelerometer',
                'timestamp': int(datetime.utcnow().timestamp() * 1000),
                'data': {'x': 0.0, 'y': 0.0, 'z': 9.8}
            }
        ]
    }

    push_response = client.post(
        '/api/sync/push',
        headers=auth_headers,
        data=json.dumps(push_data)
    )

    assert push_response.status_code == 200

    # Pull
    pull_data = {'page': 1, 'page_size': 10, 'include_data': False}

    pull_response = client.post(
        '/api/sync/pull',
        headers=auth_headers,
        data=json.dumps(pull_data)
    )

    assert pull_response.status_code == 200

    # Status
    status_response = client.get('/api/sync/status', headers=auth_headers)

    assert status_response.status_code == 200
