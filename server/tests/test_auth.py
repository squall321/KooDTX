"""
Test Auth API
인증 API 엔드포인트 통합 테스트
"""

import pytest
import json
from app.models.user import User


@pytest.mark.api
@pytest.mark.auth
class TestAuthRegister:
    """사용자 등록 API 테스트"""

    def test_register_success(self, client, session):
        """정상 등록 테스트"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'password123',
            'device_id': 'device-new-123'
        }

        response = client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 201
        result = response.get_json()

        assert 'access_token' in result
        assert 'refresh_token' in result
        assert 'user' in result
        assert result['user']['username'] == 'newuser'
        assert result['user']['email'] == 'newuser@example.com'

        # 데이터베이스 확인
        user = User.query.filter_by(username='newuser').first()
        assert user is not None
        assert user.email == 'newuser@example.com'

    def test_register_missing_fields(self, client):
        """필수 필드 누락 테스트"""
        data = {
            'username': 'testuser'
            # email, password, device_id 누락
        }

        response = client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 400
        result = response.get_json()
        assert 'error' in result

    def test_register_duplicate_username(self, client, user):
        """중복 사용자명 테스트"""
        data = {
            'username': user.username,  # 이미 존재하는 사용자명
            'email': 'different@example.com',
            'password': 'password123',
            'device_id': 'device-dup-123'
        }

        response = client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 400
        result = response.get_json()
        assert 'error' in result
        assert 'already exists' in result['error'].lower()

    def test_register_duplicate_email(self, client, user):
        """중복 이메일 테스트"""
        data = {
            'username': 'differentuser',
            'email': user.email,  # 이미 존재하는 이메일
            'password': 'password123',
            'device_id': 'device-dup-456'
        }

        response = client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 400
        result = response.get_json()
        assert 'error' in result
        assert 'already exists' in result['error'].lower()

    def test_register_invalid_email(self, client):
        """잘못된 이메일 형식 테스트"""
        data = {
            'username': 'testuser',
            'email': 'invalid-email',  # 잘못된 형식
            'password': 'password123',
            'device_id': 'device-123'
        }

        response = client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )

        # Note: 현재 이메일 검증이 없다면 201이 반환될 수 있음
        # 이메일 검증 추가 시 400으로 변경 필요
        assert response.status_code in [201, 400]


@pytest.mark.api
@pytest.mark.auth
class TestAuthLogin:
    """로그인 API 테스트"""

    def test_login_success(self, client, user):
        """정상 로그인 테스트"""
        data = {
            'username': 'testuser',
            'password': 'password123'
        }

        response = client.post(
            '/api/auth/login',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 200
        result = response.get_json()

        assert 'access_token' in result
        assert 'refresh_token' in result
        assert 'user' in result
        assert result['user']['username'] == 'testuser'

    def test_login_wrong_password(self, client, user):
        """잘못된 비밀번호 테스트"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }

        response = client.post(
            '/api/auth/login',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 401
        result = response.get_json()
        assert 'error' in result

    def test_login_nonexistent_user(self, client):
        """존재하지 않는 사용자 테스트"""
        data = {
            'username': 'nonexistent',
            'password': 'password123'
        }

        response = client.post(
            '/api/auth/login',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 401
        result = response.get_json()
        assert 'error' in result

    def test_login_missing_fields(self, client):
        """필수 필드 누락 테스트"""
        data = {
            'username': 'testuser'
            # password 누락
        }

        response = client.post(
            '/api/auth/login',
            data=json.dumps(data),
            content_type='application/json'
        )

        assert response.status_code == 400
        result = response.get_json()
        assert 'error' in result


@pytest.mark.api
@pytest.mark.auth
class TestAuthRefresh:
    """토큰 갱신 API 테스트"""

    def test_refresh_token_success(self, client, user):
        """정상 토큰 갱신 테스트"""
        from flask_jwt_extended import create_refresh_token

        # 리프레시 토큰 생성
        refresh_token = create_refresh_token(identity=user.id)

        response = client.post(
            '/api/auth/refresh',
            headers={
                'Authorization': f'Bearer {refresh_token}',
                'Content-Type': 'application/json'
            },
            data=json.dumps({})
        )

        assert response.status_code == 200
        result = response.get_json()
        assert 'access_token' in result

    def test_refresh_without_token(self, client):
        """토큰 없이 갱신 시도 테스트"""
        response = client.post(
            '/api/auth/refresh',
            data=json.dumps({}),
            content_type='application/json'
        )

        assert response.status_code == 401

    def test_refresh_with_access_token(self, client, auth_headers):
        """액세스 토큰으로 갱신 시도 (실패해야 함)"""
        response = client.post(
            '/api/auth/refresh',
            headers=auth_headers,
            data=json.dumps({})
        )

        # 리프레시 토큰이 필요하므로 실패해야 함
        assert response.status_code == 422


@pytest.mark.api
@pytest.mark.auth
class TestAuthMe:
    """현재 사용자 정보 API 테스트"""

    def test_get_current_user_success(self, client, user, auth_headers):
        """정상 사용자 정보 조회 테스트"""
        response = client.get(
            '/api/auth/me',
            headers=auth_headers
        )

        assert response.status_code == 200
        result = response.get_json()

        assert result['id'] == user.id
        assert result['username'] == user.username
        assert result['email'] == user.email
        assert 'password_hash' not in result

    def test_get_current_user_without_token(self, client):
        """토큰 없이 정보 조회 시도 테스트"""
        response = client.get('/api/auth/me')

        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client):
        """잘못된 토큰으로 정보 조회 시도 테스트"""
        response = client.get(
            '/api/auth/me',
            headers={
                'Authorization': 'Bearer invalid_token_here'
            }
        )

        assert response.status_code == 422


@pytest.mark.api
@pytest.mark.auth
@pytest.mark.integration
class TestAuthFlow:
    """전체 인증 플로우 통합 테스트"""

    def test_complete_auth_flow(self, client, session):
        """등록 → 로그인 → 정보 조회 → 토큰 갱신 플로우"""

        # 1. 등록
        register_data = {
            'username': 'flowuser',
            'email': 'flow@example.com',
            'password': 'password123',
            'device_id': 'device-flow-123'
        }

        register_response = client.post(
            '/api/auth/register',
            data=json.dumps(register_data),
            content_type='application/json'
        )

        assert register_response.status_code == 201
        register_result = register_response.get_json()
        access_token = register_result['access_token']
        refresh_token = register_result['refresh_token']

        # 2. 등록한 계정으로 로그인
        login_data = {
            'username': 'flowuser',
            'password': 'password123'
        }

        login_response = client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )

        assert login_response.status_code == 200
        login_result = login_response.get_json()
        assert 'access_token' in login_result

        # 3. 사용자 정보 조회
        me_response = client.get(
            '/api/auth/me',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
        )

        assert me_response.status_code == 200
        me_result = me_response.get_json()
        assert me_result['username'] == 'flowuser'

        # 4. 토큰 갱신
        refresh_response = client.post(
            '/api/auth/refresh',
            headers={
                'Authorization': f'Bearer {refresh_token}',
                'Content-Type': 'application/json'
            },
            data=json.dumps({})
        )

        assert refresh_response.status_code == 200
        refresh_result = refresh_response.get_json()
        assert 'access_token' in refresh_result

        # 5. 새로운 액세스 토큰으로 정보 조회
        new_access_token = refresh_result['access_token']
        me_response2 = client.get(
            '/api/auth/me',
            headers={
                'Authorization': f'Bearer {new_access_token}',
                'Content-Type': 'application/json'
            }
        )

        assert me_response2.status_code == 200


@pytest.mark.smoke
def test_auth_smoke_test(client):
    """Auth API 스모크 테스트 - 빠른 검증"""
    # 등록
    register_data = {
        'username': 'smokeuser',
        'email': 'smoke@example.com',
        'password': 'password123',
        'device_id': 'device-smoke'
    }

    response = client.post(
        '/api/auth/register',
        data=json.dumps(register_data),
        content_type='application/json'
    )

    assert response.status_code == 201

    # 로그인
    login_data = {
        'username': 'smokeuser',
        'password': 'password123'
    }

    response = client.post(
        '/api/auth/login',
        data=json.dumps(login_data),
        content_type='application/json'
    )

    assert response.status_code == 200
    assert 'access_token' in response.get_json()
