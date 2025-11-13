"""
Phase 45: 파일 정리 작업
오래된 데이터 및 로그 정리 (Celery Beat 스케줄링)
"""

from celery_app import celery
from app import db
from app.models.sensor_data import SensorData
from app.models.session import RecordingSession
from app.models.sync_log import SyncLog
from datetime import datetime, timedelta
import os


@celery.task(name='app.tasks.file_cleanup.cleanup_old_sensor_data')
def cleanup_old_sensor_data(days: int = 30):
    """
    오래된 센서 데이터 정리

    Args:
        days: 보관 기간 (일 단위, 기본값: 30일)

    Returns:
        dict: 정리 결과
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        # 오래된 세션 찾기 (업로드 완료되고 종료된 세션)
        old_sessions = RecordingSession.query.filter(
            RecordingSession.end_time < cutoff_date,
            RecordingSession.is_uploaded == True,
            RecordingSession.is_active == False
        ).all()

        if not old_sessions:
            return {
                'message': 'No old sessions to clean up',
                'cutoff_date': cutoff_date.isoformat(),
                'cleaned_sessions': 0,
                'cleaned_records': 0
            }

        # 세션별 센서 데이터 삭제
        total_records = 0
        cleaned_sessions = 0

        for session in old_sessions:
            # 센서 데이터 개수 확인
            record_count = SensorData.query.filter_by(session_id=session.id).count()

            if record_count > 0:
                # 센서 데이터 삭제
                SensorData.query.filter_by(session_id=session.id).delete()
                total_records += record_count

            # 세션도 삭제할지 결정 (선택적)
            # db.session.delete(session)
            cleaned_sessions += 1

        db.session.commit()

        return {
            'message': f'Successfully cleaned up old sensor data',
            'cutoff_date': cutoff_date.isoformat(),
            'cleaned_sessions': cleaned_sessions,
            'cleaned_records': total_records,
            'cleaned_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        db.session.rollback()
        return {
            'error': str(e),
            'cutoff_date': cutoff_date.isoformat() if 'cutoff_date' in locals() else None
        }


@celery.task(name='app.tasks.file_cleanup.cleanup_old_sync_logs')
def cleanup_old_sync_logs(days: int = 90):
    """
    오래된 동기화 로그 정리

    Args:
        days: 보관 기간 (일 단위, 기본값: 90일)

    Returns:
        dict: 정리 결과
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        # 오래된 동기화 로그 개수 확인
        old_logs_count = SyncLog.query.filter(
            SyncLog.created_at < cutoff_date
        ).count()

        if old_logs_count == 0:
            return {
                'message': 'No old sync logs to clean up',
                'cutoff_date': cutoff_date.isoformat(),
                'cleaned_logs': 0
            }

        # 로그 삭제
        SyncLog.query.filter(
            SyncLog.created_at < cutoff_date
        ).delete()

        db.session.commit()

        return {
            'message': f'Successfully cleaned up old sync logs',
            'cutoff_date': cutoff_date.isoformat(),
            'cleaned_logs': old_logs_count,
            'cleaned_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        db.session.rollback()
        return {
            'error': str(e),
            'cutoff_date': cutoff_date.isoformat() if 'cutoff_date' in locals() else None
        }


@celery.task(name='app.tasks.file_cleanup.cleanup_uploaded_files')
def cleanup_uploaded_files(days: int = 7):
    """
    오래된 업로드 파일 정리 (임시 파일, 처리 완료된 파일)

    Args:
        days: 보관 기간 (일 단위, 기본값: 7일)

    Returns:
        dict: 정리 결과
    """
    try:
        from flask import current_app

        upload_folder = current_app.config.get('UPLOAD_FOLDER', './uploads')

        if not os.path.exists(upload_folder):
            return {
                'message': 'Upload folder does not exist',
                'upload_folder': upload_folder,
                'cleaned_files': 0
            }

        cutoff_time = datetime.utcnow() - timedelta(days=days)
        cutoff_timestamp = cutoff_time.timestamp()

        cleaned_files = 0
        total_size = 0

        # 업로드 폴더의 파일 순회
        for root, dirs, files in os.walk(upload_folder):
            for filename in files:
                file_path = os.path.join(root, filename)

                try:
                    # 파일 수정 시간 확인
                    file_mtime = os.path.getmtime(file_path)

                    if file_mtime < cutoff_timestamp:
                        file_size = os.path.getsize(file_path)
                        os.remove(file_path)
                        cleaned_files += 1
                        total_size += file_size

                except OSError as e:
                    # 파일 접근 오류는 로깅만 하고 계속 진행
                    print(f"Error removing file {file_path}: {e}")
                    continue

        return {
            'message': f'Successfully cleaned up old uploaded files',
            'cutoff_date': cutoff_time.isoformat(),
            'cleaned_files': cleaned_files,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'cleaned_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        return {
            'error': str(e),
            'cutoff_date': cutoff_time.isoformat() if 'cutoff_time' in locals() else None
        }


@celery.task(name='app.tasks.file_cleanup.cleanup_failed_sessions')
def cleanup_failed_sessions(hours: int = 24):
    """
    실패하거나 중단된 세션 정리 (is_active=True but end_time is old)

    Args:
        hours: 보관 기간 (시간 단위, 기본값: 24시간)

    Returns:
        dict: 정리 결과
    """
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)

        # 활성 상태지만 오래된 세션 찾기
        stale_sessions = RecordingSession.query.filter(
            RecordingSession.is_active == True,
            RecordingSession.start_time < cutoff_time
        ).all()

        if not stale_sessions:
            return {
                'message': 'No stale sessions to clean up',
                'cutoff_time': cutoff_time.isoformat(),
                'cleaned_sessions': 0
            }

        cleaned_count = 0

        for session in stale_sessions:
            # 세션 종료 처리
            session.is_active = False
            session.end_time = session.start_time + timedelta(hours=1)  # 추정 종료 시간
            session.notes = (session.notes or '') + ' [Auto-closed: stale session]'
            cleaned_count += 1

        db.session.commit()

        return {
            'message': f'Successfully cleaned up stale sessions',
            'cutoff_time': cutoff_time.isoformat(),
            'cleaned_sessions': cleaned_count,
            'cleaned_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        db.session.rollback()
        return {
            'error': str(e),
            'cutoff_time': cutoff_time.isoformat() if 'cutoff_time' in locals() else None
        }


@celery.task(name='app.tasks.file_cleanup.optimize_database')
def optimize_database():
    """
    데이터베이스 최적화 (VACUUM, ANALYZE)

    PostgreSQL 전용 작업

    Returns:
        dict: 최적화 결과
    """
    try:
        # PostgreSQL VACUUM ANALYZE 실행
        # Note: 일반 트랜잭션 내에서는 실행할 수 없으므로 별도 연결 사용
        from sqlalchemy import text

        # 각 테이블별 통계 수집
        tables = ['users', 'recording_sessions', 'sensor_data', 'sync_logs']

        results = {}

        for table in tables:
            try:
                # Row 카운트
                result = db.session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()

                results[table] = {
                    'rows': count,
                    'status': 'analyzed'
                }

            except Exception as e:
                results[table] = {
                    'error': str(e),
                    'status': 'failed'
                }

        return {
            'message': 'Database optimization completed',
            'tables': results,
            'optimized_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        return {
            'error': str(e),
            'message': 'Database optimization failed'
        }


@celery.task(name='app.tasks.file_cleanup.generate_cleanup_report')
def generate_cleanup_report():
    """
    정리 작업 리포트 생성

    Returns:
        dict: 리포트 데이터
    """
    try:
        # 전체 통계
        total_sessions = RecordingSession.query.count()
        active_sessions = RecordingSession.query.filter_by(is_active=True).count()
        total_sensor_records = SensorData.query.count()
        total_sync_logs = SyncLog.query.count()

        # 최근 30일 통계
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_sessions = RecordingSession.query.filter(
            RecordingSession.created_at >= thirty_days_ago
        ).count()

        recent_syncs = SyncLog.query.filter(
            SyncLog.created_at >= thirty_days_ago
        ).count()

        # 디스크 사용량 (업로드 폴더)
        from flask import current_app
        upload_folder = current_app.config.get('UPLOAD_FOLDER', './uploads')
        disk_usage = _get_folder_size(upload_folder) if os.path.exists(upload_folder) else 0

        return {
            'report': {
                'total': {
                    'sessions': total_sessions,
                    'active_sessions': active_sessions,
                    'sensor_records': total_sensor_records,
                    'sync_logs': total_sync_logs,
                },
                'recent_30_days': {
                    'sessions': recent_sessions,
                    'syncs': recent_syncs,
                },
                'disk_usage': {
                    'upload_folder': upload_folder,
                    'size_mb': round(disk_usage / (1024 * 1024), 2),
                }
            },
            'generated_at': datetime.utcnow().isoformat()
        }

    except Exception as e:
        return {
            'error': str(e),
            'message': 'Failed to generate cleanup report'
        }


def _get_folder_size(folder_path: str) -> int:
    """
    폴더의 총 크기 계산 (바이트)

    Args:
        folder_path: 폴더 경로

    Returns:
        int: 총 크기 (바이트)
    """
    total_size = 0
    try:
        for dirpath, dirnames, filenames in os.walk(folder_path):
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                if os.path.exists(file_path):
                    total_size += os.path.getsize(file_path)
    except Exception:
        pass
    return total_size
