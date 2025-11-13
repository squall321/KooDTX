#!/bin/bash
# Celery Beat 시작 스크립트 (스케줄러)

# 환경 변수 로드
source venv/bin/activate

# Celery Beat 시작
# -A: Celery 앱 모듈
# --loglevel: 로그 레벨
# --scheduler: 스케줄러 타입 (기본값: celery.beat:PersistentScheduler)

celery -A celery_app.celery beat \
    --loglevel=info \
    --logfile=logs/celery_beat.log \
    --pidfile=logs/celery_beat.pid \
    --schedule=logs/celerybeat-schedule
