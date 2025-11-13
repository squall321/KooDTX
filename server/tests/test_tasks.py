"""
Test Celery Tasks
Celery 비동기 작업 테스트
"""

import pytest
from app.tasks.data_processing import (
    analyze_sensor_data,
    generate_statistics,
    detect_anomalies,
    calculate_session_metrics
)
from app.tasks.file_cleanup import (
    cleanup_old_sensor_data,
    cleanup_old_sync_logs,
    cleanup_failed_sessions
)
from datetime import datetime, timedelta


@pytest.mark.celery
@pytest.mark.unit
class TestDataProcessingTasks:
    """데이터 처리 작업 테스트"""

    def test_analyze_sensor_data(self, session, recording_session, sensor_data_batch):
        """센서 데이터 분석 작업 테스트"""
        # Celery task 실행 (동기)
        result = analyze_sensor_data(recording_session.id)

        assert 'session_id' in result
        assert result['session_id'] == recording_session.id
        assert 'total_records' in result
        assert result['total_records'] == 100  # sensor_data_batch는 100개
        assert 'analysis' in result
        assert 'accelerometer' in result['analysis']

        # Accelerometer 분석 결과 확인
        accel_analysis = result['analysis']['accelerometer']
        assert 'count' in accel_analysis
        assert 'statistics' in accel_analysis
        assert 'x' in accel_analysis['statistics']
        assert 'mean' in accel_analysis['statistics']['x']

    def test_analyze_sensor_data_nonexistent_session(self, session):
        """존재하지 않는 세션 분석 테스트"""
        result = analyze_sensor_data(session_id=99999)

        assert 'error' in result
        assert 'not found' in result['error'].lower()

    def test_generate_statistics(self, session, user, completed_session):
        """통계 생성 작업 테스트"""
        result = generate_statistics(
            user_id=user.id,
            start_date=None,
            end_date=None
        )

        assert 'user_id' in result
        assert result['user_id'] == user.id
        assert 'statistics' in result
        assert 'total_sessions' in result['statistics']
        assert result['statistics']['total_sessions'] >= 1

    def test_generate_statistics_with_date_range(self, session, user, completed_session):
        """날짜 범위 통계 생성 테스트"""
        start_date = (datetime.utcnow() - timedelta(days=7)).isoformat()
        end_date = datetime.utcnow().isoformat()

        result = generate_statistics(
            user_id=user.id,
            start_date=start_date,
            end_date=end_date
        )

        assert 'statistics' in result
        assert 'period' in result
        assert result['period']['start'] == start_date

    def test_detect_anomalies(self, session, recording_session, sensor_data_batch):
        """이상치 탐지 작업 테스트"""
        result = detect_anomalies(
            session_id=recording_session.id,
            sensitivity=3.0
        )

        assert 'session_id' in result
        assert result['session_id'] == recording_session.id
        assert 'sensitivity' in result
        assert result['sensitivity'] == 3.0
        assert 'anomalies' in result
        assert 'total_anomalies' in result

    def test_detect_anomalies_high_sensitivity(self, session, recording_session, sensor_data_batch):
        """높은 민감도 이상치 탐지 테스트"""
        # 민감도 1.5 (더 많은 이상치 감지)
        result = detect_anomalies(
            session_id=recording_session.id,
            sensitivity=1.5
        )

        assert 'anomalies' in result
        # 민감도가 높으면 더 많은 이상치 감지 가능

    def test_calculate_session_metrics(self, session, recording_session, sensor_data_batch):
        """세션 메트릭 계산 작업 테스트"""
        result = calculate_session_metrics(session_id=recording_session.id)

        assert 'session_id' in result
        assert 'metrics' in result

        # Accelerometer 메트릭 확인
        if 'accelerometer' in result['metrics']:
            accel_metrics = result['metrics']['accelerometer']
            assert 'sample_count' in accel_metrics
            assert 'x' in accel_metrics
            assert 'mean' in accel_metrics['x']
            assert 'std' in accel_metrics['x']


@pytest.mark.celery
@pytest.mark.unit
class TestFileCleanupTasks:
    """파일 정리 작업 테스트"""

    def test_cleanup_old_sensor_data(self, session, user, create_session_func):
        """오래된 센서 데이터 정리 작업 테스트"""
        # 오래된 세션 생성 (35일 전)
        old_start_time = datetime.utcnow() - timedelta(days=35)
        old_end_time = datetime.utcnow() - timedelta(days=35, hours=-1)

        old_session = create_session_func(
            user_id=user.id,
            start_time=old_start_time,
            end_time=old_end_time,
            is_active=False
        )

        # is_uploaded를 True로 설정
        old_session.is_uploaded = True
        session.commit()

        # 정리 작업 실행 (30일 이상)
        result = cleanup_old_sensor_data(days=30)

        assert 'message' in result or 'cleaned_sessions' in result
        # 정리가 성공했거나 정리할 세션이 없음

    def test_cleanup_old_sync_logs(self, session, user, sync_log):
        """오래된 동기화 로그 정리 작업 테스트"""
        # 로그 생성 시간을 오래 전으로 설정
        sync_log.created_at = datetime.utcnow() - timedelta(days=100)
        session.commit()

        # 정리 작업 실행 (90일 이상)
        result = cleanup_old_sync_logs(days=90)

        assert 'message' in result or 'cleaned_logs' in result

    def test_cleanup_failed_sessions(self, session, user, create_session_func):
        """실패/중단 세션 정리 작업 테스트"""
        # 오래된 활성 세션 생성 (25시간 전)
        old_start_time = datetime.utcnow() - timedelta(hours=25)

        stale_session = create_session_func(
            user_id=user.id,
            start_time=old_start_time,
            is_active=True,  # 활성 상태
            end_time=None
        )

        # 정리 작업 실행 (24시간 이상)
        result = cleanup_failed_sessions(hours=24)

        assert 'message' in result or 'cleaned_sessions' in result


@pytest.mark.celery
@pytest.mark.integration
class TestTaskIntegration:
    """작업 통합 테스트"""

    def test_analyze_then_detect_anomalies(self, session, recording_session, sensor_data_batch):
        """분석 → 이상치 탐지 순차 실행 테스트"""
        # 1. 센서 데이터 분석
        analysis_result = analyze_sensor_data(recording_session.id)

        assert 'session_id' in analysis_result
        assert 'analysis' in analysis_result

        # 2. 이상치 탐지
        anomaly_result = detect_anomalies(
            session_id=recording_session.id,
            sensitivity=3.0
        )

        assert 'session_id' in anomaly_result
        assert 'anomalies' in anomaly_result

    def test_statistics_after_cleanup(self, session, user, completed_session):
        """정리 후 통계 생성 테스트"""
        # 1. 통계 생성 (정리 전)
        stats_before = generate_statistics(user_id=user.id)
        sessions_before = stats_before['statistics']['total_sessions']

        # 2. 정리 작업 (실제로는 정리되지 않을 수 있음)
        cleanup_result = cleanup_old_sensor_data(days=30)

        # 3. 통계 생성 (정리 후)
        stats_after = generate_statistics(user_id=user.id)
        sessions_after = stats_after['statistics']['total_sessions']

        # 세션 수 확인 (정리되었거나 유지됨)
        assert sessions_after <= sessions_before


@pytest.mark.celery
@pytest.mark.slow
class TestTaskPerformance:
    """작업 성능 테스트"""

    def test_analyze_large_dataset(self, session, recording_session):
        """대량 데이터 분석 성능 테스트"""
        import random
        from app.models.sensor_data import SensorData

        # 1000개의 센서 데이터 생성
        data_list = []
        base_timestamp = int(datetime.utcnow().timestamp() * 1000)

        for i in range(1000):
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

        # 분석 작업 실행
        import time
        start_time = time.time()

        result = analyze_sensor_data(recording_session.id)

        elapsed_time = time.time() - start_time

        assert 'session_id' in result
        assert result['total_records'] == 1000
        # 1000개 데이터 분석이 5초 이내 완료되어야 함
        assert elapsed_time < 5.0


@pytest.mark.unit
def test_task_error_handling():
    """작업 에러 처리 테스트"""
    # 존재하지 않는 세션으로 분석 시도
    result = analyze_sensor_data(session_id=99999)

    assert 'error' in result
    assert isinstance(result, dict)


@pytest.mark.smoke
def test_tasks_smoke_test(session, recording_session, sensor_data_batch):
    """Tasks 스모크 테스트 - 핵심 작업 빠른 검증"""
    # 분석 작업
    analysis_result = analyze_sensor_data(recording_session.id)
    assert 'session_id' in analysis_result

    # 메트릭 계산
    metrics_result = calculate_session_metrics(recording_session.id)
    assert 'session_id' in metrics_result

    # 이상치 탐지
    anomaly_result = detect_anomalies(recording_session.id, sensitivity=3.0)
    assert 'session_id' in anomaly_result
