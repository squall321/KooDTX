# Git 브랜치 전략 및 워크플로우

## 브랜치 구조

### 주요 브랜치

- **`main`**: 프로덕션 배포 가능한 안정적인 코드
- **`develop`**: 개발 중인 최신 기능들이 통합되는 브랜치
- **`feature/*`**: 새로운 기능 개발
- **`bugfix/*`**: 버그 수정
- **`hotfix/*`**: 긴급 프로덕션 버그 수정
- **`release/*`**: 릴리스 준비

### 브랜치 네이밍 규칙

```
feature/phase-001-git-setup
feature/phase-072-accelerometer-sensor
bugfix/fix-sync-issue
hotfix/critical-crash-fix
release/v1.0.0
```

## 워크플로우

### 1. 새 기능 개발

```bash
# develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 기능 브랜치 생성
git checkout -b feature/phase-XXX-feature-name

# 작업 후 커밋
git add .
git commit -m "feat: Add feature description"

# develop에 병합
git checkout develop
git merge feature/phase-XXX-feature-name

# 원격 저장소 푸시
git push origin develop
```

### 2. 버그 수정

```bash
# develop 또는 main에서 시작
git checkout develop
git checkout -b bugfix/fix-description

# 작업 후 커밋
git add .
git commit -m "fix: Fix bug description"

# develop에 병합
git checkout develop
git merge bugfix/fix-description
```

### 3. 릴리스

```bash
# develop에서 릴리스 브랜치 생성
git checkout develop
git checkout -b release/v1.0.0

# 버전 번호 업데이트, 최종 테스트
# package.json, README.md 등 업데이트

git add .
git commit -m "chore: Prepare release v1.0.0"

# main에 병합
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# develop에도 병합 (릴리스 준비 사항 반영)
git checkout develop
git merge release/v1.0.0

# 푸시
git push origin main --tags
git push origin develop
```

### 4. 핫픽스

```bash
# main에서 핫픽스 브랜치 생성
git checkout main
git checkout -b hotfix/critical-bug-fix

# 긴급 수정
git add .
git commit -m "hotfix: Fix critical bug"

# main에 병합
git checkout main
git merge hotfix/critical-bug-fix
git tag -a v1.0.1 -m "Hotfix version 1.0.1"

# develop에도 병합
git checkout develop
git merge hotfix/critical-bug-fix

# 푸시
git push origin main --tags
git push origin develop
```

## 커밋 메시지 규칙

### Conventional Commits 형식 사용

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 종류

- **feat**: 새로운 기능
- **fix**: 버그 수정
- **docs**: 문서 변경
- **style**: 코드 포맷팅 (기능 변경 없음)
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 프로세스, 도구 설정 등
- **perf**: 성능 개선

### 예시

```
feat(sensor): Add accelerometer data collection

Implemented high-frequency accelerometer data collection
with 200Hz sampling rate and buffering system.

Closes #123
```

```
fix(sync): Resolve offline queue processing issue

Fixed bug where sync queue items were not properly
retried after network recovery.

Fixes #456
```

## Pull Request 규칙

### PR 제목

```
[Phase XXX] Feature/Fix description
```

### PR 템플릿

```markdown
## 변경 사항

- 주요 변경 내용 요약

## 관련 Phase

- Phase XXX: Phase 이름

## 테스트

- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 수동 테스트 완료

## 스크린샷 (해당하는 경우)

## 체크리스트

- [ ] 코드 린트 통과
- [ ] 문서 업데이트
- [ ] PROGRESS.md 업데이트
```

## 태그 규칙

### 버전 태그

- **메이저 버전**: `v1.0.0` - 주요 기능 변경, 호환성 깨짐
- **마이너 버전**: `v1.1.0` - 새 기능 추가, 하위 호환
- **패치 버전**: `v1.1.1` - 버그 수정

### Phase 태그 (선택)

```bash
git tag -a phase-001-complete -m "Phase 1: Git setup completed"
git tag -a phase-050-complete -m "Phase 50: Celery tasks completed"
```

## Git 설정

### 로컬 설정

```bash
# 사용자 정보
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 기본 에디터
git config core.editor "vim"

# 자동 CRLF 변환 (Windows)
git config core.autocrlf true

# Git 별칭
git config alias.co checkout
git config alias.br branch
git config alias.ci commit
git config alias.st status
```

### .gitattributes

```
# 텍스트 파일 LF 사용
* text=auto eol=lf

# Windows 스크립트는 CRLF
*.bat text eol=crlf

# 바이너리 파일
*.png binary
*.jpg binary
*.pdf binary
```

## 협업 규칙

1. **항상 최신 코드 pull 후 작업 시작**
2. **작은 단위로 자주 커밋**
3. **의미 있는 커밋 메시지 작성**
4. **기능 완성 전 WIP 커밋 시 `WIP:` 접두사 사용**
5. **코드 리뷰 후 병합**
6. **병합 충돌 해결 후 테스트**

## 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**최종 업데이트**: 2025-11-11
