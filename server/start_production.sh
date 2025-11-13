#!/bin/bash
# Production Server 시작 스크립트

set -e

echo "=== Starting KooDTX Backend (Production) ==="

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# 가상 환경 활성화
source venv/bin/activate

# 데이터베이스 마이그레이션 확인
echo "Checking database migrations..."
flask db upgrade

# Gunicorn 시작
echo "Starting Gunicorn..."
gunicorn \
    --config gunicorn_config.py \
    --bind 0.0.0.0:5000 \
    --daemon \
    run:app

echo "✓ Server started successfully!"
echo "  PID file: /tmp/koodtx-backend.pid"
echo "  Logs: Check gunicorn logs"
echo ""
echo "To stop the server, run: ./stop_production.sh"
