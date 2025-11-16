# Monthly Update Process

**월간 업데이트 프로세스** | Monthly Release Cycle

이 문서는 KooDTX 앱의 정기 월간 업데이트 프로세스를 설명합니다.

---

## 📅 업데이트 주기

**기본 원칙:**
- **정기 업데이트**: 매월 1회 (월말 출시)
- **Hotfix**: 필요 시 수시 (Critical 버그)
- **예측 가능성**: 사용자가 언제 업데이트가 나올지 예상 가능

**월간 스케줄 예시:**

```
Week 1 (1-7일):   계획 및 개발 시작
Week 2 (8-14일):  개발 계속
Week 3 (15-21일): 개발 완료, 테스트 시작
Week 4 (22-28일): 테스트 완료, 출시 및 모니터링
```

---

## 🔄 업데이트 워크플로우

### Week 1: 계획 (Planning)

#### Day 1-2: 피드백 리뷰 및 우선순위 결정

**작업:**
1. 지난 달 피드백 전체 리뷰
   - Play 리뷰
   - 이메일
   - 앱 내 피드백
   - GitHub Issues

2. 데이터 분석
   - Sentry 크래시 통계
   - Firebase Analytics 사용 패턴
   - Play Console Android vitals

3. 우선순위 결정
   - `docs/FEATURE_PRIORITIZATION.md` 프레임워크 사용
   - Impact vs Effort Matrix로 평가
   - Critical/High 우선순위 기능 선택

**산출물:**
```markdown
# v0.X.0 - [Month] 업데이트 계획

## 목표
[이번 업데이트의 주요 목표 1-2문장]

## 포함 기능
### Critical (즉시 처리)
- [ ] #XX: [기능명] - [예상 시간]

### High (이번 업데이트)
- [ ] #XX: [기능명] - [예상 시간]

### Medium (여유 있으면)
- [ ] #XX: [기능명] - [예상 시간]

## 제외 기능 (다음 업데이트로 연기)
- #XX: [기능명] - [연기 사유]

## 예상 일정
- Week 1: 계획 완료
- Week 2: 개발
- Week 3: 테스트
- Week 4: 출시

## 예상 배포일
[YYYY-MM-DD]
```

#### Day 3-4: 버전 번호 결정 및 Milestone 생성

**Semantic Versioning:**

```
MAJOR.MINOR.PATCH

예시:
- v0.1.0 → v0.2.0 (새로운 기능 추가)
- v0.2.0 → v0.2.1 (버그 수정만)
- v0.2.1 → v1.0.0 (메이저 변경, 첫 공식 릴리스)
```

**규칙:**
- **MAJOR**: 호환성 깨지는 변경
- **MINOR**: 새로운 기능 추가 (하위 호환)
- **PATCH**: 버그 수정 (하위 호환)

**현재 단계 (v0.X.X):**
- 0.X.X: 초기 개발 단계
- 매월 MINOR 버전 증가 (0.1.0 → 0.2.0 → 0.3.0)
- Hotfix만 PATCH 증가 (0.2.0 → 0.2.1)

**GitHub Milestone 생성:**
1. GitHub > Issues > Milestones > New milestone
2. Title: `v0.X.0`
3. Due date: [배포 예정일]
4. Description: [업데이트 목표]

#### Day 5-7: 개발 시작 준비

**작업:**
1. Git 브랜치 생성
   ```bash
   git checkout main
   git pull origin main
   git checkout -b release/v0.X.0
   ```

2. 버전 번호 업데이트
   - `package.json`: `"version": "0.X.0"`
   - `android/app/build.gradle`:
     ```gradle
     versionCode X  // 이전 versionCode + 1
     versionName "0.X.0"
     ```

3. GitHub Issues 할당
   - 이번 업데이트에 포함할 이슈에 Milestone 할당
   - Assignee 지정
   - Status를 `in-progress`로 변경

---

### Week 2-3: 개발 & 테스트

#### Week 2 (Day 8-14): 개발

**작업:**
1. 계획된 기능 개발
2. 코드 리뷰 (팀이 있는 경우)
3. 단위 테스트 작성
4. 일일 진행 상황 체크

**진행 상황 트래킹:**
- GitHub Issues에서 완료된 이슈 닫기
- Milestone 진행률 확인

#### Week 3 (Day 15-21): 테스트

**테스트 체크리스트:**

1. **기능 테스트** (2-3일)
   - [ ] 새로운 기능 동작 확인
   - [ ] 기존 기능 Regression 테스트
   - [ ] Edge case 테스트

2. **기기 테스트** (1-2일)
   - [ ] 최소 3개 이상 기기에서 테스트
     - 삼성 (Galaxy S 시리즈)
     - 구글 (Pixel)
     - 샤오미/화웨이 등
   - [ ] 다양한 Android 버전 (29-34)

3. **성능 테스트** (0.5-1일)
   - [ ] 앱 시작 시간
   - [ ] 메모리 사용량
   - [ ] 배터리 소모
   - [ ] 크래시 없음

4. **빌드 테스트** (0.5일)
   - [ ] AAB 빌드 성공
   - [ ] ProGuard 적용 확인
   - [ ] APK 크기 확인

**버그 발견 시:**
- Minor 버그: 수정 후 계속
- Major 버그: 우선순위 재조정, 일정 조정 고려

---

### Week 4: 출시 및 모니터링

#### Day 22-24: 최종 준비

**작업:**

1. **CHANGELOG 업데이트**
   ```markdown
   # Changelog

   ## [0.X.0] - YYYY-MM-DD

   ### Added
   - 새로운 기능 1
   - 새로운 기능 2

   ### Changed
   - 변경된 기능 1

   ### Fixed
   - 수정된 버그 1
   - 수정된 버그 2

   ### Known Issues
   - (있는 경우) 알려진 문제
   ```

2. **출시 노트 작성** (한국어 + 영어)

   **한국어:**
   ```
   버전 0.X.0 - [Month] 업데이트

   [새로운 기능]
   - 기능 1: 설명
   - 기능 2: 설명

   [개선]
   - 개선 1: 설명

   [수정]
   - 버그 1 수정
   - 버그 2 수정

   항상 이용해 주셔서 감사합니다!
   ```

   **영어:**
   ```
   Version 0.X.0 - [Month] Update

   [New Features]
   - Feature 1: Description
   - Feature 2: Description

   [Improvements]
   - Improvement 1: Description

   [Bug Fixes]
   - Fixed bug 1
   - Fixed bug 2

   Thank you for using KooDTX!
   ```

3. **프로덕션 빌드 생성**
   ```bash
   cd android
   ./gradlew clean bundleRelease
   ```

4. **최종 체크리스트** (`docs/RELEASE_CHECKLIST.md` 참고)
   - [ ] 버전 번호 정확한지 확인
   - [ ] CHANGELOG 업데이트
   - [ ] 출시 노트 작성 완료
   - [ ] AAB 빌드 성공
   - [ ] 실제 기기에서 테스트 완료
   - [ ] Git 커밋 및 태그

#### Day 25: Play Console 제출

**작업:**

1. **Play Console 업로드**
   - https://play.google.com/console
   - 프로덕션 > 새 버전 만들기
   - AAB 업로드

2. **출시 노트 입력**
   - 한국어 출시 노트 붙여넣기
   - 영어 출시 노트 붙여넣기

3. **단계적 출시 설정** (권장)
   - 초기 출시 비율: 5% 또는 10%
   - 24시간 모니터링 후 점진적 확대

4. **검토 제출**
   - "프로덕션으로 출시" 클릭
   - "검토 제출" 클릭

**검토 시간:**
- 일반적으로 1-3일 소요
- 금요일 제출은 피하기 (주말 지연 가능)

#### Day 26-28: 모니터링 및 후속 조치

**1일차 (출시 직후):**
- [ ] Play Console에서 출시 상태 확인
- [ ] Sentry 크래시 모니터링 (1시간마다)
- [ ] Play Console Android vitals 확인
- [ ] 초기 리뷰 모니터링

**문제 발견 시:**
- Critical 크래시 > 5%: 즉시 롤백 고려 (docs/ROLLBACK_GUIDE.md)
- Critical 크래시 1-5%: Hotfix 준비
- Minor 문제: 다음 업데이트에 수정

**2-3일차:**
- [ ] 배포 비율 확대 (10% → 50% → 100%)
- [ ] 주간 모니터링 (하루 1-2회)
- [ ] 사용자 피드백 수집
- [ ] 1-2점 리뷰에 답변

**1주일 후:**
- [ ] 최종 평가
- [ ] 크래시율 < 1% 확인
- [ ] 사용자 만족도 확인 (평점, 리뷰)
- [ ] 회고 (Retrospective)

---

## 📊 회고 (Retrospective)

**목적:**
- 이번 업데이트에서 배운 점
- 다음 업데이트 개선 방향

**회고 템플릿:**

```markdown
# v0.X.0 Retrospective

## 📈 성과
- 출시일: [YYYY-MM-DD]
- 계획 대비 일정: [On-time / +X days delayed]
- 포함 기능: X개 (계획 대비 100%)
- 크래시율: X.X% (목표: < 1%)
- 평점: ★X.X (이전 버전: ★X.X)

## ✅ 잘된 점 (What went well)
- [항목 1]
- [항목 2]

## ❌ 개선 필요 (What didn't go well)
- [항목 1]
- [항목 2]

## 💡 배운 점 (Lessons learned)
- [항목 1]
- [항목 2]

## 📋 다음 업데이트 개선 사항 (Action items)
- [ ] [개선 사항 1]
- [ ] [개선 사항 2]
```

---

## 🚀 업데이트 홍보 (선택사항)

**목적:**
- 사용자에게 새로운 기능 알림
- 업데이트 설치 독려

**채널:**

1. **Play Store 출시 노트**
   - 이미 작성 완료

2. **이메일 (사용자 이메일 수집 시)**
   - 제목: `KooDTX v0.X.0 업데이트 안내`
   - 내용: 주요 기능 소개

3. **소셜 미디어** (있는 경우)
   - Twitter, Facebook 등

4. **앱 내 공지** (선택사항)
   - "What's New" 화면

---

## ✅ 월간 업데이트 체크리스트

### Week 1: 계획
- [ ] 피드백 리뷰 완료
- [ ] 데이터 분석 (Sentry, Analytics, Play Console)
- [ ] 우선순위 결정 (Impact vs Effort)
- [ ] 업데이트 계획 문서 작성
- [ ] 버전 번호 결정
- [ ] GitHub Milestone 생성
- [ ] Git 브랜치 생성 (`release/v0.X.0`)
- [ ] 버전 번호 업데이트 (package.json, build.gradle)

### Week 2: 개발
- [ ] 계획된 기능 개발
- [ ] 코드 리뷰
- [ ] 단위 테스트 작성
- [ ] 일일 진행 상황 체크

### Week 3: 테스트
- [ ] 기능 테스트 (새 기능 + Regression)
- [ ] 기기 테스트 (최소 3개 기기)
- [ ] 성능 테스트 (메모리, 배터리)
- [ ] 빌드 테스트 (AAB 생성)

### Week 4: 출시
- [ ] CHANGELOG 업데이트
- [ ] 출시 노트 작성 (한국어 + 영어)
- [ ] 프로덕션 빌드 생성
- [ ] 최종 체크리스트 확인 (docs/RELEASE_CHECKLIST.md)
- [ ] Play Console 업로드
- [ ] 단계적 출시 설정 (5-10%)
- [ ] 검토 제출
- [ ] 출시 후 모니터링 (Sentry, Play Console)
- [ ] 사용자 피드백 수집
- [ ] 배포 비율 확대 (10% → 50% → 100%)
- [ ] 회고 작성

---

## 📅 연간 로드맵 예시

```markdown
# KooDTX 2025 Roadmap

## Q1 (1-3월)
- v0.1.0 (1월): 초기 출시
- v0.2.0 (2월): GPS 정확도 개선, 센서 추가
- v0.3.0 (3월): UI/UX 개선, 배터리 최적화

## Q2 (4-6월)
- v0.4.0 (4월): 클라우드 동기화 개선
- v0.5.0 (5월): Analytics 통합, 피드백 시스템
- v0.6.0 (6월): 성능 개선, 안정화

## Q3 (7-9월)
- v0.7.0 (7월): 새로운 센서 지원
- v0.8.0 (8월): 내보내기 포맷 추가
- v0.9.0 (9월): 최종 안정화

## Q4 (10-12월)
- v1.0.0 (10월): 첫 공식 릴리스
- v1.1.0 (11월): 피드백 반영
- v1.2.0 (12월): 연말 업데이트
```

---

## 📚 관련 문서

- `docs/RELEASE_CHECKLIST.md`: 릴리스 체크리스트
- `docs/FEATURE_PRIORITIZATION.md`: 기능 우선순위화
- `docs/FEEDBACK_PROCESS.md`: 피드백 프로세스
- `docs/HOTFIX_PROCESS.md`: 긴급 패치 프로세스
- `docs/ROLLBACK_GUIDE.md`: 롤백 가이드
- `CHANGELOG.md`: 변경 이력

---

**마지막 업데이트**: 2025-01-16
**작성자**: KooDTX Team
**버전**: 1.0.0
