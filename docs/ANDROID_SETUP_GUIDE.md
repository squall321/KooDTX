# Android 개발 환경 설정 가이드

> KooDTX React Native 앱 개발을 위한 Android 환경 설정

## 1. Android Studio 설치

### Windows / macOS / Linux

1. **Android Studio 다운로드**

   - 공식 사이트: https://developer.android.com/studio
   - 최신 안정 버전 (Hedgehog 2023.1.1 이상) 다운로드

2. **설치 실행**

   - 설치 마법사 따라 진행
   - "Android Virtual Device" 포함하여 설치
   - 기본 설정으로 설치 (권장)

3. **초기 설정**
   - Android Studio 실행
   - "Standard" 설치 타입 선택
   - 필요한 SDK 컴포넌트 자동 다운로드 대기

## 2. Android SDK 설정

### SDK Manager 열기

Android Studio 실행 → More Actions → SDK Manager

또는: Tools → SDK Manager

### SDK Platforms 설치

**필수 설치 항목:**

- ✅ **Android 13.0 (Tiramisu) - API Level 33** (권장)
- ✅ **Android 12.0 (S) - API Level 31**
- ✅ **Android 10.0 (Q) - API Level 29**

**설치 방법:**

1. SDK Manager → SDK Platforms 탭
2. "Show Package Details" 체크
3. 각 Android 버전에서 다음 항목 선택:
   - Android SDK Platform 33 (또는 해당 버전)
   - Intel x86 Atom_64 System Image (에뮬레이터용)
   - Google APIs Intel x86 Atom System Image

### SDK Tools 설치

SDK Manager → SDK Tools 탭에서 다음 항목 설치:

- ✅ **Android SDK Build-Tools** (33.0.0 이상)
- ✅ **Android Emulator**
- ✅ **Android SDK Platform-Tools**
- ✅ **Android SDK Tools** (Obsolete 체크하여 표시)
- ✅ **Google Play Services**
- ✅ **Intel x86 Emulator Accelerator (HAXM installer)** - Windows/Mac만

**설치 경로 확인:**

- Windows: `C:\Users\{username}\AppData\Local\Android\Sdk`
- macOS: `/Users/{username}/Library/Android/sdk`
- Linux: `/home/{username}/Android/Sdk`

## 3. 환경 변수 설정

### Windows

1. **시스템 환경 변수 편집**

   - 시작 → "환경 변수" 검색
   - "시스템 환경 변수 편집" 클릭
   - "환경 변수" 버튼 클릭

2. **새 시스템 변수 추가**

   **ANDROID_HOME:**

   - 변수 이름: `ANDROID_HOME`
   - 변수 값: `C:\Users\{username}\AppData\Local\Android\Sdk`

   **JAVA_HOME (이미 설정되어 있어야 함):**

   - 변수 이름: `JAVA_HOME`
   - 변수 값: `C:\Program Files\Java\jdk-17` (설치 경로에 맞게)

3. **Path 변수 업데이트**

   Path 변수에 다음 추가:

   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

### macOS / Linux

**~/.bashrc 또는 ~/.zshrc 파일 편집:**

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# export ANDROID_HOME=$HOME/Android/Sdk       # Linux

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Java (이미 설정되어 있어야 함)
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home  # macOS
# export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64                       # Linux
```

**설정 적용:**

```bash
source ~/.bashrc  # 또는 source ~/.zshrc
```

## 4. 설치 확인

터미널/명령 프롬프트에서 다음 명령 실행:

```bash
# 환경 변수 확인
echo $ANDROID_HOME    # Linux/Mac
echo %ANDROID_HOME%   # Windows

# adb 확인
adb --version

# Java 확인
java -version

# Node.js 확인
node --version
```

**예상 출력:**

```
ANDROID_HOME=/Users/username/Library/Android/sdk
Android Debug Bridge version 1.0.41
openjdk version "17.0.x" or higher
v20.x.x or higher
```

## 5. Android Emulator 생성

### AVD Manager 열기

Android Studio → More Actions → Virtual Device Manager

또는: Tools → Device Manager

### 가상 기기 생성

1. **Create Device** 클릭
2. **하드웨어 선택:**
   - Phone 카테고리
   - **Pixel 5** 또는 **Pixel 6** 선택 (권장)
3. **시스템 이미지 선택:**
   - Release Name: **Tiramisu** (API Level 33)
   - Target: **Android 13.0 (Google APIs)**
   - Download 클릭하여 이미지 다운로드
4. **AVD 설정:**
   - AVD Name: `Pixel_5_API_33`
   - Startup orientation: Portrait
   - Emulated Performance: Hardware - GLES 2.0
5. **Finish** 클릭

### 에뮬레이터 실행 테스트

1. Device Manager에서 생성한 AVD 옆 ▶️ 클릭
2. 에뮬레이터 부팅 대기 (1-2분)
3. Android 홈 화면 확인

## 6. 물리 기기 연결 (선택)

### USB 디버깅 활성화

1. **개발자 옵션 활성화:**

   - 설정 → 휴대전화 정보
   - "빌드 번호" 7회 탭

2. **USB 디버깅 활성화:**

   - 설정 → 시스템 → 개발자 옵션
   - "USB 디버깅" 켜기

3. **기기 연결 확인:**

   ```bash
   adb devices
   ```

   **예상 출력:**

   ```
   List of devices attached
   XXXXXXXXXX    device
   ```

## 7. Gradle 및 기타 설정

### Gradle 버전

React Native는 Gradle을 자동으로 다운로드합니다.

**권장 버전:**

- Gradle: 8.3+
- Android Gradle Plugin: 8.1.0+

### JDK 호환성

- **JDK 17 이상** 필수
- React Native 0.73+는 JDK 17 권장
- JDK 21도 호환됨

## 8. 문제 해결

### 흔한 문제

**1. "ANDROID_HOME is not set"**

- 환경 변수 재확인
- 터미널/명령 프롬프트 재시작

**2. "adb: command not found"**

- Path 변수에 `platform-tools` 추가 확인
- Android SDK 재설치

**3. 에뮬레이터가 느림**

- HAXM (Intel) 또는 Hyper-V (AMD) 설치
- RAM 할당량 증가 (AVD 설정)
- GPU 가속 활성화

**4. "SDK location not found"**

- `local.properties` 파일 생성:
  ```properties
  sdk.dir=/Users/username/Library/Android/sdk
  ```

### React Native Doctor 실행

```bash
npx react-native doctor
```

모든 항목이 ✅ 표시되어야 합니다.

## 9. 다음 단계

환경 설정 완료 후:

1. React Native 프로젝트 생성
2. 앱 빌드 및 실행
3. 개발 시작!

---

## 참고 자료

- [React Native 환경 설정 공식 문서](https://reactnative.dev/docs/environment-setup)
- [Android Studio 다운로드](https://developer.android.com/studio)
- [Android 개발자 가이드](https://developer.android.com/guide)

---

**최종 업데이트**: 2025-11-11
