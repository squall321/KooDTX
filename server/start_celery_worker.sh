#!/bin/bash
# Celery Worker 시작 스크립트

# 환경 변수 로드
source venv/bin/activate

# Celery Worker 시작
# -A: Celery 앱 모듈
# --loglevel: 로그 레벨 (debug, info, warning, error, critical)
# --concurrency: 동시 작업 수
# --pool: Worker 풀 타입 (prefork, solo, gevent, eventlet)

celery -A celery_app.celery worker \
    --loglevel=info \
    --concurrency=4 \
    --pool=prefork \
    --logfile=logs/celery_worker.log \
    --pidfile=logs/celery_worker.pid
