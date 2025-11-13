"""
Phase 44: 센서 데이터 처리 작업
Pandas를 사용한 통계 분석 및 이상 탐지
"""

from celery_app import celery
from app import db
from app.models.sensor_data import SensorData
from app.models.session import RecordingSession
from datetime import datetime, timedelta
import pandas as pd
import numpy as np


@celery.task(name='app.tasks.data_processing.analyze_sensor_data')
def analyze_sensor_data(session_id: int):
    """
    센서 데이터 분석

    Args:
        session_id: RecordingSession ID

    Returns:
        dict: 분석 결과
    """
    try:
        # 세션 조회
        session = RecordingSession.query.get(session_id)
        if not session:
            return {'error': 'Session not found', 'session_id': session_id}

        # 센서 데이터 조회
        sensor_data = SensorData.query.filter_by(session_id=session_id).all()

        if not sensor_data:
            return {'error': 'No sensor data found', 'session_id': session_id}

        # 센서 타입별로 그룹화
        data_by_type = {}
        for data in sensor_data:
            sensor_type = data.sensor_type
            if sensor_type not in data_by_type:
                data_by_type[sensor_type] = []
            data_by_type[sensor_type].append({
                'timestamp': data.timestamp,
                'data': data.data
            })

        # 각 센서 타입별 분석
        analysis_results = {}
        for sensor_type, data_list in data_by_type.items():
            analysis_results[sensor_type] = _analyze_sensor_type(sensor_type, data_list)

        return {
            'session_id': session_id,
            'session_uuid': str(session.session_id),
            'total_records': len(sensor_data),
            'sensor_types': list(data_by_type.keys()),
            'analysis': analysis_results,
            'analyzed_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        return {'error': str(e), 'session_id': session_id}


def _analyze_sensor_type(sensor_type: str, data_list: list) -> dict:
    """
    특정 센서 타입 데이터 분석

    Args:
        sensor_type: 센서 타입
        data_list: 센서 데이터 리스트

    Returns:
        dict: 분석 결과
    """
    df = pd.DataFrame(data_list)

    # 3축 센서 (accelerometer, gyroscope, magnetometer, etc.)
    if sensor_type in ['accelerometer', 'gyroscope', 'magnetometer', 'gravity', 'linear_acceleration']:
        x_values = [d['x'] for d in df['data']]
        y_values = [d['y'] for d in df['data']]
        z_values = [d['z'] for d in df['data']]

        return {
            'count': len(df),
            'duration_ms': int(df['timestamp'].max() - df['timestamp'].min()),
            'statistics': {
                'x': {
                    'mean': float(np.mean(x_values)),
                    'std': float(np.std(x_values)),
                    'min': float(np.min(x_values)),
                    'max': float(np.max(x_values)),
                },
                'y': {
                    'mean': float(np.mean(y_values)),
                    'std': float(np.std(y_values)),
                    'min': float(np.min(y_values)),
                    'max': float(np.max(y_values)),
                },
                'z': {
                    'mean': float(np.mean(z_values)),
                    'std': float(np.std(z_values)),
                    'min': float(np.min(z_values)),
                    'max': float(np.max(z_values)),
                },
            }
        }

    # GPS 센서
    elif sensor_type == 'gps':
        lat_values = [d['latitude'] for d in df['data'] if 'latitude' in d]
        lon_values = [d['longitude'] for d in df['data'] if 'longitude' in d]

        if lat_values and lon_values:
            return {
                'count': len(df),
                'duration_ms': int(df['timestamp'].max() - df['timestamp'].min()),
                'statistics': {
                    'latitude': {
                        'mean': float(np.mean(lat_values)),
                        'min': float(np.min(lat_values)),
                        'max': float(np.max(lat_values)),
                    },
                    'longitude': {
                        'mean': float(np.mean(lon_values)),
                        'min': float(np.min(lon_values)),
                        'max': float(np.max(lon_values)),
                    },
                    'distance_km': _calculate_total_distance(lat_values, lon_values)
                }
            }

    # 기타 센서 (일반 통계)
    return {
        'count': len(df),
        'duration_ms': int(df['timestamp'].max() - df['timestamp'].min()),
        'first_timestamp': int(df['timestamp'].min()),
        'last_timestamp': int(df['timestamp'].max()),
    }


def _calculate_total_distance(latitudes: list, longitudes: list) -> float:
    """
    GPS 좌표로부터 총 이동 거리 계산 (Haversine formula)

    Args:
        latitudes: 위도 리스트
        longitudes: 경도 리스트

    Returns:
        float: 총 이동 거리 (km)
    """
    if len(latitudes) < 2:
        return 0.0

    total_distance = 0.0
    R = 6371.0  # 지구 반지름 (km)

    for i in range(1, len(latitudes)):
        lat1, lon1 = np.radians(latitudes[i - 1]), np.radians(longitudes[i - 1])
        lat2, lon2 = np.radians(latitudes[i]), np.radians(longitudes[i])

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

        total_distance += R * c

    return round(total_distance, 2)


@celery.task(name='app.tasks.data_processing.generate_statistics')
def generate_statistics(user_id: int, start_date: str = None, end_date: str = None):
    """
    사용자의 센서 데이터 통계 생성

    Args:
        user_id: 사용자 ID
        start_date: 시작 날짜 (ISO format, optional)
        end_date: 종료 날짜 (ISO format, optional)

    Returns:
        dict: 통계 결과
    """
    try:
        # 세션 조회
        query = RecordingSession.query.filter_by(user_id=user_id)

        if start_date:
            query = query.filter(RecordingSession.start_time >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(RecordingSession.start_time <= datetime.fromisoformat(end_date))

        sessions = query.all()

        if not sessions:
            return {
                'user_id': user_id,
                'total_sessions': 0,
                'message': 'No sessions found'
            }

        # 통계 계산
        total_sessions = len(sessions)
        total_data_count = sum(s.data_count for s in sessions)
        total_duration_ms = sum(
            (s.end_time - s.start_time).total_seconds() * 1000
            for s in sessions
            if s.end_time
        )

        # 센서 타입별 세션 수
        sensor_types_count = {}
        for session in sessions:
            for sensor_type in session.enabled_sensors:
                sensor_types_count[sensor_type] = sensor_types_count.get(sensor_type, 0) + 1

        return {
            'user_id': user_id,
            'period': {
                'start': start_date,
                'end': end_date,
            },
            'statistics': {
                'total_sessions': total_sessions,
                'total_data_records': total_data_count,
                'total_duration_ms': int(total_duration_ms),
                'total_duration_hours': round(total_duration_ms / (1000 * 60 * 60), 2),
                'average_session_duration_ms': int(total_duration_ms / total_sessions) if total_sessions > 0 else 0,
                'sensor_types_usage': sensor_types_count,
            },
            'generated_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        return {'error': str(e), 'user_id': user_id}


@celery.task(name='app.tasks.data_processing.detect_anomalies')
def detect_anomalies(session_id: int, sensitivity: float = 3.0):
    """
    센서 데이터에서 이상치 탐지 (Z-score 방법)

    Args:
        session_id: RecordingSession ID
        sensitivity: Z-score 임계값 (기본값: 3.0 표준편차)

    Returns:
        dict: 이상치 탐지 결과
    """
    try:
        # 세션 조회
        session = RecordingSession.query.get(session_id)
        if not session:
            return {'error': 'Session not found', 'session_id': session_id}

        # 센서 데이터 조회
        sensor_data = SensorData.query.filter_by(session_id=session_id).all()

        if not sensor_data:
            return {'error': 'No sensor data found', 'session_id': session_id}

        # 센서 타입별 이상치 탐지
        anomalies_by_type = {}

        for sensor_type in set(d.sensor_type for d in sensor_data):
            type_data = [d for d in sensor_data if d.sensor_type == sensor_type]

            # 3축 센서
            if sensor_type in ['accelerometer', 'gyroscope', 'magnetometer']:
                x_values = np.array([d.data.get('x', 0) for d in type_data])
                y_values = np.array([d.data.get('y', 0) for d in type_data])
                z_values = np.array([d.data.get('z', 0) for d in type_data])

                # Magnitude 계산
                magnitudes = np.sqrt(x_values ** 2 + y_values ** 2 + z_values ** 2)

                # Z-score 계산
                mean = np.mean(magnitudes)
                std = np.std(magnitudes)

                if std > 0:
                    z_scores = np.abs((magnitudes - mean) / std)
                    anomaly_indices = np.where(z_scores > sensitivity)[0]

                    if len(anomaly_indices) > 0:
                        anomalies_by_type[sensor_type] = {
                            'count': int(len(anomaly_indices)),
                            'percentage': round(len(anomaly_indices) / len(type_data) * 100, 2),
                            'mean': float(mean),
                            'std': float(std),
                            'max_z_score': float(np.max(z_scores[anomaly_indices])),
                            'timestamps': [int(type_data[i].timestamp) for i in anomaly_indices[:10]]  # 최대 10개만
                        }

        return {
            'session_id': session_id,
            'session_uuid': str(session.session_id),
            'sensitivity': sensitivity,
            'anomalies': anomalies_by_type,
            'total_anomalies': sum(a['count'] for a in anomalies_by_type.values()),
            'detected_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        return {'error': str(e), 'session_id': session_id}


@celery.task(name='app.tasks.data_processing.calculate_session_metrics')
def calculate_session_metrics(session_id: int):
    """
    세션의 주요 메트릭 계산 (평균, 표준편차, 피크값 등)

    Args:
        session_id: RecordingSession ID

    Returns:
        dict: 메트릭 결과
    """
    try:
        session = RecordingSession.query.get(session_id)
        if not session:
            return {'error': 'Session not found'}

        sensor_data = SensorData.query.filter_by(session_id=session_id).all()

        if not sensor_data:
            return {'error': 'No sensor data found'}

        # 센서 타입별 메트릭
        metrics = {}

        for sensor_type in set(d.sensor_type for d in sensor_data):
            type_data = [d for d in sensor_data if d.sensor_type == sensor_type]

            if sensor_type in ['accelerometer', 'gyroscope', 'magnetometer']:
                x_values = [d.data.get('x', 0) for d in type_data]
                y_values = [d.data.get('y', 0) for d in type_data]
                z_values = [d.data.get('z', 0) for d in type_data]

                metrics[sensor_type] = {
                    'sample_count': len(type_data),
                    'x': {
                        'mean': float(np.mean(x_values)),
                        'std': float(np.std(x_values)),
                        'min': float(np.min(x_values)),
                        'max': float(np.max(x_values)),
                        'peak_to_peak': float(np.max(x_values) - np.min(x_values)),
                    },
                    'y': {
                        'mean': float(np.mean(y_values)),
                        'std': float(np.std(y_values)),
                        'min': float(np.min(y_values)),
                        'max': float(np.max(y_values)),
                        'peak_to_peak': float(np.max(y_values) - np.min(y_values)),
                    },
                    'z': {
                        'mean': float(np.mean(z_values)),
                        'std': float(np.std(z_values)),
                        'min': float(np.min(z_values)),
                        'max': float(np.max(z_values)),
                        'peak_to_peak': float(np.max(z_values) - np.min(z_values)),
                    }
                }

        # 세션 메타데이터 업데이트
        session.data_count = len(sensor_data)
        db.session.commit()

        return {
            'session_id': session_id,
            'metrics': metrics,
            'calculated_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        db.session.rollback()
        return {'error': str(e)}
