"""
Celery Application Instance
비동기 작업 처리를 위한 Celery 설정
"""

from celery import Celery
from app.config import Config

# Celery 인스턴스 생성
celery = Celery(
    'koodtx',
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND,
    include=['app.tasks.data_processing', 'app.tasks.file_cleanup']
)

# Celery 설정
celery.conf.update(
    # 작업 결과 만료 시간 (초)
    result_expires=3600,

    # 타임존
    timezone='UTC',
    enable_utc=True,

    # 작업 직렬화 포맷
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',

    # 작업 타임아웃 (초)
    task_time_limit=300,  # 5분
    task_soft_time_limit=240,  # 4분 (소프트 타임아웃)

    # 작업 재시도 설정
    task_acks_late=True,  # 작업 완료 후 ACK
    task_reject_on_worker_lost=True,

    # Worker 설정
    worker_prefetch_multiplier=1,  # 한 번에 하나의 작업만 가져오기
    worker_max_tasks_per_child=1000,  # Worker 재시작 주기

    # Beat 스케줄 (Celery Beat - 주기적 작업)
    beat_schedule={
        # Phase 45: 파일 정리 작업 (매일 새벽 3시)
        'cleanup-old-data': {
            'task': 'app.tasks.file_cleanup.cleanup_old_sensor_data',
            'schedule': 3600.0 * 24,  # 24시간마다
            'args': (30,)  # 30일 이상 된 데이터 정리
        },

        # 동기화 로그 정리 (매주 일요일 새벽 2시)
        'cleanup-sync-logs': {
            'task': 'app.tasks.file_cleanup.cleanup_old_sync_logs',
            'schedule': 3600.0 * 24 * 7,  # 7일마다
            'args': (90,)  # 90일 이상 된 로그 정리
        },
    },
)

# Flask 앱 컨텍스트와 Celery 통합
def init_celery(app):
    """
    Flask 앱과 Celery 통합

    Args:
        app: Flask 애플리케이션 인스턴스
    """
    class ContextTask(celery.Task):
        """Flask 앱 컨텍스트를 자동으로 푸시하는 Task 클래스"""

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery
