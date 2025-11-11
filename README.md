# KooDTX

> React Native Local-First 센서 데이터 수집 애플리케이션 (오디오 포함)

![Version](https://img.shields.io/badge/version-0.1.0--dev-blue)
![Platform](https://img.shields.io/badge/platform-Android-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## 📱 프로젝트 개요

KooDTX는 스마트폰의 다양한 센서 데이터와 오디오를 수집하여 연구 및 분석 목적으로 활용할 수 있는 React Native 기반 크로스플랫폼 애플리케이션입니다.

### 주요 특징

- ✨ **Local-First 아키텍처**: 오프라인에서도 완전히 동작
- 🔄 **자동 동기화**: 온라인 연결 시 Flask 서버로 데이터 자동 업로드
- 📊 **다중 센서 지원**: 가속도계, 자이로스코프, GPS 등
- 🎵 **오디오 수집**: 고품질 오디오 녹음 (44.1kHz)
- 💾 **로컬 데이터베이스**: WatermelonDB를 활용한 빠른 데이터 관리
- 📁 **JSON 데이터 포맷**: 표준화된 데이터 형식
- 🔒 **프라이버시 우선**: 사용자가 데이터를 완전히 제어

## 🏗️ 기술 스택

### Frontend (React Native App)
- React Native 0.73+
- TypeScript 5.0+
- WatermelonDB (로컬 데이터베이스)
- Zustand (상태 관리)
- React Navigation 6
- React Native Paper (UI)

### Backend (Flask Sync Server)
- Flask 3.0+
- Python 3.11+
- PostgreSQL 15+
- Redis
- Celery (비동기 작업)
- Nginx + Gunicorn

### 인프라
- 온프레미스 우분투 서버 (22.04 LTS)
- Let's Encrypt SSL
- Docker (선택)

## 📋 요구사항

### 개발 환경
- Node.js 20.x LTS
- npm 또는 yarn
- Android Studio + Android SDK
- Java JDK 17
- Git

### 서버 환경
- Ubuntu Server 22.04 LTS
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- 최소 2GB RAM, 20GB 저장공간

## 🚀 시작하기

> **주의**: 현재 개발 초기 단계입니다. 아래 명령어는 아직 실행되지 않을 수 있습니다.

### 1. 저장소 클론

```bash
git clone https://github.com/squall321/KooDTX.git
cd KooDTX
```

### 2. 의존성 설치

```bash
# React Native 앱
npm install

# Flask 서버 (서버 디렉토리에서)
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. 앱 실행

```bash
# Android
npm run android

# iOS (추후 지원)
npm run ios
```

## 📖 문서

- [상세 개발 계획](./detailed_phases_plan.json) - 300개 Phase 개발 로드맵
- [아키텍처 문서](./REACT_NATIVE_LOCAL_FIRST_ARCHITECTURE_PLAN.md) - Local-First 설계
- [진행 상황](./PROGRESS.md) - 개발 진행도 추적

## 🗂️ 프로젝트 구조

```
KooDTX/
├── android/                 # Android 네이티브 코드
├── ios/                     # iOS 네이티브 코드 (추후)
├── src/                     # React Native 소스 코드
│   ├── api/                 # API 클라이언트
│   ├── components/          # 재사용 가능 컴포넌트
│   ├── database/            # WatermelonDB 설정
│   ├── hooks/               # Custom React Hooks
│   ├── navigation/          # 네비게이션
│   ├── screens/             # 화면 컴포넌트
│   ├── services/            # 비즈니스 로직
│   ├── store/               # 상태 관리
│   └── utils/               # 유틸리티 함수
├── server/                  # Flask 백엔드 서버
│   ├── app/                 # Flask 애플리케이션
│   ├── migrations/          # 데이터베이스 마이그레이션
│   └── tests/               # 서버 테스트
├── docs/                    # 추가 문서
└── __tests__/               # 앱 테스트

```

## 🔬 센서 데이터 수집

### 지원 센서
- **가속도계** (Accelerometer): 200-400Hz
- **자이로스코프** (Gyroscope): 200-400Hz
- **지자기계** (Magnetometer): 50Hz
- **GPS**: 1Hz
- **오디오**: 44.1kHz (Mono/Stereo)

### 데이터 형식
- 센서 데이터: JSON Lines (.jsonl)
- 오디오: WAV (PCM) 또는 압축 포맷
- 메타데이터: JSON

## 🔐 보안 및 프라이버시

- 모든 데이터는 기본적으로 로컬에 저장
- 사용자가 명시적으로 동기화 허용 시에만 서버로 전송
- HTTPS/TLS 암호화 통신
- JWT 기반 인증
- 민감한 데이터 암호화 (선택)

## 🤝 기여하기

현재 초기 개발 단계로 외부 기여는 받지 않고 있습니다. 프로젝트가 안정화되면 기여 가이드를 추가할 예정입니다.

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 👨‍💻 개발자

- **squall321** - [GitHub](https://github.com/squall321)

## 📊 개발 현황

- **현재 버전**: v0.1.0-dev
- **Phase 진행**: 1/300 (0.3%)
- **예상 완료**: 2026년 10월

자세한 진행 상황은 [PROGRESS.md](./PROGRESS.md)를 참조하세요.

## 🙏 감사의 글

- [React Native](https://reactnative.dev/)
- [WatermelonDB](https://watermelondb.dev/)
- [Flask](https://flask.palletsprojects.com/)

---

**최종 업데이트**: 2025-11-11
