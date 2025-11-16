# Monitoring Dashboard Setup Guide

**모니터링 대시보드 설정 가이드**

이 문서는 KooDTX 앱의 모니터링 도구(Sentry, Google Play Console)를 설정하는 방법을 설명합니다.

---

## 📊 1. Sentry 설정

### 1.1 Sentry 프로젝트 생성

1. **Sentry 계정 생성** (무료 티어 사용 가능)
   - https://sentry.io/signup/ 접속
   - 이메일 또는 GitHub 계정으로 가입

2. **Organization 생성**
   - Organization 이름: `KooDTX` (또는 원하는 이름)

3. **프로젝트 생성**
   - Platform 선택: **React Native**
   - Project 이름: `koodtx-android`

### 1.2 Sentry SDK 연동 (이미 완료됨)

KooDTX는 이미 Sentry가 통합되어 있습니다. 환경변수만 설정하면 됩니다.

**`.env.production` 파일 확인:**
```bash
# Sentry Configuration
SENTRY_DSN=https://[YOUR_KEY]@[YOUR_ORG_ID].ingest.sentry.io/[PROJECT_ID]
ENABLE_SENTRY=true
```

**Sentry DSN 찾는 방법:**
1. Sentry 프로젝트 > Settings > Client Keys (DSN)
2. DSN 복사하여 `.env.production`에 붙여넣기

### 1.3 Sentry 알림 설정

#### 이메일 알림 설정

1. **Sentry 프로젝트 > Settings > Alerts > New Alert Rule**

2. **Alert Rule 1: 신규 크래시 즉시 알림**
```yaml
Name: New Crash Alert
When: A new issue is created
If: All events
Then: Send a notification via Email
To: your-email@example.com
```

3. **Alert Rule 2: 크래시 빈도 급증**
```yaml
Name: High Crash Rate Alert
When: An issue changes state
If:
  - Event count is more than 10 in 1 hour
  - OR affected users is more than 5% of total users
Then: Send a notification via Email, Slack
To: your-email@example.com, #alerts channel
```

4. **Alert Rule 3: 심각도 높은 이슈**
```yaml
Name: Critical Issue Alert
When: An issue is first seen
If: Level is equal to fatal or error
Then: Send a notification via Email, Slack
To: your-email@example.com, #critical channel
```

#### Slack 통합 (선택사항)

1. **Sentry > Organization Settings > Integrations > Slack**
2. **Install Slack Integration** 클릭
3. Slack workspace에서 권한 승인
4. Alert Rule에서 Slack 채널 선택 (#alerts, #critical 등)

### 1.4 Sentry Issue 관리

#### Issue 우선순위 설정

1. **프로젝트 > Issues 탭**
2. 각 Issue 클릭 → 우선순위 설정
   - **Critical**: 앱 크래시, 데이터 손실
   - **High**: 핵심 기능 오류
   - **Medium**: 부분적 기능 오류
   - **Low**: UI 버그, 경고

#### Issue 할당 및 추적

1. Issue 우클릭 → **Assign to** → 담당자 지정
2. **Link to GitHub Issue** 클릭 → GitHub 이슈 생성/연결
3. 상태 변경:
   - **Unresolved**: 미해결
   - **Resolved**: 해결됨 (다음 릴리스에서 수정)
   - **Ignored**: 무시 (false positive 등)

---

## 🛍️ 2. Google Play Console 설정

### 2.1 Android vitals 모니터링 설정

1. **Play Console > 앱 선택 > 품질 > Android vitals**

2. **알림 설정**
   - **설정** (톱니바퀴 아이콘) 클릭
   - **이메일 알림 받기** 체크
   - 임계값 설정:
     - ANR 비율: **0.5%** 이상
     - 크래시 비율: **1.0%** 이상
     - 배터리 사용량: **상위 1%** 이상

3. **주요 지표 모니터링**
   - **ANR 비율**: 앱이 5초 이상 응답하지 않는 비율
   - **크래시 비율**: 앱 크래시 비율
   - **과도한 깨어 있음**: 배터리 과다 사용
   - **렌더링 시간**: UI 렌더링 지연

### 2.2 통계 및 보고서 설정

1. **Play Console > 통계 > 개요**
2. **커스텀 대시보드 생성**
   - 위젯 추가:
     - 설치 수 (일별, 주별)
     - 제거 수
     - 활성 사용자 수 (DAU, WAU)
     - 평점 및 리뷰
     - 충돌 및 ANR

3. **자동 리포트 설정**
   - **Play Console > 설정 > 이메일 기본 설정**
   - **통계 리포트** 체크
   - 빈도: **주간** 또는 **월간**

### 2.3 리뷰 알림 설정

1. **Play Console > 앱 > 평점 및 리뷰**
2. **알림 설정** 클릭
3. **새 리뷰 알림 받기** 활성화
4. **1-2점 리뷰 우선 알림** 권장

---

## 📈 3. Firebase Analytics 설정 (Phase 248)

Phase 248에서 Firebase Analytics를 추가한 후 설정합니다.

### 3.1 Firebase 프로젝트 생성

1. https://console.firebase.google.com/ 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름: `KooDTX`
4. Google Analytics 활성화

### 3.2 Android 앱 추가

1. **프로젝트 개요 > 앱 추가 > Android**
2. Android 패키지 이름: `com.koodtx.app`
3. `google-services.json` 다운로드
4. 파일을 `android/app/` 폴더에 저장

### 3.3 Analytics 대시보드 설정

1. **Firebase Console > Analytics > Dashboard**
2. **커스텀 리포트 생성**
   - Recording funnel (녹음 시작 → 완료 → 내보내기)
   - Sync success rate
   - 사용자 retention (D1, D7, D30)

3. **Audience 생성** (사용자 세그먼트)
   - Active users (지난 7일 내 녹음)
   - Power users (10회 이상 녹음)
   - At-risk users (30일 미접속)

---

## 🔔 4. 통합 알림 설정

### 4.1 알림 우선순위

| 도구 | 알림 유형 | 긴급도 | 전달 방법 |
|------|----------|--------|---------|
| Sentry | Critical crash (>5% users) | 🔴 Critical | Email + Slack |
| Sentry | New crash | 🟡 High | Email |
| Play Console | ANR > 0.5% | 🟡 High | Email |
| Play Console | 1-2점 리뷰 | 🟢 Medium | Email |
| Firebase | Retention < 30% | 🟢 Low | Weekly report |

### 4.2 Slack 채널 구조 (선택사항)

팀 협업 시 Slack 채널을 다음과 같이 구성하면 효율적입니다:

```
#koodtx-alerts        → Sentry 크래시 알림 (Critical, High만)
#koodtx-reviews       → Play Console 리뷰 알림
#koodtx-weekly-stats  → 주간 통계 리포트
#koodtx-general       → 일반 논의
```

---

## 📊 5. 대시보드 예시 레이아웃

### 5.1 Sentry Dashboard

**메인 뷰 설정:**
1. **Issues** 탭 → 필터 설정
   - Status: **Unresolved**
   - Priority: **Critical, High**
   - 정렬: **First Seen** (최신순)

2. **Discover** 탭 → 커스텀 쿼리 저장
```sql
-- 예시 쿼리: 최근 24시간 크래시 TOP 5
event.type:error
timestamp:>= -24h
ORDER BY count() DESC
LIMIT 5
```

3. **Releases** 탭
   - 각 버전별 크래시 비교
   - Regression 탐지 (이전 버전 대비 크래시 증가)

### 5.2 Google Play Console Dashboard

**커스텀 위젯 레이아웃:**

```
┌─────────────────────────────────────┐
│ 🚀 신규 설치 (지난 7일)             │
│    150 설치 (+20% vs 이전 주)       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⭐ 평점 및 리뷰                     │
│    ★ 4.2 (리뷰 12개)               │
│    - 5점: 8개                       │
│    - 1-2점: 1개 (답변 필요)         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🐛 크래시 및 ANR                    │
│    - 크래시율: 0.3% (정상)          │
│    - ANR 비율: 0.2% (정상)          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 👥 활성 사용자 (MAU)                │
│    120명 (지난 30일)                │
└─────────────────────────────────────┘
```

### 5.3 Firebase Analytics Dashboard (Phase 248 이후)

**주요 이벤트 대시보드:**

```
┌─────────────────────────────────────┐
│ 📊 핵심 이벤트 (지난 7일)           │
│    - recording_started: 450회       │
│    - recording_completed: 420회     │
│    - export_success: 380회          │
│    - sync_completed: 350회          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🎯 Funnel Analysis                  │
│    녹음 시작 → 완료 → 내보내기     │
│    100% → 93% → 84%                 │
│    (이탈률: 16%)                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔁 Retention                        │
│    - D1: 65%                        │
│    - D7: 45%                        │
│    - D30: 28%                       │
└─────────────────────────────────────┘
```

---

## 🛠️ 6. 트러블슈팅

### 6.1 Sentry에 크래시가 기록되지 않는 경우

**확인 사항:**
1. `.env.production`에 `SENTRY_DSN` 설정되어 있는지 확인
2. `ENABLE_SENTRY=true` 설정 확인
3. 프로덕션 빌드로 테스트했는지 확인 (개발 빌드는 Sentry 비활성화됨)
4. Sentry SDK 초기화 코드 확인 (`src/config/sentry.ts`)

**테스트 방법:**
```typescript
// App.tsx에서 테스트 크래시 트리거
import { Button } from 'react-native';
import * as Sentry from '@sentry/react-native';

<Button
  title="Test Crash"
  onPress={() => {
    Sentry.captureException(new Error('Test crash'));
  }}
/>
```

### 6.2 Play Console에 통계가 나타나지 않는 경우

**확인 사항:**
1. 앱이 **프로덕션** 트랙에 출시되었는지 확인 (내부 테스트는 제외)
2. 최소 1-2일 대기 (Play Console 데이터는 24-48시간 지연)
3. 사용자가 **Google Play Services**가 설치된 기기를 사용하는지 확인

### 6.3 Firebase Analytics 이벤트가 수집되지 않는 경우

**확인 사항:**
1. `google-services.json` 파일이 `android/app/` 폴더에 있는지 확인
2. `android/build.gradle`에 `classpath 'com.google.gms:google-services:4.x.x'` 추가되어 있는지 확인
3. `android/app/build.gradle`에 `apply plugin: 'com.google.gms.google-services'` 추가되어 있는지 확인
4. Firebase Console > DebugView에서 실시간 이벤트 확인 (개발 모드)

**디버그 모드 활성화:**
```bash
adb shell setprop debug.firebase.analytics.app com.koodtx.app
```

---

## ✅ 설정 완료 체크리스트

### Sentry
- [ ] Sentry 계정 및 프로젝트 생성
- [ ] `.env.production`에 `SENTRY_DSN` 설정
- [ ] 이메일 알림 설정 (신규 크래시, 빈도 급증)
- [ ] Slack 통합 (선택사항)
- [ ] 테스트 크래시 전송 확인

### Google Play Console
- [ ] Android vitals 알림 설정 (ANR, 크래시)
- [ ] 리뷰 알림 설정
- [ ] 커스텀 대시보드 생성
- [ ] 주간 리포트 이메일 설정

### Firebase Analytics (Phase 248 이후)
- [ ] Firebase 프로젝트 생성
- [ ] `google-services.json` 다운로드 및 추가
- [ ] Analytics SDK 연동
- [ ] 커스텀 리포트 생성 (Funnel, Retention)
- [ ] Audience 세그먼트 생성

---

## 📚 관련 문서

- `docs/DAILY_MONITORING_CHECKLIST.md`: 일일 모니터링 체크리스트
- `docs/HOTFIX_PROCESS.md`: 긴급 패치 프로세스
- `docs/PHASE_245_250_OPERATIONS.md`: 전체 운영 가이드
- `docs/ANALYTICS_EVENTS.md`: Analytics 이벤트 정의 (Phase 248)

---

**마지막 업데이트**: 2025-01-16
**작성자**: KooDTX Team
**버전**: 1.0.0
