"""
Swagger/OpenAPI Documentation
Flask-RESTX를 사용한 API 문서 자동 생성
"""

from flask_restx import Api

# Swagger API 초기화
api = Api(
    version='1.0.0',
    title='KooDTX Backend API',
    description='''
    ## KooDTX 센서 데이터 동기화 서버 API

    React Native 앱에서 수집한 센서 데이터를 동기화하고 관리하는 RESTful API입니다.

    ### 주요 기능
    - 🔐 JWT 인증 시스템
    - 📤 센서 데이터 Push (클라이언트 → 서버)
    - 📥 센서 데이터 Pull (서버 → 클라이언트)
    - 📊 비동기 데이터 분석 (Celery)
    - 🧹 자동 파일 정리 (Celery Beat)

    ### 인증
    대부분의 API는 JWT 토큰이 필요합니다.

    1. POST /api/auth/register 또는 /api/auth/login으로 토큰 발급
    2. 헤더에 `Authorization: Bearer <token>` 추가

    ### 지원하는 센서 타입
    - accelerometer (가속도계)
    - gyroscope (자이로스코프)
    - magnetometer (지자기 센서)
    - gps (위치 정보)
    - proximity (근접 센서)
    - light (조도 센서)
    - pressure (기압 센서)
    - gravity (중력 센서)
    - linear_acceleration (선형 가속도)
    - rotation_vector (회전 벡터)
    - temperature (온도 센서)
    - humidity (습도 센서)
    ''',
    doc='/docs/',  # Swagger UI URL
    authorizations={
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'JWT 토큰을 입력하세요. 형식: Bearer <token>'
        }
    },
    security='Bearer'
)
