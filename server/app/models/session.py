"""
Recording Session Model
"""

from datetime import datetime
from app import db
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid


class RecordingSession(db.Model):
    """센서 데이터 기록 세션 모델"""

    __tablename__ = 'recording_sessions'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Session info
    start_time = db.Column(db.DateTime, nullable=False, index=True)
    end_time = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    # Sensor configuration
    enabled_sensors = db.Column(JSONB, default=list)  # ['accelerometer', 'gyroscope', ...]
    sample_rate = db.Column(db.Integer, default=100)  # Hz

    # Statistics
    data_count = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text)

    # Sync status
    is_uploaded = db.Column(db.Boolean, default=False)
    last_synced_at = db.Column(db.DateTime)

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sensor_data = db.relationship('SensorData', backref='session', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_data=False):
        """딕셔너리 변환"""
        result = {
            'id': self.id,
            'session_id': str(self.session_id),
            'user_id': self.user_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'is_active': self.is_active,
            'enabled_sensors': self.enabled_sensors,
            'sample_rate': self.sample_rate,
            'data_count': self.data_count,
            'notes': self.notes,
            'is_uploaded': self.is_uploaded,
            'last_synced_at': self.last_synced_at.isoformat() if self.last_synced_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_data:
            result['sensor_data'] = [data.to_dict() for data in self.sensor_data]

        return result

    def __repr__(self):
        return f'<RecordingSession {self.session_id}>'
