#!/bin/bash
# Production Server 중지 스크립트

set -e

PID_FILE="/tmp/koodtx-backend.pid"

echo "=== Stopping KooDTX Backend (Production) ==="

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")

    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Stopping server (PID: $PID)..."
        kill -TERM "$PID"

        # 종료 대기 (최대 10초)
        for i in {1..10}; do
            if ! ps -p "$PID" > /dev/null 2>&1; then
                echo "✓ Server stopped successfully!"
                rm -f "$PID_FILE"
                exit 0
            fi
            sleep 1
        done

        # 강제 종료
        echo "Server did not stop gracefully. Forcing..."
        kill -KILL "$PID" 2>/dev/null || true
        rm -f "$PID_FILE"
        echo "✓ Server forcefully stopped!"
    else
        echo "Server is not running (PID file exists but process not found)"
        rm -f "$PID_FILE"
    fi
else
    echo "Server is not running (no PID file found)"
fi
