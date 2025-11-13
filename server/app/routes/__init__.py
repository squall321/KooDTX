"""
API Routes
"""

from app.routes.auth import bp as auth_bp
from app.routes.sync import bp as sync_bp

__all__ = ['auth_bp', 'sync_bp']
