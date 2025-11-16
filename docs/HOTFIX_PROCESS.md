# Hotfix Process Guide

**긴급 패치 프로세스 가이드** | Emergency Hotfix Workflow

이 문서는 KooDTX 앱에서 Critical 버그 발생 시 긴급 패치를 배포하는 프로세스를 설명합니다.

---

## 🚨 Hotfix가 필요한 경우

### Critical 이슈 정의

다음과 같은 경우 Hotfix를 고려합니다:

**🔴 즉시 Hotfix 필요:**
- 앱 크래시율 > 5%
- 핵심 기능 완전 불능 (녹음, 데이터 저장 실패)
- 데이터 손실 또는 손상
- 보안 취약점 발견
- 개인정보 유출 가능성

**🟡 Hotfix 고려 (영향 범위에 따라):**
- 크래시율 1-5%
- 특정 기기/OS 버전에서만 발생하는 크래시
- 동기화 완전 실패
- UI 완전 깨짐

**🟢 정기 업데이트로 충분:**
- 크래시율 < 1%
- 사소한 UI 버그
- 성능 개선
- 새로운 기능 추가

---

## ⏱️ Hotfix 타임라인

**목표: 2-4시간 내 완료**

```
발견 → 분석 → 수정 → 테스트 → 빌드 → 제출 → 배포
  ↓      ↓      ↓      ↓       ↓      ↓      ↓
  0     30분   1시간  1.5시간  2시간  2.5시간 4시간+
```

### 단계별 시간 배분

| 단계 | 목표 시간 | 설명 |
|------|---------|------|
| 1. 문제 확인 및 재현 | 30분 | Sentry 로그 확인, 재현 시도 |
| 2. 수정 코드 작성 | 30분 | 최소한의 변경으로 문제 해결 |
| 3. 테스트 | 30분 | 로컬 테스트 + 실제 기기 테스트 |
| 4. 빌드 및 검증 | 30분 | AAB 생성, ProGuard 확인 |
| 5. Play Console 제출 | 10분 | 긴급 업데이트 제출 |
| 6. 검토 대기 | 1-2시간 | Google 긴급 검토 (expedited review) |
| 7. 배포 확산 | 1-2시간 | 사용자에게 전파 |

**총 소요 시간: 2-4시간** (Google 검토 시간 포함)

---

## 📋 Hotfix 프로세스 (단계별)

### Phase 0: 긴급 상황 선언

1. **팀 알림**
   - Slack/이메일로 팀에 긴급 상황 알림
   - 제목: `[CRITICAL] [문제 요약] - Hotfix 필요`

2. **이슈 확인**
   - Sentry에서 크래시 로그 확인
   - 영향 범위 파악 (몇 % 사용자 영향?)
   - Play Console Android vitals 확인

3. **Hotfix 결정**
   - Critical 이슈인지 확인
   - 정기 업데이트로 대응 가능한지 판단

---

### Phase 1: 코드 수정 (30분)

#### 1-1. Hotfix 브랜치 생성

```bash
# main 브랜치에서 시작
git checkout main
git pull origin main

# hotfix 브랜치 생성 (버전 번호는 PATCH 증가)
# 예: 현재 버전이 v0.1.0이면 v0.1.1로
git checkout -b hotfix/v0.1.1-crash-on-export
```

**브랜치 명명 규칙:**
```
hotfix/v[VERSION]-[SHORT_DESCRIPTION]

예시:
- hotfix/v0.1.1-crash-on-export
- hotfix/v0.1.2-sync-failure
- hotfix/v0.2.1-data-loss
```

#### 1-2. 버전 업데이트

**`android/app/build.gradle` 수정:**

```gradle
android {
    defaultConfig {
        applicationId "com.koodtx.app"
        minSdkVersion 29
        targetSdkVersion 34
        versionCode 2        // 이전 versionCode + 1
        versionName "0.1.1"  // PATCH 버전 증가
    }
}
```

**`package.json` 수정:**

```json
{
  "name": "koodtx",
  "version": "0.1.1"
}
```

#### 1-3. 버그 수정

**원칙:**
- **최소한의 변경만 수행**
- 관련 없는 리팩토링 금지
- 새로운 기능 추가 금지
- 단순하고 명확한 수정

**예시: Export 시 크래시 수정**

```typescript
// src/utils/exportData.ts

// ❌ 문제 코드
export const exportSession = async (sessionId: string) => {
  const session = await database.collections
    .get<Session>('sessions')
    .find(sessionId);

  // session이 null일 때 크래시!
  return session.data.map(d => d.toJSON());
};

// ✅ 수정 코드
export const exportSession = async (sessionId: string) => {
  const session = await database.collections
    .get<Session>('sessions')
    .find(sessionId);

  // Null 체크 추가
  if (!session || !session.data) {
    throw new Error('Session data not found');
  }

  return session.data.map(d => d.toJSON());
};
```

#### 1-4. 커밋

```bash
git add .
git commit -m "hotfix: Fix crash when exporting session with null data

- Add null check for session.data
- Throw error instead of crashing
- Fixes crash affecting 5% of users

Issue: #42"
```

---

### Phase 2: 테스트 (30분)

#### 2-1. 로컬 테스트

```bash
# 개발 빌드로 먼저 테스트
npx react-native run-android
```

**테스트 체크리스트:**
- [ ] 버그가 재현되지 않음
- [ ] 관련 기능 정상 작동
- [ ] 다른 기능에 영향 없음
- [ ] 로그에 오류 없음

#### 2-2. 프로덕션 빌드 테스트

```bash
# 프로덕션 빌드 생성
cd android
./gradlew clean
./gradlew bundleRelease

# APK 설치 (AAB는 직접 설치 불가하므로 APK 생성)
./gradlew assembleRelease
```

**실제 기기에서 테스트:**
```bash
# APK 설치
adb install -r app/build/outputs/apk/release/app-release.apk

# 앱 실행 및 로그 확인
adb logcat | grep "KooDTX"
```

**중요**: 문제가 발생한 기기/OS 버전에서 직접 테스트!

#### 2-3. Regression 테스트

**Smoke Test (5-10분):**
- [ ] 앱 실행
- [ ] 녹음 시작/중지
- [ ] 세션 저장 확인
- [ ] 세션 내보내기 (수정한 부분)
- [ ] 동기화 테스트
- [ ] 앱 종료 및 재시작

---

### Phase 3: 빌드 및 제출 (40분)

#### 3-1. 릴리스 빌드 생성

```bash
cd android

# Clean 빌드
./gradlew clean

# AAB (Android App Bundle) 생성
./gradlew bundleRelease

# 빌드 성공 확인
ls -lh app/build/outputs/bundle/release/
# app-release.aab 파일 확인 (약 15-30MB)
```

#### 3-2. AAB 서명 확인

```bash
# AAB 서명 확인
jarsigner -verify -verbose -certs app/build/outputs/bundle/release/app-release.aab

# 출력 예시:
# jar verified. (서명 성공)
```

#### 3-3. Play Console 업로드

1. **Google Play Console** 접속: https://play.google.com/console

2. **앱 선택** > **프로덕션** > **새 버전 만들기**

3. **AAB 업로드**
   - `app-release.aab` 파일 드래그 앤 드롭

4. **출시 노트 작성** (간결하고 명확하게)

**한국어:**
```
버전 0.1.1 - 긴급 수정

[수정]
- 세션 내보내기 시 발생하던 크래시 수정

사용 중 불편을 드려 죄송합니다.
```

**영어:**
```
Version 0.1.1 - Hotfix

[Fixed]
- Fixed crash when exporting sessions

We apologize for the inconvenience.
```

5. **검토 제출**
   - **"프로덕션으로 출시"** 클릭
   - **"검토 제출"** 클릭

#### 3-4. 긴급 검토 요청 (선택사항)

Play Console에서는 공식적인 "긴급 검토" 옵션이 없지만,
다음 방법으로 우선 검토를 요청할 수 있습니다:

1. **Play Console 지원팀에 문의**
   - https://support.google.com/googleplay/android-developer/contact/publish
   - "앱 게시 및 업데이트" 선택
   - 제목: `[URGENT] Hotfix for critical crash - App ID: com.koodtx.app`
   - 내용:
     ```
     We have submitted a critical hotfix (v0.1.1) for our app.

     Issue: Critical crash affecting 5% of users (crash rate: 5%)
     Impact: App unusable for affected users
     Fix: Simple null check (minimal code change)

     We request expedited review for this emergency update.

     Thank you.
     ```

2. **일반적으로 1-2시간 내 검토 완료** (긴급 요청 시)

---

### Phase 4: Git 작업 완료

#### 4-1. Hotfix 브랜치 병합

```bash
# main 브랜치로 전환
git checkout main

# hotfix 브랜치 병합
git merge hotfix/v0.1.1-crash-on-export

# 태그 생성
git tag -a v0.1.1 -m "Hotfix: Fix crash on export"

# 원격 저장소에 푸시
git push origin main --tags
```

#### 4-2. GitHub Release 생성 (선택사항)

1. **GitHub > Releases > Draft a new release**
2. **Tag**: `v0.1.1`
3. **Title**: `v0.1.1 - Hotfix: Export Crash`
4. **Description**:
   ```markdown
   ## 🐛 Hotfix

   ### Fixed
   - Fixed critical crash when exporting sessions with null data (#42)

   ### Impact
   - Affected users: 5%
   - Severity: Critical
   - Release time: 2 hours

   ### Changes
   - Added null check in `exportSession()` function
   ```

5. **Publish release** 클릭

---

### Phase 5: 모니터링 및 후속 조치 (1-2시간)

#### 5-1. 배포 모니터링

**Play Console 확인:**
1. **프로덕션 > 버전**
   - 출시 상태 확인: "검토 중" → "출시됨"
   - 배포 비율 확인: 점진적으로 증가 (0% → 1% → 10% → 50% → 100%)

**Sentry 모니터링:**
1. **Issues** 탭
   - 기존 크래시가 더 이상 발생하지 않는지 확인
   - 새로운 크래시 발생 여부 확인

#### 5-2. 사용자 알림

**Play Console 리뷰 답변:**
- 크래시 관련 1-2점 리뷰에 답변:
  ```
  불편을 드려 죄송합니다.
  말씀하신 크래시를 수정한 업데이트(v0.1.1)를 출시했습니다.
  Play 스토어에서 업데이트 후 다시 사용해 보세요.
  감사합니다.
  ```

**이메일 알림 (선택사항):**
- 영향받은 사용자에게 이메일 발송 (가능한 경우)
- 제목: `KooDTX 긴급 업데이트 안내 (v0.1.1)`
- 내용:
  ```
  안녕하세요,

  최근 발생한 크래시 문제를 수정한 긴급 업데이트를 출시했습니다.
  Play 스토어에서 업데이트 후 사용해 주세요.

  불편을 드려 죄송합니다.
  KooDTX 팀
  ```

#### 5-3. 배포 완료 확인

**24시간 후 확인:**
- [ ] 크래시율 정상화 (< 1%)
- [ ] 사용자 리뷰 개선
- [ ] 새로운 크래시 없음
- [ ] 업데이트 설치 비율 > 50%

---

## 🔄 Hotfix 실패 시 롤백

Hotfix 후 오히려 상황이 악화된 경우 롤백합니다.

### 롤백 프로세스

자세한 내용은 `docs/ROLLBACK_GUIDE.md` 참고.

**간단 요약:**

1. **즉시 판단** (Hotfix 배포 후 1시간 이내)
   - 크래시율이 오히려 증가했는가?
   - 새로운 Critical 버그가 발생했는가?

2. **Play Console에서 비활성화**
   - 프로덕션 > 버전 > v0.1.1 > **"출시 중지"**
   - 이전 버전(v0.1.0)으로 자동 롤백

3. **수정 및 재시도**
   - 문제 원인 파악
   - 수정 후 v0.1.2로 재배포

---

## 📊 Hotfix 이력 기록

### CHANGELOG.md 업데이트

```markdown
# Changelog

## [0.1.1] - 2025-01-16 (Hotfix)

### Fixed
- 세션 내보내기 시 null 데이터로 인한 크래시 수정 (#42)

### Impact
- 영향 사용자: 5%
- 배포 시간: 2시간
```

### Hotfix 통계 트래킹

```markdown
# Hotfix History

## 2025

| 날짜 | 버전 | 문제 | 영향도 | 배포 시간 | 상태 |
|------|------|------|--------|----------|------|
| 2025-01-16 | v0.1.1 | Export crash | 5% users | 2h | ✅ Success |
```

---

## ⚠️ Hotfix 주의사항

### DO ✅

- **최소한의 변경만 수행**: 문제 해결에 필요한 코드만 수정
- **철저한 테스트**: 문제가 발생한 기기/OS에서 직접 테스트
- **명확한 커밋 메시지**: 무엇을, 왜 수정했는지 명확히 기록
- **모니터링**: 배포 후 Sentry, Play Console 지속 확인

### DON'T ❌

- **기능 추가**: Hotfix에 새로운 기능 포함하지 않기
- **리팩토링**: 관련 없는 코드 정리하지 않기
- **테스트 생략**: 긴급하더라도 테스트는 필수
- **여러 버그 동시 수정**: 하나의 Hotfix는 하나의 문제만 해결

---

## 🛠️ Hotfix 도구 및 스크립트

### 자동화 스크립트 (선택사항)

**`scripts/hotfix.sh`** (미래 개선사항)

```bash
#!/bin/bash
# Hotfix 자동화 스크립트 (예시)

VERSION=$1
DESCRIPTION=$2

echo "Creating hotfix branch: hotfix/v$VERSION-$DESCRIPTION"
git checkout main
git pull origin main
git checkout -b "hotfix/v$VERSION-$DESCRIPTION"

echo "Updating version to $VERSION..."
# package.json 버전 업데이트
npm version $VERSION --no-git-tag-version

# Android 버전 업데이트는 수동으로 수행

echo "Hotfix branch created. Now:"
echo "1. Fix the bug"
echo "2. Run: npm run test"
echo "3. Run: ./scripts/hotfix-build.sh"
echo "4. Submit to Play Console"
```

---

## 📚 관련 문서

- `docs/ROLLBACK_GUIDE.md`: 롤백 프로세스 상세 가이드
- `docs/DAILY_MONITORING_CHECKLIST.md`: 일일 모니터링
- `docs/HOTFIX_PROCESS.md`: 이 문서
- `.github/workflows/hotfix-deploy.yml`: Hotfix CI/CD (선택사항)

---

## ✅ Hotfix 체크리스트

### 발견 단계
- [ ] Sentry에서 크래시 로그 확인
- [ ] 영향 범위 파악 (몇 % 사용자?)
- [ ] Hotfix 필요성 판단

### 수정 단계
- [ ] hotfix 브랜치 생성
- [ ] 버전 번호 업데이트 (PATCH)
- [ ] 버그 수정 (최소한의 변경)
- [ ] 커밋

### 테스트 단계
- [ ] 로컬 테스트 (개발 빌드)
- [ ] 프로덕션 빌드 테스트
- [ ] 실제 기기 테스트 (문제 발생 기기)
- [ ] Smoke Test (핵심 기능)

### 배포 단계
- [ ] AAB 빌드 (`./gradlew bundleRelease`)
- [ ] Play Console 업로드
- [ ] 출시 노트 작성
- [ ] 검토 제출
- [ ] (선택) 긴급 검토 요청

### Git 작업
- [ ] main 브랜치에 병합
- [ ] 태그 생성 (`git tag -a vX.X.X`)
- [ ] 원격 저장소 푸시
- [ ] GitHub Release 생성

### 모니터링
- [ ] Play Console 배포 상태 확인
- [ ] Sentry 크래시 감소 확인
- [ ] 사용자 리뷰 모니터링
- [ ] 24시간 후 최종 확인

---

**마지막 업데이트**: 2025-01-16
**작성자**: KooDTX Team
**버전**: 1.0.0
