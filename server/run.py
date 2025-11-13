"""
KooDTX Flask Backend - Application Entry Point
"""

import os
from app import create_app, db
from app.config import config

# Get environment
env = os.getenv('FLASK_ENV', 'development')

# Create app
app = create_app(config[env])


@app.shell_context_processor
def make_shell_context():
    """Flask shell context"""
    from app.models import User, RecordingSession, SensorData, SyncLog
    return {
        'db': db,
        'User': User,
        'RecordingSession': RecordingSession,
        'SensorData': SensorData,
        'SyncLog': SyncLog
    }


@app.cli.command()
def init_db():
    """Initialize database"""
    db.create_all()
    print('Database initialized successfully!')


@app.cli.command()
def drop_db():
    """Drop all tables"""
    if input('Are you sure you want to drop all tables? (yes/no): ').lower() == 'yes':
        db.drop_all()
        print('All tables dropped!')
    else:
        print('Operation cancelled.')


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=app.config['DEBUG']
    )
