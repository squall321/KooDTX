#!/bin/bash
# KooDTX 프로세스 관리 스크립트

set -e

COMMAND=${1:-help}

case "$COMMAND" in
    start)
        echo "Starting all KooDTX processes..."
        sudo supervisorctl start koodtx:*
        echo "✓ All processes started"
        ;;

    stop)
        echo "Stopping all KooDTX processes..."
        sudo supervisorctl stop koodtx:*
        echo "✓ All processes stopped"
        ;;

    restart)
        echo "Restarting all KooDTX processes..."
        sudo supervisorctl restart koodtx:*
        echo "✓ All processes restarted"
        ;;

    status)
        echo "KooDTX Processes Status:"
        echo "========================"
        sudo supervisorctl status koodtx:*
        ;;

    logs)
        PROCESS=${2:-koodtx-backend}
        echo "Tailing logs for $PROCESS..."
        sudo supervisorctl tail -f "$PROCESS"
        ;;

    backend-start)
        echo "Starting backend..."
        sudo supervisorctl start koodtx-backend
        echo "✓ Backend started"
        ;;

    backend-stop)
        echo "Stopping backend..."
        sudo supervisorctl stop koodtx-backend
        echo "✓ Backend stopped"
        ;;

    backend-restart)
        echo "Restarting backend..."
        sudo supervisorctl restart koodtx-backend
        echo "✓ Backend restarted"
        ;;

    worker-start)
        echo "Starting Celery worker..."
        sudo supervisorctl start koodtx-celery-worker
        echo "✓ Worker started"
        ;;

    worker-stop)
        echo "Stopping Celery worker..."
        sudo supervisorctl stop koodtx-celery-worker
        echo "✓ Worker stopped"
        ;;

    worker-restart)
        echo "Restarting Celery worker..."
        sudo supervisorctl restart koodtx-celery-worker
        echo "✓ Worker restarted"
        ;;

    beat-start)
        echo "Starting Celery beat..."
        sudo supervisorctl start koodtx-celery-beat
        echo "✓ Beat started"
        ;;

    beat-stop)
        echo "Stopping Celery beat..."
        sudo supervisorctl stop koodtx-celery-beat
        echo "✓ Beat stopped"
        ;;

    beat-restart)
        echo "Restarting Celery beat..."
        sudo supervisorctl restart koodtx-celery-beat
        echo "✓ Beat restarted"
        ;;

    reload)
        echo "Reloading Supervisor configuration..."
        sudo supervisorctl reread
        sudo supervisorctl update
        echo "✓ Configuration reloaded"
        ;;

    help|*)
        echo "KooDTX Process Management"
        echo "========================="
        echo ""
        echo "Usage: ./manage_processes.sh [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start              - Start all processes"
        echo "  stop               - Stop all processes"
        echo "  restart            - Restart all processes"
        echo "  status             - Show process status"
        echo "  logs [PROCESS]     - Tail logs (default: koodtx-backend)"
        echo "  reload             - Reload Supervisor configuration"
        echo ""
        echo "Backend:"
        echo "  backend-start      - Start backend only"
        echo "  backend-stop       - Stop backend only"
        echo "  backend-restart    - Restart backend only"
        echo ""
        echo "Celery Worker:"
        echo "  worker-start       - Start worker only"
        echo "  worker-stop        - Stop worker only"
        echo "  worker-restart     - Restart worker only"
        echo ""
        echo "Celery Beat:"
        echo "  beat-start         - Start beat only"
        echo "  beat-stop          - Stop beat only"
        echo "  beat-restart       - Restart beat only"
        echo ""
        echo "Examples:"
        echo "  ./manage_processes.sh start"
        echo "  ./manage_processes.sh status"
        echo "  ./manage_processes.sh logs koodtx-celery-worker"
        echo "  ./manage_processes.sh backend-restart"
        ;;
esac
