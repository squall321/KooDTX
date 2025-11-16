# Phase 231: App Store Assets Preparation

**Date:** 2025-11-15
**Duration:** 8 hours
**Priority:** High (필수 - 스토어 제출 전)
**Status:** 🔄 In Progress

---

## 📋 Overview

Google Play Store와 App Store에 제출하기 위한 모든 자산(스크린샷, 설명, 아이콘 등)을 준비합니다.

**목표:**
- ✅ Google Play Store 제출 준비 완료
- ✅ 앱 설명 및 키워드 최적화 (ASO)
- ✅ 스크린샷 및 그래픽 자산 준비
- ✅ 법적 문서 (개인정보 처리방침, 이용약관) 작성

---

## 📱 Part 1: 스크린샷 준비 (2시간)

### Google Play Store 요구사항

| 항목 | 요구사항 | 권장사항 |
|------|----------|----------|
| **최소 개수** | 2개 | 8개 (최대한 많이) |
| **최대 개수** | 8개 | - |
| **형식** | JPEG 또는 24-bit PNG (알파 채널 없음) | PNG |
| **최소 크기** | 320px | - |
| **최대 크기** | 3840px | - |
| **권장 비율** | 16:9 또는 9:16 | - |
| **권장 해상도** | 1080 x 1920px (세로) | 고해상도 기기용 |

### 촬영할 화면 목록

**우선순위 1 (필수 - 최소 4개):**

1. **메인 화면 (홈)**
   - 파일명: `01_home_screen.png`
   - 포함 요소: 앱 메인 화면, 주요 기능 버튼
   - 강조 포인트: 깔끔한 UI, 사용하기 쉬운 인터페이스

2. **녹음 화면**
   - 파일명: `02_recording_screen.png`
   - 포함 요소: 센서 선택, 녹음 버튼, 실시간 데이터
   - 강조 포인트: 핵심 기능 (센서 데이터 수집)

3. **세션 목록 화면**
   - 파일명: `03_sessions_list.png`
   - 포함 요소: 녹음된 세션 목록, 통계
   - 강조 포인트: 데이터 관리 기능

4. **세션 상세 화면**
   - 파일명: `04_session_detail.png`
   - 포함 요소: 세션 정보, 센서 데이터, 차트
   - 강조 포인트: 데이터 시각화

**우선순위 2 (권장 - 추가 4개):**

5. **차트 화면**
   - 파일명: `05_chart_screen.png`
   - 포함 요소: 센서 데이터 그래프
   - 강조 포인트: 고급 분석 기능

6. **설정 화면**
   - 파일명: `06_settings_screen.png`
   - 포함 요소: API 설정, 동기화 설정
   - 강조 포인트: 커스터마이징 가능

7. **동기화 상태 화면**
   - 파일명: `07_sync_status.png`
   - 포함 요소: 업로드 진행 상황
   - 강조 포인트: 클라우드 동기화

8. **진단 화면 (선택)**
   - 파일명: `08_diagnostics.png`
   - 포함 요소: 시스템 정보, 성능 지표
   - 강조 포인트: 전문성

### 스크린샷 촬영 가이드

**준비 사항:**

1. **샘플 데이터 생성**
   ```typescript
   // 테스트용 녹음 세션 3-5개 생성
   // 각 세션마다 센서 데이터 포함
   // 차트 표시를 위한 충분한 데이터
   ```

2. **테마 선택**
   - Light 모드 또는 Dark 모드 선택
   - 일관성 유지 (모든 스크린샷 동일 테마)
   - 권장: Light 모드 (가독성)

3. **디바이스 선택**
   - 고해상도 디바이스 사용
   - 권장: Pixel 6/7 또는 Samsung Galaxy S21+
   - 해상도: 1080 x 2400px 이상

**촬영 방법:**

**Option A: 실제 디바이스에서 촬영**
```bash
# Android (adb 사용)
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshots/01_home_screen.png

# 또는 전원 + 볼륨 다운 버튼으로 직접 촬영
```

**Option B: 에뮬레이터에서 촬영**
```bash
# Android Emulator
# Ctrl + S (Windows) 또는 Cmd + S (Mac)
# 또는 에뮬레이터 사이드바의 카메라 아이콘 클릭
```

**Option C: 디자인 프레임 추가 (권장)**

도구: [Previewed](https://previewed.app/), [Mockuphone](https://mockuphone.com/)

1. 스크린샷 촬영
2. 디바이스 프레임에 삽입
3. 배경 추가 (옵션)
4. 텍스트 오버레이 추가 (옵션)
   - "실시간 센서 데이터 수집"
   - "클라우드 자동 동기화"
   - "상세한 데이터 분석"

### 스크린샷 편집 가이드

**필수 편집:**

1. **크기 조정**
   - 목표: 1080 x 1920px
   - 도구: Photoshop, GIMP, Preview (Mac)

2. **상태바 정리**
   - 시간: 9:41 AM (iOS 표준)
   - 배터리: 100%
   - 신호: Full
   - 도구: [Clean Status Bar](https://cleanstatusbar.com/)

3. **개인정보 제거**
   - 이메일 주소 모자이크
   - 실제 GPS 좌표 숨김
   - 테스트 계정 사용

**선택 편집 (권장):**

1. **텍스트 오버레이**
   - 각 스크린샷마다 주요 기능 설명
   - 폰트: Roboto (Android), SF Pro (iOS)
   - 크기: 48-64px
   - 색상: 흰색 (그림자 추가)

2. **그래픽 요소**
   - 화살표로 주요 기능 강조
   - 아이콘 추가
   - 브랜드 색상 사용

### 체크리스트

- [ ] 8개 스크린샷 촬영 완료
- [ ] 1080 x 1920px로 크기 조정
- [ ] PNG 형식으로 저장
- [ ] 개인정보 제거 확인
- [ ] 파일명 일관성 (`01_`, `02_`, ...)
- [ ] `screenshots/` 폴더에 저장

---

## 📝 Part 2: 앱 설명문 작성 (2시간)

### Google Play Store 요구사항

| 항목 | 최대 길이 |
|------|-----------|
| 짧은 설명 | 80자 |
| 전체 설명 | 4000자 |

### 1. 짧은 설명 (80자)

**한글:**
```
스마트폰 센서로 고정밀 데이터를 수집하고 클라우드에 동기화하는 연구용 앱
```

**영문:**
```
Collect high-precision sensor data from your smartphone and sync to cloud
```

**작성 팁:**
- 핵심 기능 2-3개 언급
- 목표 사용자 명시 (연구자, 개발자)
- 액션 동사 사용 (수집, 동기화, 분석)

### 2. 전체 설명

**구조:**

```markdown
[헤더: 앱 이름 + 한 줄 설명]

KooDTX - 전문가를 위한 센서 데이터 수집 플랫폼

[문제 제기]
스마트폰에 내장된 다양한 센서를 활용한 연구나 개발을 하시나요?
데이터 수집, 저장, 분석이 번거로우셨나요?

[솔루션 제시]
KooDTX는 모바일 센서 데이터를 쉽고 정확하게 수집할 수 있는
올인원 솔루션입니다.

[주요 기능] 🎯

✅ 다양한 센서 지원
• 가속도계 (Accelerometer)
• 자이로스코프 (Gyroscope)
• 자기계 (Magnetometer)
• GPS
• 오디오 녹음

✅ 고정밀 데이터 수집
• 최대 400Hz 샘플링
• 마이크로초 단위 타임스탬프
• 손실 없는 원본 데이터

✅ 로컬 우선 (Local-First)
• WatermelonDB 기반 오프라인 저장
• 배치 저장으로 성능 최적화
• 언제든 데이터 접근 가능

✅ 스마트 동기화
• Wi-Fi 전용 모드
• 자동 백업
• 실패 시 자동 재시도
• 진행 상황 실시간 추적

✅ 강력한 데이터 관리
• 세션별 데이터 그룹화
• CSV/JSON 내보내기
• 차트로 시각화
• 오디오 재생 및 공유

[사용 사례] 💡

🔬 학술 연구
• 모바일 센서 기반 실험
• 행동 패턴 분석
• 위치 기반 연구

👨‍💻 앱 개발
• 센서 API 테스트
• 알고리즘 검증
• 프로토타이핑

🏃 스포츠 과학
• 운동 데이터 수집
• 자세 분석
• 성능 측정

[기술 스펙] ⚙️

• React Native 0.73
• WatermelonDB (SQLite)
• TypeScript
• Material Design 3
• Offline-First Architecture

[개인정보 보호] 🔒

• 모든 데이터는 로컬 저장
• 동기화는 사용자 제어
• 암호화 전송 (HTTPS)
• 언제든 데이터 삭제 가능

[지원] 📧

문의: support@koodtx.com
웹사이트: https://koodtx.com
개인정보 처리방침: https://koodtx.com/privacy

[업데이트 계획]

• 추가 센서 지원
• 실시간 데이터 스트리밍
• 고급 분석 기능
• 협업 기능

지금 다운로드하고 전문적인 센서 데이터 수집을 시작하세요!
```

**영문 버전:**

```markdown
KooDTX - Professional Sensor Data Collection Platform

[Problem]
Need to collect sensor data from smartphones for research or development?
Tired of complex data collection and analysis workflows?

[Solution]
KooDTX is an all-in-one solution for easy and accurate mobile sensor data collection.

[Key Features] 🎯

✅ Multiple Sensor Support
• Accelerometer
• Gyroscope
• Magnetometer
• GPS
• Audio Recording

✅ High-Precision Data Collection
• Up to 400Hz sampling rate
• Microsecond timestamps
• Lossless raw data

✅ Local-First Architecture
• Offline storage with WatermelonDB
• Batch processing for performance
• Access data anytime

✅ Smart Synchronization
• Wi-Fi only mode
• Automatic backup
• Auto-retry on failure
• Real-time progress tracking

✅ Powerful Data Management
• Session-based organization
• Export to CSV/JSON
• Chart visualization
• Audio playback & sharing

[Use Cases] 💡

🔬 Academic Research
• Mobile sensor experiments
• Behavior pattern analysis
• Location-based studies

👨‍💻 App Development
• Sensor API testing
• Algorithm validation
• Prototyping

🏃 Sports Science
• Motion data collection
• Posture analysis
• Performance measurement

[Tech Stack] ⚙️

• React Native 0.73
• WatermelonDB (SQLite)
• TypeScript
• Material Design 3
• Offline-First Architecture

[Privacy] 🔒

• All data stored locally
• User-controlled sync
• Encrypted transfer (HTTPS)
• Delete data anytime

[Support] 📧

Email: support@koodtx.com
Website: https://koodtx.com
Privacy Policy: https://koodtx.com/privacy

[Roadmap]

• Additional sensor support
• Real-time data streaming
• Advanced analytics
• Collaboration features

Download now and start professional sensor data collection!
```

### 작성 팁

1. **구조화**
   - 이모지로 섹션 구분
   - 짧은 단락 (2-3줄)
   - 불릿 포인트 활용

2. **SEO 최적화**
   - 키워드 자연스럽게 포함
   - 제목에 핵심 키워드
   - 첫 160자가 가장 중요

3. **행동 유도**
   - "지금 다운로드"
   - "무료로 시작"
   - "체험해보세요"

### 체크리스트

- [ ] 짧은 설명 80자 이내
- [ ] 전체 설명 작성 완료
- [ ] 이모지 적절히 사용
- [ ] 키워드 포함 확인
- [ ] 맞춤법 검사 완료
- [ ] 한글/영문 버전 모두 준비

---

## 🔍 Part 3: 키워드 최적화 (ASO) (1시간)

### App Store Optimization (ASO)

**목표:** 검색 노출 최대화

### 키워드 연구

**Primary Keywords (핵심):**
```
센서, 데이터 수집, 가속도계, 자이로스코프, GPS, 연구, 실험
sensor, data collection, accelerometer, gyroscope, research
```

**Secondary Keywords (보조):**
```
모바일 센서, 스마트폰, 데이터 분석, 동기화, 오프라인
mobile sensor, smartphone, data analysis, sync, offline
```

**Long-tail Keywords (롱테일):**
```
센서 데이터 수집 앱, 연구용 데이터 수집, 모바일 센서 실험
sensor data collection app, research data collection
```

### Google Play Store 키워드 배치

Google Play는 앱 설명에서 키워드를 추출하므로 자연스럽게 포함:

**체크리스트:**
- [ ] 제목에 1-2개 핵심 키워드
- [ ] 짧은 설명에 2-3개 키워드
- [ ] 전체 설명에 5-10회 반복 (자연스럽게)
- [ ] 기능 설명에 키워드 포함

### App Store (iOS) 키워드 최적화

App Store는 별도 키워드 필드 제공 (100자):

```
sensor,data,collect,research,accelerometer,gyroscope,gps,sync,offline,analysis
```

**팁:**
- 공백 없이 쉼표로 구분
- 단수형 사용 (복수형 자동 포함)
- 앱 이름에 있는 단어 제외
- 브랜드명 제외

### 경쟁사 분석

**유사 앱:**
1. Sensor Logger
2. Sensor Kinetics
3. Physics Toolbox Sensor Suite
4. Sensor Data Recorder

**차별점 강조:**
- ✅ Local-First 아키텍처
- ✅ 클라우드 자동 동기화
- ✅ 전문 연구자용 고정밀 수집
- ✅ 현대적인 UI/UX

### 체크리스트

- [ ] 키워드 리스트 작성 (20-30개)
- [ ] 경쟁사 분석 완료
- [ ] 제목에 키워드 포함
- [ ] 설명에 키워드 자연스럽게 배치
- [ ] App Store 키워드 필드 작성 (iOS)

---

## 🖼️ Part 4: 그래픽 자산 (1시간)

### Feature Graphic (Google Play)

**요구사항:**
- 크기: 1024 x 500px
- 형식: JPEG 또는 24-bit PNG
- 용도: 상단 배너

**디자인 요소:**
- 앱 로고
- 주요 기능 아이콘 3-4개
- 슬로건: "Professional Sensor Data Collection"
- 브랜드 색상

### 앱 아이콘 최종 확인

**체크리스트:**
- [ ] 1024 x 1024px 고해상도 버전
- [ ] Android adaptive icon
- [ ] iOS app icon (모든 사이즈)
- [ ] 단순하고 인식 가능한 디자인
- [ ] 브랜드 색상 일관성

### 프로모션 비디오 (선택)

**권장 사양:**
- 길이: 30초 이내
- 해상도: 1080p
- 형식: MP4
- 내용: 주요 기능 3-4개 시연

**구성:**
1. 인트로 (3초): 앱 로고 + 이름
2. 기능 1 (8초): 센서 선택 및 녹음
3. 기능 2 (8초): 데이터 확인 및 차트
4. 기능 3 (8초): 동기화 및 내보내기
5. 아웃트로 (3초): 다운로드 유도

---

## 📄 Part 5: 법적 문서 (2시간)

### 1. 개인정보 처리방침 (Privacy Policy)

**생성 도구:**
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [TermsFeed](https://www.termsfeed.com/privacy-policy-generator/)
- [GetTerms](https://getterms.io/)

**필수 포함 내용:**

```markdown
# KooDTX 개인정보 처리방침

최종 수정일: 2025-11-15

## 1. 수집하는 정보

### 1.1 사용자가 제공하는 정보
- 이메일 주소 (계정 생성 시)
- 이름 (선택사항)

### 1.2 자동으로 수집되는 정보
- 디바이스 정보 (모델, OS 버전)
- 센서 데이터 (사용자가 녹음한 경우에만)
- GPS 위치 (사용자가 활성화한 경우에만)
- 사용 통계 (앱 사용 빈도, 기능 사용)

## 2. 정보 사용 목적

- 서비스 제공 및 유지
- 사용자 지원
- 앱 개선 및 새 기능 개발
- 보안 및 사기 방지

## 3. 정보 공유

**제3자와 공유하지 않습니다** (다음 경우 제외):
- 법적 요구가 있는 경우
- 사용자의 명시적 동의가 있는 경우

### 사용하는 제3자 서비스:
- Sentry (크래시 리포팅)
- Google Analytics (사용 통계)
- AWS/Google Cloud (데이터 저장)

## 4. 데이터 보안

- HTTPS 암호화 전송
- 서버 데이터 암호화
- 정기적인 보안 감사

## 5. 사용자 권리

- 데이터 열람 요청
- 데이터 삭제 요청
- 데이터 이동 요청
- 마케팅 수신 거부

## 6. 데이터 보관

- 계정 삭제 시 30일 이내 모든 데이터 삭제
- 백업 데이터는 90일 이내 삭제

## 7. 쿠키

웹 기반 기능에서만 사용:
- 세션 쿠키 (로그인 유지)
- 분석 쿠키 (사용 패턴 분석)

## 8. 아동 개인정보

13세 미만 아동의 정보를 고의로 수집하지 않습니다.

## 9. 정책 변경

정책 변경 시 앱 내 공지 및 이메일 알림

## 10. 연락처

질문 또는 요청:
- 이메일: privacy@koodtx.com
- 주소: [회사 주소]
- 전화: [전화번호]

---

이 개인정보 처리방침은 KooDTX 앱에 적용됩니다.
```

**호스팅:**
- [ ] GitHub Pages 사용
- [ ] 또는 koodtx.com/privacy에 호스팅
- [ ] URL을 Play Console에 입력

### 2. 서비스 이용약관 (Terms of Service)

```markdown
# KooDTX 서비스 이용약관

최종 수정일: 2025-11-15

## 1. 서비스 설명

KooDTX는 모바일 센서 데이터 수집 및 관리 서비스입니다.

## 2. 이용 자격

- 만 13세 이상
- 서비스 약관 동의

## 3. 계정

- 정확한 정보 제공
- 비밀번호 보안 유지
- 계정 공유 금지

## 4. 금지 행위

- 불법적 목적 사용
- 서비스 남용
- 타인 권리 침해
- 보안 침해 시도

## 5. 지적 재산권

모든 앱 콘텐츠는 KooDTX의 지적 재산입니다.

## 6. 데이터 소유권

사용자가 수집한 센서 데이터는 사용자 소유입니다.

## 7. 서비스 변경

사전 통지 후 서비스 변경 또는 중단 가능

## 8. 책임 제한

"있는 그대로" 제공되며 특정 목적 적합성 보증 없음

## 9. 계정 해지

- 사용자가 언제든 해지 가능
- 위반 시 서비스 해지 가능

## 10. 준거법

대한민국 법률 적용

## 11. 연락처

질문: support@koodtx.com
```

**호스팅:**
- [ ] koodtx.com/terms에 호스팅
- [ ] URL을 Play Console에 입력

### 체크리스트

- [ ] 개인정보 처리방침 작성 완료
- [ ] 서비스 이용약관 작성 완료
- [ ] 두 문서 모두 온라인 호스팅
- [ ] URL 접근 가능 확인
- [ ] Play Console에 URL 입력

---

## ✅ Phase 231 완료 체크리스트

### 스크린샷 (필수)
- [ ] 8개 스크린샷 촬영 완료
- [ ] 1080 x 1920px 크기 조정
- [ ] PNG 형식 저장
- [ ] `screenshots/` 폴더 정리

### 설명문 (필수)
- [ ] 짧은 설명 (80자) 작성
- [ ] 전체 설명 (4000자 이내) 작성
- [ ] 한글/영문 버전 준비
- [ ] 맞춤법 검사 완료

### 키워드 (필수)
- [ ] 키워드 리스트 20-30개
- [ ] 경쟁사 분석 완료
- [ ] 제목/설명에 키워드 포함

### 그래픽 (필수)
- [ ] Feature Graphic (1024x500px)
- [ ] 앱 아이콘 최종 확인
- [ ] 프로모션 비디오 (선택)

### 법적 문서 (필수)
- [ ] 개인정보 처리방침 작성 및 호스팅
- [ ] 서비스 이용약관 작성 및 호스팅
- [ ] 두 URL 접근 가능 확인

### 기타
- [ ] 모든 파일을 `store-assets/` 폴더에 정리
- [ ] README 파일 작성 (자산 목록)

---

## 📁 파일 구조

```
KooDTX/
└── store-assets/
    ├── screenshots/
    │   ├── 01_home_screen.png
    │   ├── 02_recording_screen.png
    │   ├── 03_sessions_list.png
    │   ├── 04_session_detail.png
    │   ├── 05_chart_screen.png
    │   ├── 06_settings_screen.png
    │   ├── 07_sync_status.png
    │   └── 08_diagnostics.png
    ├── graphics/
    │   ├── feature_graphic.png (1024x500)
    │   ├── app_icon.png (1024x1024)
    │   └── promo_video.mp4 (선택)
    ├── descriptions/
    │   ├── short_description_kr.txt
    │   ├── short_description_en.txt
    │   ├── full_description_kr.txt
    │   └── full_description_en.txt
    ├── legal/
    │   ├── privacy_policy.md
    │   └── terms_of_service.md
    └── README.md
```

---

## 🚀 다음 단계

Phase 231 완료 후:

**Phase 232: 출시 전 체크리스트**
- Google Play Console 설정
- 앱 빌드 및 서명
- 테스트 및 검증
- 최종 제출

**예상 소요 시간:** 4시간

---

**Last Updated:** 2025-11-15
**Status:** Ready to Execute
**Next:** Start screenshot capture
