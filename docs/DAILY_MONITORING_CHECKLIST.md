# Daily Monitoring Checklist

**매일 운영 체크리스트** | Daily Operations Checklist

이 체크리스트는 KooDTX 앱 출시 후 매일 수행해야 할 모니터링 작업을 정리한 문서입니다.

## 📅 Daily Routine (15-20분 소요)

### ⏰ 오전 루틴 (Morning Routine)

#### 1. 크래시 모니터링 (Sentry Dashboard) - 5분

**작업 내용:**
- [ ] Sentry 대시보드 접속: https://sentry.io/organizations/[YOUR_ORG]/issues/
- [ ] 지난 24시간 동안 발생한 새로운 크래시 확인
- [ ] 크래시 빈도 및 영향받은 사용자 수 확인
- [ ] Critical/High priority 이슈 있는지 확인

**알람 기준:**
- 🔴 **즉시 대응**: 크래시율 > 1% 또는 신규 사용자 10% 이상 영향
- 🟡 **주의 관찰**: 크래시율 0.5-1% 또는 특정 기기에서 반복 발생
- 🟢 **정상**: 크래시율 < 0.5%

**기록 방법:**
```markdown
## 2025-01-15 (예시)
- 신규 크래시: 0건
- 기존 크래시: 2건 (해결 중)
- 전체 크래시율: 0.3%
- 상태: 🟢 정상
```

#### 2. Play Console 확인 - 5분

**작업 내용:**
- [ ] [Google Play Console](https://play.google.com/console) 접속
- [ ] **통계 > 개요** 탭 확인
  - [ ] 설치 수 추이
  - [ ] 제거 수 확인 (급증 여부)
  - [ ] 평점 & 리뷰 확인
- [ ] **품질 > Android vitals** 확인
  - [ ] ANR(응답 없음) 비율
  - [ ] 크래시 비율
  - [ ] 배터리 사용량 이상 여부

**알람 기준:**
- 🔴 **즉시 대응**:
  - ANR 비율 > 0.5%
  - 크래시 비율 > 1%
  - 평점 급락 (★4.0 미만)
  - 부정적 리뷰 급증
- 🟡 **주의 관찰**:
  - 설치 대비 제거 비율 > 20%
  - 특정 기기 모델에서 문제 집중

**기록 방법:**
```markdown
## Play Console - 2025-01-15
- 신규 설치: 150건
- 제거: 25건 (16.7%)
- 평점: ★4.2 (리뷰 12개)
- ANR: 0.2%
- 크래시: 0.3%
- 상태: 🟢 정상
```

#### 3. 사용자 피드백 확인 - 3분

**작업 내용:**
- [ ] Play Console 리뷰 확인
  - [ ] 새로운 리뷰 읽기
  - [ ] 별점 1-2점 리뷰 우선 확인
  - [ ] 필요 시 답변 작성
- [ ] 지원 이메일 확인 (`support@koodtx.com`)
  - [ ] 새로운 문의 확인
  - [ ] 긴급 문의 우선 처리

**리뷰 답변 가이드:**
- ⭐ **1-2점**: 24시간 내 답변 (문제 해결 방법 제시 또는 개선 약속)
- ⭐⭐⭐ **3점**: 48시간 내 답변
- ⭐⭐⭐⭐⭐ **4-5점**: 감사 표현 (선택사항)

**답변 템플릿 예시:**
```
안녕하세요, KooDTX 팀입니다.
불편을 드려 죄송합니다.

[구체적인 문제 파악]
말씀하신 [문제]는 [원인] 때문으로 보입니다.

[해결 방법 제시]
다음 방법으로 해결 가능합니다:
1. ...
2. ...

추가 문의사항이 있으시면 support@koodtx.com으로 연락 주세요.
감사합니다.
```

#### 4. 앱 기능 테스트 (Smoke Test) - 2-3분

**작업 내용:**
- [ ] 앱 설치/업데이트 후 최소 1회 테스트
- [ ] 핵심 기능 동작 확인:
  - [ ] 앱 실행
  - [ ] 녹음 시작/중지
  - [ ] 데이터 동기화 (WiFi)
  - [ ] 세션 목록 표시

**문제 발견 시:**
1. Sentry에서 관련 오류 로그 확인
2. 재현 가능 여부 확인
3. Critical 이슈면 hotfix 프로세스 시작 (docs/HOTFIX_PROCESS.md 참고)

---

### 📊 주간 루틴 (Weekly Routine) - 월요일 오전

#### 5. 주간 리포트 작성 (30분)

**작업 내용:**
```markdown
# Weekly Report - Week of [YYYY-MM-DD]

## 📈 핵심 지표
- **총 설치 수**: XXX (전주 대비 +/-X%)
- **활성 사용자**: XXX
- **평균 평점**: ★X.X (리뷰 XX개)
- **크래시율**: X.X%
- **ANR 비율**: X.X%

## 🐛 주요 이슈
1. [이슈 제목]: [상태] - [영향도]
2. ...

## 💬 사용자 피드백 요약
- 긍정적: [요약]
- 부정적: [요약]
- 주요 요청 사항: [요약]

## ✅ 이번 주 완료
- [ ] ...

## 📋 다음 주 계획
- [ ] ...
```

**공유 대상:**
- 팀 내부 공유 (Slack, 이메일 등)
- 필요 시 stakeholder 공유

---

## 🚨 긴급 상황 대응 프로토콜

### Severity Level 정의

**🔴 Critical (즉시 대응 - 2시간 이내)**
- 앱 크래시율 > 5%
- 핵심 기능 완전 불능 (녹음, 동기화 등)
- 데이터 손실 발생
- 보안 취약점 발견

**대응 절차:**
1. Hotfix 프로세스 즉시 시작 (docs/HOTFIX_PROCESS.md)
2. 필요 시 앱 일시 비공개 처리
3. 문제 해결 후 긴급 업데이트 배포
4. 사용자 공지 (Play Console, 이메일 등)

**🟡 High (당일 대응)**
- 크래시율 1-5%
- 특정 기기/OS에서 반복 문제
- 부정적 리뷰 급증

**대응 절차:**
1. 이슈 분석 및 재현
2. 수정 계획 수립
3. 다음 정기 업데이트에 포함 또는 hotfix 고려

**🟢 Medium/Low (주간 대응)**
- 크래시율 < 1%
- 사소한 UI 버그
- 개선 요청

---

## 📝 모니터링 도구 바로가기

### 필수 도구
1. **Sentry**: https://sentry.io/organizations/[YOUR_ORG]/issues/
2. **Google Play Console**: https://play.google.com/console
3. **Gmail (Support)**: support@koodtx.com

### 선택 도구 (Phase 248 이후)
4. **Firebase Analytics**: https://console.firebase.google.com/
5. **Firebase Crashlytics**: (Sentry와 병행 또는 대체)

---

## 📱 모니터링 대시보드 설정

상세 설정 방법은 `docs/MONITORING_DASHBOARD_SETUP.md` 참고.

### Sentry 알림 설정
```yaml
# 예시: Email/Slack 알림 규칙
- Event frequency: > 10 events in 1 hour
- User frequency: > 5% of users affected
- New issue: Immediate notification
```

### Play Console 알림 설정
- **품질 > Android vitals**: 임계값 초과 시 이메일 알림
  - ANR 비율 > 0.5%
  - 크래시 비율 > 1%

---

## 🔄 체크리스트 자동화 (Optional)

시간이 지나면서 모니터링을 자동화하여 효율성을 높일 수 있습니다:

1. **Sentry Webhook → Slack/Discord 알림**
2. **Play Console API → 일일 리포트 자동 생성**
3. **GitHub Actions → 크래시 이슈 자동 생성**

자세한 내용은 추후 Phase 250+ 개선 계획에서 다룹니다.

---

## ✅ 체크리스트 완료 기록

### 예시 템플릿 (Notion, Markdown 파일 등에 기록)

```markdown
# Daily Monitoring Log

## 2025-01-15 (수)
- [x] Sentry 크래시 확인: 0.3% (정상)
- [x] Play Console 확인: 설치 150, 제거 25 (16.7%)
- [x] 리뷰 답변: 2건 답변 완료
- [x] Smoke Test: 정상
- 특이사항: 없음
- 상태: 🟢 정상

## 2025-01-16 (목)
- [x] Sentry 크래시 확인: 1.2% (주의)
  - 이슈: Galaxy S20에서 반복 크래시 발생
  - 조치: 핫픽스 준비 중 (Issue #42)
- [x] Play Console 확인: ANR 0.8% (주의)
- [x] 리뷰 답변: 3건 (1건 크래시 관련)
- [x] Smoke Test: 재현 실패 (Galaxy S23)
- 특이사항: Galaxy S20 특정 버전 문제 확인 중
- 상태: 🟡 주의
```

---

## 📚 관련 문서

- `docs/MONITORING_DASHBOARD_SETUP.md`: 모니터링 도구 세부 설정 방법
- `docs/HOTFIX_PROCESS.md`: 긴급 패치 프로세스
- `docs/USER_SUPPORT_GUIDE.md`: 사용자 지원 가이드
- `docs/PHASE_245_250_OPERATIONS.md`: 전체 운영 가이드

---

**마지막 업데이트**: 2025-01-16
**작성자**: KooDTX Team
**버전**: 1.0.0
