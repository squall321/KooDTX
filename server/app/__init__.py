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

    # Register blueprints
    from app.routes import auth_bp, sync_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(sync_bp, url_prefix='/api/sync')

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
            'endpoints': {
                'health': '/health',
                'auth': '/api/auth',
                'sync': '/api/sync',
            }
        }, 200

    return app
