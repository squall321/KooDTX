"""
Sync Log Model
"""

from datetime import datetime
from app import db
from sqlalchemy.dialects.postgresql import JSONB


class SyncLog(db.Model):
    """동기화 로그 모델"""

    __tablename__ = 'sync_logs'

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Sync info
    sync_type = db.Column(db.String(20), nullable=False)  # 'push' or 'pull'
    session_id = db.Column(db.Integer, db.ForeignKey('recording_sessions.id'), index=True)

    # Statistics
    records_count = db.Column(db.Integer, default=0)
    duplicates_count = db.Column(db.Integer, default=0)
    errors_count = db.Column(db.Integer, default=0)

    # Details
    status = db.Column(db.String(20), default='success')  # 'success', 'partial', 'failed'
    error_message = db.Column(db.Text)
    metadata = db.Column(JSONB)

    # Timestamps
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        """딕셔너리 변환"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'sync_type': self.sync_type,
            'session_id': self.session_id,
            'records_count': self.records_count,
            'duplicates_count': self.duplicates_count,
            'errors_count': self.errors_count,
            'status': self.status,
            'error_message': self.error_message,
            'metadata': self.metadata,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<SyncLog {self.sync_type} - {self.status}>'
