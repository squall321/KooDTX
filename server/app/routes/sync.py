"""
Sync Routes - Phase 41: Push API
센서 데이터 동기화 API
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db
from app.models.user import User
from app.models.session import RecordingSession
from app.models.sensor_data import SensorData
from app.models.sync_log import SyncLog
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError

bp = Blueprint('sync', __name__)


@bp.route('/push', methods=['POST'])
@jwt_required()
def push_data():
    """
    Phase 41: 동기화 Push API

    클라이언트에서 서버로 센서 데이터 전송
    - 중복 체크 (session_id + sensor_type + timestamp)
    - Last-Write-Wins 충돌 해결
    - 배치 처리 (bulk insert)
    - 동기화 로그 기록

    Request Body:
    {
        "session": {
            "session_id": "uuid",
            "start_time": "iso-datetime",
            "end_time": "iso-datetime",
            "enabled_sensors": ["accelerometer", "gyroscope"],
            "sample_rate": 100,
            "notes": "string"
        },
        "sensor_data": [
            {
                "sensor_type": "accelerometer",
                "timestamp": 1699876543210,
                "data": {
                    "x": 0.1,
                    "y": 0.2,
                    "z": 9.8
                }
            },
            ...
        ]
    }

    Response:
    {
        "message": "Sync completed successfully",
        "session_id": "uuid",
        "total_records": 1000,
        "inserted": 950,
        "updated": 30,
        "duplicates": 20,
        "errors": 0,
        "sync_log_id": 123
    }
    """
    current_user_id = get_jwt_identity()
    sync_start_time = datetime.utcnow()

    try:
        # Parse request data
        data = request.get_json()

        if not data or 'session' not in data or 'sensor_data' not in data:
            return jsonify({'error': 'Invalid request format'}), 400

        session_data = data['session']
        sensor_data_list = data['sensor_data']

        # Validate required fields
        if 'session_id' not in session_data or 'start_time' not in session_data:
            return jsonify({'error': 'Missing session_id or start_time'}), 400

        # Create sync log
        sync_log = SyncLog(
            user_id=current_user_id,
            sync_type='push',
            started_at=sync_start_time
        )
        db.session.add(sync_log)
        db.session.flush()  # Get sync_log.id

        # Find or create recording session
        session = RecordingSession.query.filter_by(
            user_id=current_user_id,
            session_id=session_data['session_id']
        ).first()

        if not session:
            # Create new session
            session = RecordingSession(
                user_id=current_user_id,
                session_id=session_data['session_id'],
                start_time=datetime.fromisoformat(session_data['start_time'].replace('Z', '+00:00')),
                end_time=datetime.fromisoformat(session_data['end_time'].replace('Z', '+00:00')) if session_data.get('end_time') else None,
                is_active=session_data.get('is_active', False),
                enabled_sensors=session_data.get('enabled_sensors', []),
                sample_rate=session_data.get('sample_rate', 100),
                notes=session_data.get('notes', '')
            )
            db.session.add(session)
            db.session.flush()  # Get session.id
        else:
            # Update existing session (Last-Write-Wins)
            if session_data.get('end_time'):
                session.end_time = datetime.fromisoformat(session_data['end_time'].replace('Z', '+00:00'))
            session.is_active = session_data.get('is_active', session.is_active)
            session.notes = session_data.get('notes', session.notes)
            session.updated_at = datetime.utcnow()

        sync_log.session_id = session.id

        # Process sensor data in batch
        inserted_count = 0
        updated_count = 0
        duplicate_count = 0
        error_count = 0

        # Group by sensor_type for efficient processing
        data_by_type = {}
        for item in sensor_data_list:
            sensor_type = item.get('sensor_type')
            if sensor_type not in data_by_type:
                data_by_type[sensor_type] = []
            data_by_type[sensor_type].append(item)

        # Process each sensor type
        for sensor_type, items in data_by_type.items():
            # Get existing data for duplicate check
            timestamps = [item['timestamp'] for item in items]
            existing_data = SensorData.query.filter(
                and_(
                    SensorData.session_id == session.id,
                    SensorData.sensor_type == sensor_type,
                    SensorData.timestamp.in_(timestamps)
                )
            ).all()

            # Create lookup dictionary for existing data
            existing_lookup = {data.timestamp: data for data in existing_data}

            # Prepare bulk insert/update
            new_records = []

            for item in items:
                timestamp = item['timestamp']
                sensor_data_dict = item.get('data', {})

                if timestamp in existing_lookup:
                    # Duplicate found - Last-Write-Wins strategy
                    existing = existing_lookup[timestamp]

                    # Compare created_at (if client provides it)
                    # For now, we always update (Last-Write-Wins)
                    existing.data = sensor_data_dict
                    existing.is_uploaded = True
                    updated_count += 1
                else:
                    # New record
                    new_record = SensorData(
                        session_id=session.id,
                        sensor_type=sensor_type,
                        timestamp=timestamp,
                        data=sensor_data_dict,
                        is_uploaded=True
                    )
                    new_records.append(new_record)
                    inserted_count += 1

            # Bulk insert new records
            if new_records:
                db.session.bulk_save_objects(new_records)

        # Update session data_count
        session.data_count = SensorData.query.filter_by(session_id=session.id).count()
        session.last_synced_at = datetime.utcnow()
        session.is_uploaded = True

        # Update sync log
        sync_log.records_count = len(sensor_data_list)
        sync_log.duplicates_count = duplicate_count
        sync_log.errors_count = error_count
        sync_log.status = 'success'
        sync_log.completed_at = datetime.utcnow()
        sync_log.metadata = {
            'inserted': inserted_count,
            'updated': updated_count,
            'sensor_types': list(data_by_type.keys()),
            'total_size_bytes': len(request.data)
        }

        # Commit transaction
        db.session.commit()

        return jsonify({
            'message': 'Sync completed successfully',
            'session_id': str(session.session_id),
            'total_records': len(sensor_data_list),
            'inserted': inserted_count,
            'updated': updated_count,
            'duplicates': duplicate_count,
            'errors': error_count,
            'sync_log_id': sync_log.id,
            'session_data_count': session.data_count
        }), 200

    except IntegrityError as e:
        db.session.rollback()

        # Update sync log
        if 'sync_log' in locals():
            sync_log.status = 'failed'
            sync_log.error_message = str(e)
            sync_log.errors_count = len(sensor_data_list) if 'sensor_data_list' in locals() else 0
            sync_log.completed_at = datetime.utcnow()
            db.session.commit()

        return jsonify({
            'error': 'Database integrity error',
            'details': str(e)
        }), 500

    except Exception as e:
        db.session.rollback()

        # Update sync log
        if 'sync_log' in locals():
            sync_log.status = 'failed'
            sync_log.error_message = str(e)
            sync_log.errors_count = len(sensor_data_list) if 'sensor_data_list' in locals() else 0
            sync_log.completed_at = datetime.utcnow()
            db.session.commit()

        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@bp.route('/pull', methods=['POST'])
@jwt_required()
def pull_data():
    """
    Phase 42: 동기화 Pull API

    서버에서 클라이언트로 데이터 전송 (델타 동기화)
    - last_sync_time 이후 변경된 세션만 전송
    - 페이지네이션 지원
    - 서버 타임스탬프 반환

    Request Body:
    {
        "last_sync_time": "2025-11-13T00:00:00Z",  # Optional, ISO datetime
        "session_ids": ["uuid1", "uuid2"],          # Optional, specific sessions
        "page": 1,
        "page_size": 50,
        "include_data": true                         # Include sensor data or just metadata
    }

    Response:
    {
        "sessions": [
            {
                "session_id": "uuid",
                "start_time": "iso-datetime",
                "end_time": "iso-datetime",
                "enabled_sensors": ["accelerometer"],
                "sample_rate": 100,
                "data_count": 5000,
                "notes": "Morning workout",
                "sensor_data": [...]  # If include_data=true
            }
        ],
        "server_timestamp": "2025-11-13T12:00:00Z",
        "page": 1,
        "page_size": 50,
        "total": 150,
        "has_more": true
    }
    """
    current_user_id = get_jwt_identity()
    sync_start_time = datetime.utcnow()

    try:
        # Parse request data
        data = request.get_json() or {}

        last_sync_time = data.get('last_sync_time')
        session_ids = data.get('session_ids', [])
        page = data.get('page', 1)
        page_size = data.get('page_size', 50)
        include_data = data.get('include_data', True)

        # Validate pagination
        if page < 1:
            return jsonify({'error': 'Page must be >= 1'}), 400
        if page_size < 1 or page_size > 100:
            return jsonify({'error': 'Page size must be between 1 and 100'}), 400

        # Create sync log
        sync_log = SyncLog(
            user_id=current_user_id,
            sync_type='pull',
            started_at=sync_start_time,
            metadata={
                'last_sync_time': last_sync_time,
                'page': page,
                'page_size': page_size,
                'include_data': include_data
            }
        )
        db.session.add(sync_log)
        db.session.flush()

        # Build query for sessions
        query = RecordingSession.query.filter_by(user_id=current_user_id)

        # Filter by last_sync_time (delta sync)
        if last_sync_time:
            try:
                last_sync_dt = datetime.fromisoformat(last_sync_time.replace('Z', '+00:00'))
                query = query.filter(RecordingSession.updated_at > last_sync_dt)
            except ValueError:
                return jsonify({'error': 'Invalid last_sync_time format. Use ISO 8601.'}), 400

        # Filter by specific session_ids (if provided)
        if session_ids:
            query = query.filter(RecordingSession.session_id.in_(session_ids))

        # Order by updated_at descending (most recent first)
        query = query.order_by(RecordingSession.updated_at.desc())

        # Get total count before pagination
        total = query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        sessions = query.offset(offset).limit(page_size).all()

        # Build response
        sessions_data = []
        total_records = 0

        for session in sessions:
            session_dict = {
                'session_id': str(session.session_id),
                'start_time': session.start_time.isoformat() + 'Z',
                'end_time': session.end_time.isoformat() + 'Z' if session.end_time else None,
                'is_active': session.is_active,
                'enabled_sensors': session.enabled_sensors,
                'sample_rate': session.sample_rate,
                'data_count': session.data_count,
                'notes': session.notes,
                'is_uploaded': session.is_uploaded,
                'created_at': session.created_at.isoformat() + 'Z',
                'updated_at': session.updated_at.isoformat() + 'Z'
            }

            # Include sensor data if requested
            if include_data:
                sensor_data = SensorData.query.filter_by(
                    session_id=session.id
                ).order_by(
                    SensorData.timestamp.asc()
                ).all()

                session_dict['sensor_data'] = [
                    {
                        'sensor_type': sd.sensor_type,
                        'timestamp': sd.timestamp,
                        'data': sd.data
                    }
                    for sd in sensor_data
                ]

                total_records += len(sensor_data)
            else:
                session_dict['sensor_data'] = []

            sessions_data.append(session_dict)

        # Calculate has_more
        has_more = (offset + page_size) < total

        # Update sync log
        sync_log.records_count = total_records
        sync_log.status = 'success'
        sync_log.completed_at = datetime.utcnow()
        sync_log.metadata.update({
            'sessions_count': len(sessions_data),
            'total_records': total_records,
            'total_sessions': total,
            'has_more': has_more
        })

        # Commit transaction
        db.session.commit()

        return jsonify({
            'sessions': sessions_data,
            'server_timestamp': datetime.utcnow().isoformat() + 'Z',
            'page': page,
            'page_size': page_size,
            'total': total,
            'has_more': has_more,
            'sync_log_id': sync_log.id
        }), 200

    except Exception as e:
        db.session.rollback()

        # Update sync log
        if 'sync_log' in locals():
            sync_log.status = 'failed'
            sync_log.error_message = str(e)
            sync_log.completed_at = datetime.utcnow()
            db.session.commit()

        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@bp.route('/status', methods=['GET'])
@jwt_required()
def sync_status():
    """동기화 상태 조회"""
    current_user_id = get_jwt_identity()

    # Get recent sync logs
    recent_syncs = SyncLog.query.filter_by(
        user_id=current_user_id
    ).order_by(
        SyncLog.created_at.desc()
    ).limit(10).all()

    # Get session statistics
    total_sessions = RecordingSession.query.filter_by(user_id=current_user_id).count()
    active_sessions = RecordingSession.query.filter_by(user_id=current_user_id, is_active=True).count()
    uploaded_sessions = RecordingSession.query.filter_by(user_id=current_user_id, is_uploaded=True).count()

    return jsonify({
        'total_sessions': total_sessions,
        'active_sessions': active_sessions,
        'uploaded_sessions': uploaded_sessions,
        'recent_syncs': [log.to_dict() for log in recent_syncs]
    }), 200
