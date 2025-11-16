# Feature Prioritization Guide

**기능 우선순위화 가이드** | Feature Priority Framework

이 문서는 KooDTX 앱의 새로운 기능과 개선 사항의 우선순위를 결정하는 프레임워크를 설명합니다.

---

## 📊 우선순위화 프레임워크

### Impact vs Effort Matrix

모든 기능/개선 사항은 **Impact (영향도)**와 **Effort (개발 공수)**의 두 축으로 평가합니다.

```
      High Impact
           ↑
    ┌──────┼──────┐
    │  2   │  1   │
High│      │      │Low
Effort     │      Effort
    │  3   │  4   │
    └──────┼──────┘
           ↓
      Low Impact
```

**Quadrant 분류:**

1. **High Impact, Low Effort** 🟢 (Quick Wins)
   - 우선순위: **최상**
   - 즉시 개발 시작
   - 예시: 버그 수정, 간단한 UI 개선, 설정 추가

2. **High Impact, High Effort** 🟡 (Major Projects)
   - 우선순위: **높음**
   - 계획 후 순차 개발
   - 예시: 새로운 센서 추가, 클라우드 동기화 개선

3. **Low Impact, High Effort** 🔴 (Avoid)
   - 우선순위: **최하**
   - 개발하지 않음 또는 후순위
   - 예시: 사용률 낮은 복잡한 기능

4. **Low Impact, Low Effort** 🟠 (Fill-Ins)
   - 우선순위: **중간**
   - 여유 시간에 개발
   - 예시: 마이너 UI 개선, 로그 추가

---

## 🎯 Impact 평가 기준

### High Impact (3점)

다음 중 **2개 이상**에 해당하면 High Impact:

- [ ] **사용자 만족도 크게 향상**: 사용자가 명확히 요청한 기능
- [ ] **핵심 기능 개선**: 녹음, 내보내기, 동기화 등 핵심 기능 개선
- [ ] **많은 사용자 영향**: 50% 이상 사용자가 사용할 기능
- [ ] **크래시/버그 수정**: Critical 또는 High 우선순위 버그
- [ ] **비즈니스 목표 달성**: 사용자 유지율, 만족도 증가

**예시:**
- GPS 정확도 개선 → 모든 사용자 영향, 핵심 기능
- 크래시 수정 → 사용자 만족도, 안정성

### Medium Impact (2점)

다음 중 **1-2개**에 해당:

- [ ] 일부 사용자에게 유용 (20-50% 사용자)
- [ ] 사용성 개선
- [ ] Medium 우선순위 버그 수정

**예시:**
- 센서 설정 UI 개선 → 일부 사용자, 사용성
- 로그 기능 추가 → 디버깅 개선

### Low Impact (1점)

다음에 해당:

- [ ] 소수 사용자만 사용 (< 20%)
- [ ] 마이너한 개선
- [ ] Nice-to-have 기능

**예시:**
- 테마 색상 변경 → 소수 사용자 선호
- 특정 연구 목적 전용 기능

---

## ⏱️ Effort 평가 기준

### High Effort (3점)

다음 중 **2개 이상**에 해당하면 High Effort:

- [ ] **개발 시간 > 3일**: 설계, 개발, 테스트 포함
- [ ] **복잡한 아키텍처 변경**: 데이터베이스 스키마, 핵심 로직 변경
- [ ] **외부 의존성**: 새로운 라이브러리, API 통합 필요
- [ ] **높은 테스트 부담**: 다양한 기기, OS 버전 테스트 필요
- [ ] **문서화 부담**: 새로운 API, 사용법 문서 작성

**예시:**
- 새로운 센서 추가 (예: LiDAR) → 복잡한 통합, 테스트
- 클라우드 동기화 완전 재설계 → 아키텍처 변경

### Medium Effort (2점)

- [ ] 개발 시간 1-3일
- [ ] 기존 코드 수정
- [ ] 중간 난이도 테스트

**예시:**
- CSV 내보내기 포맷 개선 → 기존 코드 수정
- 설정 화면 UI 개선 → 중간 난이도

### Low Effort (1점)

- [ ] 개발 시간 < 1일
- [ ] 간단한 코드 변경
- [ ] 최소 테스트

**예시:**
- 설정 항목 추가 → 간단한 코드 변경
- 문구 수정 → 최소 테스트

---

## 📋 우선순위 결정 프로세스

### 1단계: 기능 수집

**출처:**
- 사용자 피드백 (Play 리뷰, 이메일, 앱 내 피드백)
- GitHub Issues (feature requests)
- 팀 아이디어
- 데이터 분석 (Analytics, Sentry)

**기록 위치:**
- GitHub Issues (label: `enhancement`)
- 또는 별도 스프레드시트

### 2단계: Impact & Effort 평가

각 기능에 대해 Impact와 Effort를 평가합니다.

**평가 템플릿:**

```markdown
## Feature: [기능명]

### Description
[기능 설명]

### Impact Assessment
- [ ] 사용자 만족도 향상?
- [ ] 핵심 기능 개선?
- [ ] 많은 사용자 영향? (예상 %)
- [ ] 크래시/버그 수정?
- [ ] 비즈니스 목표 달성?

**Impact Score**: [1-3]

### Effort Assessment
- 예상 개발 시간: [X일]
- 복잡도: [Low/Medium/High]
- 외부 의존성: [Yes/No]
- 테스트 부담: [Low/Medium/High]

**Effort Score**: [1-3]

### Priority
**Quadrant**: [1-4]
**Priority**: [Critical / High / Medium / Low]
```

### 3단계: 우선순위 정렬

**우선순위 순서:**

1. **Critical** (Quadrant 1: High Impact, Low Effort)
   - 즉시 개발 시작
   - 다음 정기 업데이트 또는 Hotfix

2. **High** (Quadrant 2: High Impact, High Effort)
   - 2-4주 내 개발 시작
   - 계획 수립 후 개발

3. **Medium** (Quadrant 4: Low Impact, Low Effort)
   - 여유 시간에 개발
   - 또는 다음 분기

4. **Low** (Quadrant 3: Low Impact, High Effort)
   - 개발하지 않음
   - 또는 장기 백로그

### 4단계: 로드맵 작성

**월간 업데이트 계획:**

```markdown
# v0.2.0 - 2025년 2월 업데이트

## 목표
사용자 피드백 반영 및 안정성 개선

## 포함 기능
### Critical (Quadrant 1)
- [ ] GPS 정확도 개선 (#12) - 3일
- [ ] Export CSV 포맷 버그 수정 (#15) - 0.5일

### High (Quadrant 2)
- [ ] 자기계 센서 추가 (#20) - 5일

### Medium (Quadrant 4)
- [ ] 설정 화면 UI 개선 (#25) - 1일

## 일정
- Week 1: #12, #15 완료
- Week 2-3: #20 개발
- Week 4: #25 개발, 테스트, 출시

## 예상 배포일
2025-02-28
```

---

## 📊 우선순위화 예시

### 예시 1: GPS 정확도 개선

**Description:**
- GPS 정확도를 5-10m로 개선 (현재 20-50m)

**Impact Assessment:**
- ✅ 사용자 만족도 향상 (Play 리뷰 다수 요청)
- ✅ 핵심 기능 개선 (GPS는 필수 기능)
- ✅ 모든 사용자 영향 (100%)
- ❌ 크래시/버그 아님
- ✅ 비즈니스 목표 (사용자 만족도 증가)

**Impact Score: 3 (High)**

**Effort Assessment:**
- 예상 개발 시간: 3일
- 복잡도: Medium (GPS API 설정 변경)
- 외부 의존성: No
- 테스트 부담: Medium (다양한 기기 테스트)

**Effort Score: 2 (Medium)**

**Priority: High (Quadrant 2)**
→ 다음 정기 업데이트에 포함

---

### 예시 2: 다크 모드 추가

**Description:**
- 앱 전체에 다크 모드 테마 추가

**Impact Assessment:**
- ✅ 일부 사용자 만족도 향상 (약 30% 사용자)
- ❌ 핵심 기능 아님
- ❌ 일부만 사용 (30%)
- ❌ 크래시/버그 아님
- ❌ 비즈니스 목표 영향 낮음

**Impact Score: 1 (Low)**

**Effort Assessment:**
- 예상 개발 시간: 5일
- 복잡도: High (모든 화면 수정 필요)
- 외부 의존성: No
- 테스트 부담: High (모든 화면 테스트)

**Effort Score: 3 (High)**

**Priority: Low (Quadrant 3)**
→ 개발하지 않음 또는 장기 백로그

---

### 예시 3: 로그 내보내기 추가

**Description:**
- 디버깅을 위한 로그 파일 내보내기 기능

**Impact Assessment:**
- ❌ 소수 사용자만 사용 (5% 미만)
- ✅ 디버깅 개선 (팀에게 유용)
- ❌ 소수만 영향
- ❌ 크래시/버그 아님
- ❌ 비즈니스 목표 영향 낮음

**Impact Score: 1 (Low)**

**Effort Assessment:**
- 예상 개발 시간: 0.5일
- 복잡도: Low (간단한 파일 내보내기)
- 외부 의존성: No
- 테스트 부담: Low

**Effort Score: 1 (Low)**

**Priority: Medium (Quadrant 4)**
→ 여유 시간에 개발

---

## ✅ 우선순위화 체크리스트

### 기능 수집 단계
- [ ] 사용자 피드백 검토 (Play 리뷰, 이메일)
- [ ] GitHub Issues 검토
- [ ] 팀 아이디어 수집
- [ ] Analytics 데이터 분석

### 평가 단계
- [ ] 각 기능의 Impact Score 계산 (1-3)
- [ ] 각 기능의 Effort Score 계산 (1-3)
- [ ] Quadrant 분류 (1-4)
- [ ] Priority 할당 (Critical/High/Medium/Low)

### 계획 단계
- [ ] Critical 기능 즉시 개발 시작
- [ ] High 기능 다음 업데이트 계획
- [ ] Medium 기능 여유 시간 할당
- [ ] Low 기능 백로그 또는 거절

### 문서화
- [ ] GitHub Issues에 Priority 라벨 추가
- [ ] 로드맵 문서 업데이트
- [ ] 다음 릴리스 계획 작성

---

## 📚 관련 문서

- `docs/FEEDBACK_PROCESS.md`: 사용자 피드백 수집 프로세스
- `docs/MONTHLY_UPDATE_PROCESS.md`: 월간 업데이트 프로세스
- `docs/RELEASE_CHECKLIST.md`: 릴리스 체크리스트

---

**마지막 업데이트**: 2025-01-16
**작성자**: KooDTX Team
**버전**: 1.0.0
