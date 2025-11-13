"""
Test Application Setup
기본 앱 설정 테스트
"""

import pytest
from app import create_app, db
from app.config import TestingConfig


@pytest.mark.unit
def test_app_creation():
    """앱 생성 테스트"""
    app = create_app(TestingConfig)
    assert app is not None
    assert app.config['TESTING'] is True


@pytest.mark.unit
def test_database_connection(app, db):
    """데이터베이스 연결 테스트"""
    assert db is not None


@pytest.mark.unit
def test_health_endpoint(client):
    """헬스 체크 엔드포인트 테스트"""
    response = client.get('/health')
    assert response.status_code == 200

    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'KooDTX Backend'


@pytest.mark.unit
def test_root_endpoint(client):
    """루트 엔드포인트 테스트"""
    response = client.get('/')
    assert response.status_code == 200

    data = response.get_json()
    assert data['service'] == 'KooDTX Backend API'
    assert data['version'] == '1.0.0'
    assert 'documentation' in data
    assert data['documentation'] == '/docs'


@pytest.mark.smoke
def test_swagger_ui_accessible(client):
    """Swagger UI 접근 가능성 테스트"""
    response = client.get('/docs/')
    # Swagger UI는 HTML을 반환하므로 200 또는 308 (리다이렉트)
    assert response.status_code in [200, 308, 301]
