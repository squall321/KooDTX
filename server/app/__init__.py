"""
KooDTX Flask Backend
센서 데이터 동기화 서버
"""

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config import Config

# Extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_class=Config):
    """
    Flask 앱 팩토리 패턴
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Initialize Swagger API
    from app.swagger import api
    api.init_app(app)

    # Register Swagger-documented routes
    from app.routes.swagger_routes import auth_ns, sync_ns
    api.add_namespace(auth_ns, path='/api/auth')
    api.add_namespace(sync_ns, path='/api/sync')

    # Register original blueprints (for backward compatibility)
    from app.routes import auth_bp, sync_bp
    # Note: Swagger routes are primary, blueprints are for fallback

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'KooDTX Backend'}, 200

    # Root endpoint
    @app.route('/')
    def index():
        return {
            'service': 'KooDTX Backend API',
            'version': '1.0.0',
            'documentation': '/docs',  # Swagger UI
            'endpoints': {
                'health': '/health',
                'docs': '/docs',
                'auth': '/api/auth',
                'sync': '/api/sync',
            }
        }, 200

    return app
