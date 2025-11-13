"""
Sensor Data Model
"""

from datetime import datetime
from app import db
from sqlalchemy.dialects.postgresql import JSONB


class SensorData(db.Model):
    """센서 데이터 모델 - 모든 센서 타입의 데이터를 저장"""

    __tablename__ = 'sensor_data'

    id = db.Column(db.BigInteger, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('recording_sessions.id'), nullable=False, index=True)

    # Sensor info
    sensor_type = db.Column(db.String(50), nullable=False, index=True)
    timestamp = db.Column(db.BigInteger, nullable=False, index=True)  # Unix timestamp in milliseconds

    # Sensor data (JSON format for flexibility)
    data = db.Column(JSONB, nullable=False)

    # Sync info
    is_uploaded = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # Composite index for duplicate check
    __table_args__ = (
        db.Index('idx_session_sensor_timestamp', 'session_id', 'sensor_type', 'timestamp'),
        db.Index('idx_created_at', 'created_at'),
    )

    def to_dict(self):
        """딕셔너리 변환"""
        return {
            'id': self.id,
            'session_id': self.session_id,
            'sensor_type': self.sensor_type,
            'timestamp': self.timestamp,
            'data': self.data,
            'is_uploaded': self.is_uploaded,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    @classmethod
    def get_by_session_and_type(cls, session_id: int, sensor_type: str):
        """세션 ID와 센서 타입으로 데이터 조회"""
        return cls.query.filter_by(session_id=session_id, sensor_type=sensor_type).all()

    @classmethod
    def get_by_time_range(cls, session_id: int, start_time: int, end_time: int):
        """시간 범위로 데이터 조회"""
        return cls.query.filter(
            cls.session_id == session_id,
            cls.timestamp >= start_time,
            cls.timestamp <= end_time
        ).all()

    def __repr__(self):
        return f'<SensorData {self.sensor_type} at {self.timestamp}>'
