# Release Checklist

**릴리스 체크리스트** | Pre-Release Verification

이 체크리스트는 KooDTX 앱을 Play Store에 출시하기 전에 확인해야 할 모든 항목을 포함합니다.

---

## 📋 릴리스 전 체크리스트

### 1. 코드 및 빌드

#### 1.1 버전 정보

- [ ] **package.json** 버전 업데이트
  ```json
  {
    "version": "0.X.0"
  }
  ```

- [ ] **android/app/build.gradle** 버전 업데이트
  ```gradle
  versionCode X      // 이전 versionCode + 1 (절대 감소하면 안 됨!)
  versionName "0.X.0"
  ```

- [ ] 버전 번호가 Semantic Versioning 규칙을 따르는지 확인
  - MAJOR.MINOR.PATCH
  - 새 기능 추가: MINOR 증가
  - 버그 수정만: PATCH 증가

#### 1.2 환경 설정

- [ ] **.env.production** 파일 확인
  ```bash
  # Sentry
  SENTRY_DSN=https://...
  ENABLE_SENTRY=true

  # Analytics
  ENABLE_ANALYTICS=true

  # API
  API_BASE_URL=https://production-api.example.com
  ```

- [ ] 개발용 API URL이 아닌 **프로덕션 API URL** 사용 확인

- [ ] 디버그 로그 비활성화 확인 (`__DEV__` 체크)

#### 1.3 ProGuard 및 최적화

- [ ] **android/app/build.gradle** ProGuard 설정 확인
  ```gradle
  buildTypes {
      release {
          minifyEnabled true
          shrinkResources true
          proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
      }
  }
  ```

- [ ] ProGuard rules 파일 확인 (`android/app/proguard-rules.pro`)
  - Sentry, WatermelonDB 등 필수 라이브러리 keep 규칙 있는지 확인

#### 1.4 빌드 테스트

- [ ] Clean 빌드 성공
  ```bash
  cd android
  ./gradlew clean
  ```

- [ ] AAB (Android App Bundle) 빌드 성공
  ```bash
  ./gradlew bundleRelease
  ```

- [ ] AAB 파일 크기 확인 (< 50MB 권장)
  ```bash
  ls -lh app/build/outputs/bundle/release/app-release.aab
  ```

- [ ] AAB 서명 확인
  ```bash
  jarsigner -verify -verbose -certs app/build/outputs/bundle/release/app-release.aab
  # 출력: "jar verified."
  ```

- [ ] APK도 빌드하여 실제 기기에서 테스트
  ```bash
  ./gradlew assembleRelease
  adb install -r app/build/outputs/apk/release/app-release.apk
  ```

---

### 2. 기능 테스트

#### 2.1 핵심 기능 (Smoke Test)

- [ ] 앱 실행 성공
- [ ] 권한 요청 정상 작동 (위치, 저장소)
- [ ] 녹음 시작/중지 정상 작동
- [ ] 데이터 저장 확인 (세션 목록에 표시)
- [ ] 세션 내보내기 (CSV, JSON) 정상 작동
- [ ] 클라우드 동기화 정상 작동 (설정 시)
- [ ] 설정 변경 저장 확인

#### 2.2 Regression 테스트

- [ ] 이전 버전에서 작동하던 모든 기능이 여전히 작동하는지 확인
- [ ] 특히 이번 업데이트와 관련 없는 기능도 테스트

#### 2.3 Edge Case 테스트

- [ ] 네트워크 없을 때 (동기화 실패 처리)
- [ ] 권한 거부 시 (안내 메시지 표시)
- [ ] 저장 공간 부족 시 (오류 처리)
- [ ] 백그라운드 녹음 중단/재개
- [ ] 앱 강제 종료 후 데이터 보존

---

### 3. 기기 호환성 테스트

#### 3.1 다양한 기기에서 테스트 (최소 3개)

- [ ] **삼성** (Galaxy S 시리즈, A 시리즈)
- [ ] **구글** (Pixel)
- [ ] **샤오미/화웨이** 등 (중국 제조사)

#### 3.2 Android 버전 테스트

- [ ] **Android 10 (API 29)** - 최소 지원 버전
- [ ] **Android 13 (API 33)**
- [ ] **Android 14 (API 34)** - 최신 버전

#### 3.3 화면 크기 테스트

- [ ] 소형 (< 5인치)
- [ ] 중형 (5-6인치)
- [ ] 대형 (> 6인치)

---

### 4. 성능 테스트

#### 4.1 앱 성능

- [ ] 앱 시작 시간 < 3초
- [ ] 화면 전환 부드러움 (60 FPS)
- [ ] 메모리 사용량 정상 (< 200MB)
- [ ] 크래시 없음 (Sentry에서 확인)

#### 4.2 배터리 소모

- [ ] 1시간 녹음 시 배터리 소모 < 20%
- [ ] 백그라운드에서 과도한 배터리 소모 없음

#### 4.3 네트워크 사용량

- [ ] WiFi 전용 동기화 설정 시 모바일 데이터 사용 안 함
- [ ] 동기화 시 합리적인 데이터 사용량

---

### 5. UI/UX 확인

#### 5.1 UI 정합성

- [ ] 모든 텍스트가 올바르게 표시됨 (잘림 없음)
- [ ] 아이콘이 올바르게 표시됨
- [ ] 다크 모드 지원 (있는 경우)
- [ ] 접근성 (Accessibility) 기본 지원

#### 5.2 사용자 경험

- [ ] 오류 메시지가 명확하고 도움이 됨
- [ ] 로딩 인디케이터 표시 (긴 작업 시)
- [ ] 사용자 안내 메시지 (Toast, Alert) 적절

---

### 6. 보안 및 개인정보

#### 6.1 데이터 보안

- [ ] 로컬 데이터베이스 암호화 (WatermelonDB)
- [ ] API 통신 HTTPS 사용
- [ ] API 키, 토큰 등 민감 정보가 코드에 하드코딩되지 않음

#### 6.2 개인정보 처리

- [ ] 개인정보처리방침 최신 버전 (store-assets/legal/privacy_policy.md)
- [ ] 이용약관 최신 버전 (store-assets/legal/terms_of_service.md)
- [ ] 사용자 동의 절차 (필요 시)

#### 6.3 권한

- [ ] 필요한 권한만 요청
- [ ] 권한 요청 이유 명확히 설명
- [ ] 권한 거부 시 대응 방안 있음

---

### 7. 문서 업데이트

#### 7.1 CHANGELOG

- [ ] **CHANGELOG.md** 업데이트
  ```markdown
  ## [0.X.0] - YYYY-MM-DD

  ### Added
  - 새로운 기능 1

  ### Changed
  - 변경된 기능 1

  ### Fixed
  - 수정된 버그 1
  ```

#### 7.2 출시 노트

- [ ] **Play Console 출시 노트** 작성 완료 (한국어)
  ```
  버전 0.X.0 - [Month] 업데이트

  [새로운 기능]
  - 기능 1: 설명

  [개선]
  - 개선 1: 설명

  [수정]
  - 버그 1 수정
  ```

- [ ] **Play Console 출시 노트** 작성 완료 (영어)

#### 7.3 README (있는 경우)

- [ ] README.md 최신 버전으로 업데이트
- [ ] 스크린샷 최신 버전 반영

---

### 8. Git 작업

#### 8.1 커밋 및 태그

- [ ] 모든 변경사항 커밋
  ```bash
  git add .
  git commit -m "chore: Release v0.X.0

  - Update version to 0.X.0
  - Update CHANGELOG
  - Update release notes"
  ```

- [ ] Git 태그 생성
  ```bash
  git tag -a v0.X.0 -m "Release v0.X.0"
  ```

- [ ] 원격 저장소에 푸시
  ```bash
  git push origin main --tags
  # 또는
  git push origin release/v0.X.0 --tags
  ```

#### 8.2 GitHub Release (선택사항)

- [ ] GitHub > Releases > Draft a new release
- [ ] Tag: `v0.X.0`
- [ ] Title: `v0.X.0 - [Month] Update`
- [ ] Description: CHANGELOG 내용 복사
- [ ] Publish release

---

### 9. Play Console 제출

#### 9.1 AAB 업로드

- [ ] Play Console 접속: https://play.google.com/console
- [ ] 앱 선택 > **프로덕션** > **새 버전 만들기**
- [ ] AAB 업로드 (`app-release.aab`)
- [ ] Google Play가 AAB 검증 완료 (오류 없음)

#### 9.2 출시 노트

- [ ] 한국어 출시 노트 입력
- [ ] 영어 출시 노트 입력

#### 9.3 릴리스 설정

- [ ] **단계적 출시** 설정 (권장)
  - 초기 출시 비율: 5% 또는 10%
- [ ] **전체 출시** (첫 출시 또는 소규모 앱)

#### 9.4 검토 제출

- [ ] "프로덕션으로 출시" 클릭
- [ ] "검토 제출" 클릭
- [ ] 제출 확인 메시지 확인

---

### 10. 출시 후 모니터링 준비

#### 10.1 모니터링 도구 확인

- [ ] **Sentry** 접속 가능
- [ ] **Firebase Analytics** 접속 가능 (Phase 248 이후)
- [ ] **Play Console** 알림 설정 확인

#### 10.2 지원 체계 준비

- [ ] **support@koodtx.com** 이메일 확인 가능
- [ ] 지원 템플릿 준비 (docs/SUPPORT_EMAIL_TEMPLATES.md)

#### 10.3 롤백 계획

- [ ] 롤백 프로세스 숙지 (docs/ROLLBACK_GUIDE.md)
- [ ] 이전 버전 AAB 백업 보관

---

## ✅ 최종 확인 (Final Check)

출시 버튼을 누르기 전 마지막으로 확인:

- [ ] **버전 번호가 정확한가?** (package.json, build.gradle)
- [ ] **AAB가 올바르게 서명되었는가?**
- [ ] **프로덕션 환경 설정인가?** (API URL, Sentry DSN 등)
- [ ] **CHANGELOG가 업데이트되었는가?**
- [ ] **출시 노트가 작성되었는가?** (한국어 + 영어)
- [ ] **모든 핵심 기능이 테스트되었는가?**
- [ ] **다양한 기기에서 테스트되었는가?** (최소 3개)
- [ ] **크래시가 없는가?** (Sentry 확인)
- [ ] **Git 커밋 및 태그가 완료되었는가?**
- [ ] **모니터링 준비가 되었는가?** (Sentry, Play Console)

---

## 📊 릴리스 체크리스트 템플릿 (복사용)

```markdown
# Release v0.X.0 Checklist - [YYYY-MM-DD]

## 1. 코드 및 빌드
- [ ] package.json 버전 업데이트
- [ ] build.gradle versionCode, versionName 업데이트
- [ ] .env.production 확인
- [ ] ProGuard 설정 확인
- [ ] AAB 빌드 성공
- [ ] AAB 서명 확인
- [ ] APK 실기기 테스트

## 2. 기능 테스트
- [ ] 핵심 기능 Smoke Test
- [ ] Regression 테스트
- [ ] Edge Case 테스트

## 3. 기기 호환성
- [ ] 삼성 기기 테스트
- [ ] 구글 Pixel 테스트
- [ ] 샤오미/화웨이 테스트
- [ ] Android 10, 13, 14 테스트

## 4. 성능 테스트
- [ ] 앱 시작 시간 < 3초
- [ ] 메모리 사용량 < 200MB
- [ ] 배터리 소모 정상
- [ ] 크래시 없음

## 5. UI/UX
- [ ] 텍스트 잘림 없음
- [ ] 아이콘 정상 표시
- [ ] 오류 메시지 명확

## 6. 보안 및 개인정보
- [ ] 데이터베이스 암호화
- [ ] HTTPS 통신
- [ ] 개인정보처리방침 최신
- [ ] 필요한 권한만 요청

## 7. 문서 업데이트
- [ ] CHANGELOG.md 업데이트
- [ ] 출시 노트 작성 (한국어)
- [ ] 출시 노트 작성 (영어)

## 8. Git 작업
- [ ] 커밋 완료
- [ ] 태그 생성 (v0.X.0)
- [ ] 푸시 완료
- [ ] GitHub Release 생성 (선택)

## 9. Play Console
- [ ] AAB 업로드
- [ ] 출시 노트 입력
- [ ] 단계적 출시 설정 (5-10%)
- [ ] 검토 제출

## 10. 모니터링 준비
- [ ] Sentry 접속 가능
- [ ] Play Console 알림 설정
- [ ] 지원 이메일 확인 가능
- [ ] 롤백 계획 숙지

## 최종 확인
- [ ] 모든 체크리스트 항목 완료
- [ ] 팀원 리뷰 완료 (있는 경우)
- [ ] 출시 준비 완료! 🚀

---
담당자: [이름]
출시일: [YYYY-MM-DD]
```

---

## 📚 관련 문서

- `docs/MONTHLY_UPDATE_PROCESS.md`: 월간 업데이트 프로세스
- `docs/HOTFIX_PROCESS.md`: 긴급 패치 프로세스
- `docs/ROLLBACK_GUIDE.md`: 롤백 가이드
- `docs/DAILY_MONITORING_CHECKLIST.md`: 일일 모니터링
- `CHANGELOG.md`: 변경 이력

---

**마지막 업데이트**: 2025-01-16
**작성자**: KooDTX Team
**버전**: 1.0.0
