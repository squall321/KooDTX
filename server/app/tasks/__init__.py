"""
Celery Tasks
비동기 작업 모듈
"""

from app.tasks.data_processing import (
    analyze_sensor_data,
    generate_statistics,
    detect_anomalies
)

from app.tasks.file_cleanup import (
    cleanup_old_sensor_data,
    cleanup_old_sync_logs,
    cleanup_uploaded_files
)

__all__ = [
    # Data processing tasks
    'analyze_sensor_data',
    'generate_statistics',
    'detect_anomalies',

    # File cleanup tasks
    'cleanup_old_sensor_data',
    'cleanup_old_sync_logs',
    'cleanup_uploaded_files',
]
