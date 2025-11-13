"""
Swagger-documented API Routes
Flask-RESTX를 사용한 API 문서화
"""

from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from datetime import datetime
from app import db
from app.models.user import User
from app.models.session import RecordingSession
from app.models.sensor_data import SensorData
from app.models.sync_log import SyncLog
from app.swagger.models import *
from sqlalchemy import and_

# ============================================================
# Auth Namespace
# ============================================================

auth_ns = Namespace('auth', description='인증 API')

@auth_ns.route('/register')
class AuthRegister(Resource):
    @auth_ns.doc('register_user', security=None)
    @auth_ns.expect(auth_register)
    @auth_ns.response(201, 'Success', auth_response)
    @auth_ns.response(400, 'Bad Request', error_response)
    def post(self):
        """사용자 등록"""
        data = request.get_json()

        # Validate required fields
        if not all(k in data for k in ['username', 'email', 'password', 'device_id']):
            return {'error': 'Missing required fields'}, 400

        # Check if user exists
        if User.query.filter_by(username=data['username']).first():
            return {'error': 'Username already exists'}, 400

        if User.query.filter_by(email=data['email']).first():
            return {'error': 'Email already exists'}, 400

        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            device_id=data['device_id']
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, 201


@auth_ns.route('/login')
class AuthLogin(Resource):
    @auth_ns.doc('login_user', security=None)
    @auth_ns.expect(auth_login)
    @auth_ns.response(200, 'Success', auth_response)
    @auth_ns.response(401, 'Unauthorized', error_response)
    def post(self):
        """로그인"""
        data = request.get_json()

        if not all(k in data for k in ['username', 'password']):
            return {'error': 'Missing username or password'}, 400

        user = User.query.filter_by(username=data['username']).first()

        if not user or not user.check_password(data['password']):
            return {'error': 'Invalid username or password'}, 401

        # Generate tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, 200


@auth_ns.route('/refresh')
class AuthRefresh(Resource):
    @auth_ns.doc('refresh_token')
    @auth_ns.expect(auth_refresh)
    @auth_ns.response(200, 'Success', auth_response)
    @jwt_required(refresh=True)
    def post(self):
        """토큰 갱신"""
        current_user_id = get_jwt_identity()
        access_token = create_access_token(identity=current_user_id)

        return {'access_token': access_token}, 200


@auth_ns.route('/me')
class AuthMe(Resource):
    @auth_ns.doc('get_current_user', security='Bearer')
    @auth_ns.response(200, 'Success')
    @auth_ns.response(401, 'Unauthorized', error_response)
    @jwt_required()
    def get(self):
        """현재 사용자 정보"""
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return {'error': 'User not found'}, 404

        return user.to_dict(), 200


# ============================================================
# Sync Namespace
# ============================================================

sync_ns = Namespace('sync', description='동기화 API')

@sync_ns.route('/push')
class SyncPush(Resource):
    @sync_ns.doc('sync_push', security='Bearer')
    @sync_ns.expect(sync_push_request)
    @sync_ns.response(200, 'Success', sync_push_response)
    @sync_ns.response(400, 'Bad Request', error_response)
    @sync_ns.response(401, 'Unauthorized', error_response)
    @jwt_required()
    def post(self):
        """
        센서 데이터 Push (클라이언트 → 서버)

        중복 체크, Last-Write-Wins, 배치 처리
        """
        current_user_id = get_jwt_identity()
        sync_start_time = datetime.utcnow()

        try:
            data = request.get_json()

            if not data or 'session' not in data or 'sensor_data' not in data:
                return {'error': 'Invalid request format'}, 400

            session_data = data['session']
            sensor_data_list = data['sensor_data']

            if 'session_id' not in session_data or 'start_time' not in session_data:
                return {'error': 'Missing session_id or start_time'}, 400

            # Create sync log
            sync_log = SyncLog(
                user_id=current_user_id,
                sync_type='push',
                started_at=sync_start_time
            )
            db.session.add(sync_log)
            db.session.flush()

            # Find or create recording session
            session = RecordingSession.query.filter_by(
                user_id=current_user_id,
                session_id=session_data['session_id']
            ).first()

            if not session:
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
                db.session.flush()
            else:
                if session_data.get('end_time'):
                    session.end_time = datetime.fromisoformat(session_data['end_time'].replace('Z', '+00:00'))
                session.is_active = session_data.get('is_active', session.is_active)
                session.notes = session_data.get('notes', session.notes)
                session.updated_at = datetime.utcnow()

            sync_log.session_id = session.id

            # Process sensor data
            inserted_count = 0
            updated_count = 0
            duplicate_count = 0

            # Group by sensor type
            data_by_type = {}
            for item in sensor_data_list:
                sensor_type = item.get('sensor_type')
                if sensor_type not in data_by_type:
                    data_by_type[sensor_type] = []
                data_by_type[sensor_type].append(item)

            # Process each sensor type
            for sensor_type, items in data_by_type.items():
                timestamps = [item['timestamp'] for item in items]
                existing_data = SensorData.query.filter(
                    and_(
                        SensorData.session_id == session.id,
                        SensorData.sensor_type == sensor_type,
                        SensorData.timestamp.in_(timestamps)
                    )
                ).all()

                existing_lookup = {data.timestamp: data for data in existing_data}
                new_records = []

                for item in items:
                    timestamp = item['timestamp']
                    sensor_data_dict = item.get('data', {})

                    if timestamp in existing_lookup:
                        existing = existing_lookup[timestamp]
                        existing.data = sensor_data_dict
                        existing.is_uploaded = True
                        updated_count += 1
                    else:
                        new_record = SensorData(
                            session_id=session.id,
                            sensor_type=sensor_type,
                            timestamp=timestamp,
                            data=sensor_data_dict,
                            is_uploaded=True
                        )
                        new_records.append(new_record)
                        inserted_count += 1

                if new_records:
                    db.session.bulk_save_objects(new_records)

            # Update session
            session.data_count = SensorData.query.filter_by(session_id=session.id).count()
            session.last_synced_at = datetime.utcnow()
            session.is_uploaded = True

            # Update sync log
            sync_log.records_count = len(sensor_data_list)
            sync_log.duplicates_count = duplicate_count
            sync_log.errors_count = 0
            sync_log.status = 'success'
            sync_log.completed_at = datetime.utcnow()
            sync_log.metadata = {
                'inserted': inserted_count,
                'updated': updated_count,
                'sensor_types': list(data_by_type.keys()),
                'total_size_bytes': len(request.data)
            }

            db.session.commit()

            return {
                'message': 'Sync completed successfully',
                'session_id': str(session.session_id),
                'total_records': len(sensor_data_list),
                'inserted': inserted_count,
                'updated': updated_count,
                'duplicates': duplicate_count,
                'errors': 0,
                'sync_log_id': sync_log.id,
                'session_data_count': session.data_count
            }, 200

        except Exception as e:
            db.session.rollback()
            if 'sync_log' in locals():
                sync_log.status = 'failed'
                sync_log.error_message = str(e)
                sync_log.errors_count = len(sensor_data_list) if 'sensor_data_list' in locals() else 0
                sync_log.completed_at = datetime.utcnow()
                db.session.commit()

            return {'error': 'Internal server error', 'details': str(e)}, 500


@sync_ns.route('/pull')
class SyncPull(Resource):
    @sync_ns.doc('sync_pull', security='Bearer')
    @sync_ns.expect(sync_pull_request)
    @sync_ns.response(200, 'Success', sync_pull_response)
    @sync_ns.response(400, 'Bad Request', error_response)
    @jwt_required()
    def post(self):
        """
        센서 데이터 Pull (서버 → 클라이언트)

        델타 동기화, 페이지네이션
        """
        current_user_id = get_jwt_identity()
        sync_start_time = datetime.utcnow()

        try:
            data = request.get_json() or {}

            last_sync_time = data.get('last_sync_time')
            session_ids = data.get('session_ids', [])
            page = data.get('page', 1)
            page_size = data.get('page_size', 50)
            include_data = data.get('include_data', True)

            if page < 1:
                return {'error': 'Page must be >= 1'}, 400
            if page_size < 1 or page_size > 100:
                return {'error': 'Page size must be between 1 and 100'}, 400

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

            # Build query
            query = RecordingSession.query.filter_by(user_id=current_user_id)

            if last_sync_time:
                try:
                    last_sync_dt = datetime.fromisoformat(last_sync_time.replace('Z', '+00:00'))
                    query = query.filter(RecordingSession.updated_at > last_sync_dt)
                except ValueError:
                    return {'error': 'Invalid last_sync_time format. Use ISO 8601.'}, 400

            if session_ids:
                query = query.filter(RecordingSession.session_id.in_(session_ids))

            query = query.order_by(RecordingSession.updated_at.desc())

            total = query.count()
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

                if include_data:
                    sensor_data = SensorData.query.filter_by(
                        session_id=session.id
                    ).order_by(SensorData.timestamp.asc()).all()

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

            db.session.commit()

            return {
                'sessions': sessions_data,
                'server_timestamp': datetime.utcnow().isoformat() + 'Z',
                'page': page,
                'page_size': page_size,
                'total': total,
                'has_more': has_more,
                'sync_log_id': sync_log.id
            }, 200

        except Exception as e:
            db.session.rollback()
            if 'sync_log' in locals():
                sync_log.status = 'failed'
                sync_log.error_message = str(e)
                sync_log.completed_at = datetime.utcnow()
                db.session.commit()

            return {'error': 'Internal server error', 'details': str(e)}, 500


@sync_ns.route('/status')
class SyncStatus(Resource):
    @sync_ns.doc('sync_status', security='Bearer')
    @sync_ns.response(200, 'Success', sync_status_response)
    @jwt_required()
    def get(self):
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

        return {
            'total_sessions': total_sessions,
            'active_sessions': active_sessions,
            'uploaded_sessions': uploaded_sessions,
            'recent_syncs': [log.to_dict() for log in recent_syncs]
        }, 200
