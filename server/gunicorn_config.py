"""
Gunicorn Configuration
프로덕션 WSGI 서버 설정
"""

import multiprocessing
import os

# Server Socket
bind = os.getenv('GUNICORN_BIND', '0.0.0.0:5000')
backlog = 2048

# Worker Processes
workers = int(os.getenv('GUNICORN_WORKERS', multiprocessing.cpu_count() * 2 + 1))
worker_class = 'sync'  # or 'gevent', 'eventlet'
worker_connections = 1000
max_requests = 1000  # Worker 재시작 주기
max_requests_jitter = 50
timeout = 30
keepalive = 2

# Logging
accesslog = os.getenv('GUNICORN_ACCESS_LOG', '-')  # stdout
errorlog = os.getenv('GUNICORN_ERROR_LOG', '-')    # stderr
loglevel = os.getenv('GUNICORN_LOG_LEVEL', 'info')
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process Naming
proc_name = 'koodtx-backend'

# Server Mechanics
daemon = False  # Supervisor가 관리하므로 False
pidfile = os.getenv('GUNICORN_PID_FILE', '/tmp/koodtx-backend.pid')
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (HTTPS)
keyfile = os.getenv('SSL_KEYFILE', None)
certfile = os.getenv('SSL_CERTFILE', None)

# Preload
preload_app = True  # 메모리 절약

# Server Hooks
def on_starting(server):
    """서버 시작 시"""
    print(f"Starting Gunicorn with {workers} workers...")


def when_ready(server):
    """서버 준비 완료 시"""
    print(f"Server is ready. Listening on {bind}")


def on_reload(server):
    """코드 리로드 시"""
    print("Reloading server...")


def worker_int(worker):
    """Worker 인터럽트 시"""
    print(f"Worker {worker.pid} interrupted")


def worker_abort(worker):
    """Worker 중단 시"""
    print(f"Worker {worker.pid} aborted")


def pre_fork(server, worker):
    """Worker fork 전"""
    pass


def post_fork(server, worker):
    """Worker fork 후"""
    print(f"Worker spawned (pid: {worker.pid})")


def pre_exec(server):
    """새 마스터 프로세스 실행 전"""
    print("Forking a new master process")


def pre_request(worker, req):
    """요청 처리 전"""
    worker.log.debug(f"{req.method} {req.path}")


def post_request(worker, req, environ, resp):
    """요청 처리 후"""
    pass


def child_exit(server, worker):
    """Worker 종료 시"""
    print(f"Worker {worker.pid} exited")


def worker_exit(server, worker):
    """Worker 종료 후"""
    pass


def nworkers_changed(server, new_value, old_value):
    """Worker 수 변경 시"""
    print(f"Workers changed from {old_value} to {new_value}")


def on_exit(server):
    """서버 종료 시"""
    print("Server is shutting down...")
