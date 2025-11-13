#!/bin/bash
# Supervisor 설정 및 설치 스크립트

set -e

echo "=== KooDTX Supervisor Setup ==="

# Supervisor 설치 확인
if ! command -v supervisorctl &> /dev/null; then
    echo "Installing Supervisor..."
    sudo apt update
    sudo apt install -y supervisor
else
    echo "✓ Supervisor is already installed"
fi

# 로그 디렉토리 생성
echo "Creating log directories..."
sudo mkdir -p /var/log/supervisor
sudo chown -R www-data:www-data /var/log/supervisor

# Supervisor 설정 파일 복사
echo "Copying Supervisor configuration..."
sudo cp supervisor.conf /etc/supervisor/conf.d/koodtx.conf

# 설정 리로드
echo "Reloading Supervisor configuration..."
sudo supervisorctl reread
sudo supervisorctl update

echo ""
echo "✓ Supervisor setup completed!"
echo ""
echo "Available commands:"
echo "  sudo supervisorctl status koodtx:*          # 상태 확인"
echo "  sudo supervisorctl start koodtx:*           # 모두 시작"
echo "  sudo supervisorctl stop koodtx:*            # 모두 중지"
echo "  sudo supervisorctl restart koodtx:*         # 모두 재시작"
echo ""
echo "  sudo supervisorctl start koodtx-backend     # 백엔드만 시작"
echo "  sudo supervisorctl start koodtx-celery-worker  # Worker만 시작"
echo "  sudo supervisorctl start koodtx-celery-beat    # Beat만 시작"
echo ""
echo "  sudo supervisorctl tail -f koodtx-backend   # 실시간 로그"
