# Public API Guide

**공개 API 가이드** | Public API Documentation

KooDTX 공개 API를 사용하여 외부 애플리케이션에서 센서 데이터에 접근할 수 있습니다.

---

## 📋 개요

KooDTX Public API는 RESTful API로, API 키 기반 인증을 사용하여 안전하게 데이터에 접근할 수 있습니다.

### 기본 정보

- **Base URL**: `https://api.koodtx.com/v1`
- **인증 방식**: API Key
- **Rate Limit**: 1,000 requests/hour (기본)
- **응답 형식**: JSON

---

## 🔐 인증

### API 키 발급

1. KooDTX 대시보드에 로그인
2. **Settings > API Keys**로 이동
3. **"Generate New API Key"** 클릭
4. API 키를 안전한 곳에 저장

### API 키 사용

모든 요청의 헤더에 API 키를 포함해야 합니다:

```http
GET /sessions HTTP/1.1
Host: api.koodtx.com
X-API-Key: your_api_key_here
Content-Type: application/json
```

**예시 (cURL):**

```bash
curl -H "X-API-Key: your_api_key_here" \
     https://api.koodtx.com/v1/sessions
```

**예시 (JavaScript):**

```javascript
const response = await fetch('https://api.koodtx.com/v1/sessions', {
  headers: {
    'X-API-Key': 'your_api_key_here',
  },
});

const sessions = await response.json();
```

---

## 📡 Endpoints

### 세션 (Sessions)

#### 1. 모든 세션 조회

```http
GET /sessions
```

**응답:**

```json
{
  "sessions": [
    {
      "id": "session_123",
      "name": "Morning Walk",
      "createdAt": "2025-01-16T10:00:00Z",
      "duration": 3600,
      "dataPoints": 36000,
      "sensors": ["gps", "accelerometer", "gyroscope"]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

**쿼리 파라미터:**

- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 20, 최대: 100)
- `sort` (optional): 정렬 기준 (`createdAt`, `duration`, `name`)
- `order` (optional): 정렬 순서 (`asc`, `desc`)

#### 2. 세션 상세 조회

```http
GET /sessions/:id
```

**응답:**

```json
{
  "id": "session_123",
  "name": "Morning Walk",
  "createdAt": "2025-01-16T10:00:00Z",
  "duration": 3600,
  "dataPoints": 36000,
  "sensors": ["gps", "accelerometer", "gyroscope"],
  "metadata": {
    "device": "Samsung Galaxy S23",
    "os": "Android 13",
    "appVersion": "0.1.0"
  }
}
```

#### 3. 센서 데이터 조회

```http
GET /sessions/:id/data/:sensorType
```

**Path Parameters:**

- `id`: 세션 ID
- `sensorType`: 센서 타입 (`gps`, `accelerometer`, `gyroscope`, `magnetometer`, `barometer`)

**쿼리 파라미터:**

- `startTime` (optional): 시작 시간 (ISO 8601)
- `endTime` (optional): 종료 시간 (ISO 8601)
- `limit` (optional): 최대 데이터 포인트 수 (기본값: 10000)
- `format` (optional): 응답 형식 (`json`, `csv`)

**응답 (JSON):**

```json
{
  "sessionId": "session_123",
  "sensorType": "accelerometer",
  "data": [
    {
      "timestamp": "2025-01-16T10:00:00.000Z",
      "x": 0.5,
      "y": 0.2,
      "z": 9.8
    },
    {
      "timestamp": "2025-01-16T10:00:00.020Z",
      "x": 0.6,
      "y": 0.3,
      "z": 9.7
    }
  ],
  "count": 2,
  "hasMore": true
}
```

**응답 (CSV):**

```csv
timestamp,x,y,z
2025-01-16T10:00:00.000Z,0.5,0.2,9.8
2025-01-16T10:00:00.020Z,0.6,0.3,9.7
```

#### 4. 세션 삭제

```http
DELETE /sessions/:id
```

**응답:**

```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

### 통계 (Statistics)

#### 1. 세션 통계 조회

```http
GET /sessions/:id/statistics
```

**쿼리 파라미터:**

- `sensorType` (required): 센서 타입

**응답:**

```json
{
  "sessionId": "session_123",
  "sensorType": "accelerometer",
  "statistics": {
    "mean": { "x": 0.5, "y": 0.3, "z": 9.8 },
    "median": { "x": 0.4, "y": 0.2, "z": 9.7 },
    "stdDev": { "x": 0.2, "y": 0.1, "z": 0.3 },
    "min": { "x": 0.1, "y": 0.0, "z": 9.5 },
    "max": { "x": 1.0, "y": 0.6, "z": 10.1 }
  }
}
```

---

## ⚠️ 에러 처리

### HTTP 상태 코드

- `200 OK`: 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패 (잘못된 API 키)
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `429 Too Many Requests`: Rate limit 초과
- `500 Internal Server Error`: 서버 오류

### 에러 응답 형식

```json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid",
    "details": {
      "timestamp": "2025-01-16T10:00:00Z"
    }
  }
}
```

### 에러 코드

| 코드 | 설명 |
|------|------|
| `INVALID_API_KEY` | API 키가 유효하지 않음 |
| `RATE_LIMIT_EXCEEDED` | Rate limit 초과 |
| `SESSION_NOT_FOUND` | 세션을 찾을 수 없음 |
| `INVALID_SENSOR_TYPE` | 잘못된 센서 타입 |
| `INVALID_PARAMETER` | 잘못된 파라미터 |

---

## 🚦 Rate Limiting

### 제한

- **기본**: 1,000 requests/hour
- **Pro**: 10,000 requests/hour
- **Enterprise**: 무제한

### 헤더

응답 헤더에 Rate limit 정보가 포함됩니다:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1642345678
```

### Rate Limit 초과 시

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "details": {
      "limit": 1000,
      "resetAt": "2025-01-16T11:00:00Z"
    }
  }
}
```

---

## 📚 SDK (선택사항)

### JavaScript/TypeScript

```bash
npm install koodtx-sdk
```

```javascript
import { KooDTX } from 'koodtx-sdk';

const client = new KooDTX({
  apiKey: 'your_api_key_here',
});

// Get all sessions
const sessions = await client.sessions.getAll();

// Get sensor data
const data = await client.sessions.getSensorData('session_123', 'accelerometer');
```

### Python

```bash
pip install koodtx
```

```python
from koodtx import KooDTX

client = KooDTX(api_key='your_api_key_here')

# Get all sessions
sessions = client.sessions.get_all()

# Get sensor data
data = client.sessions.get_sensor_data('session_123', 'accelerometer')
```

---

## 🔒 보안 권장 사항

1. **API 키 보호**
   - API 키를 코드에 하드코딩하지 마세요
   - 환경 변수 또는 비밀 관리 도구 사용

2. **HTTPS 사용**
   - 모든 요청은 HTTPS를 통해서만 가능합니다

3. **최소 권한 원칙**
   - 필요한 권한만 부여된 API 키 사용

4. **키 순환**
   - 정기적으로 API 키 갱신

---

## 📞 지원

- **이메일**: api-support@koodtx.com
- **문서**: https://docs.koodtx.com/api
- **상태 페이지**: https://status.koodtx.com

---

**마지막 업데이트**: 2025-01-16
**API 버전**: v1.0.0
**작성자**: KooDTX Team
