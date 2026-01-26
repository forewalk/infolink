# Git 작업 가이드

이 문서는 infolink 프로젝트의 Git 작업 가이드입니다.

## Git 설정

### 초기 설정

```bash
# Git 버전 확인
git --version

# 사용자 정보 설정
git config --global user.name "zhenya"
git config --global user.email "forewalk@naver.com"
```

### SSH 키 생성 (GitHub 접근용)

```bash
# SSH 키 생성
ssh-keygen -t ed25519

# 공개키 확인 (GitHub에 등록)
cat ~/.ssh/id_ed25519.pub
```

생성된 공개키를 GitHub 설정 > SSH and GPG keys에 등록하세요.

## 저장소 접근

### 최초 클론

```bash
git clone git@github.com:forewalk/infolink.git
cd infolink
```

### 브랜치 구조

- `main` - 프로덕션 브랜치 (배포용)
- `develop` - 개발 브랜치 (기본 작업 브랜치)
- `feature/{feature-name}` - 기능 개발 브랜치

## 일반적인 작업 순서

### 1. 작업 시작 전

```bash
# develop 브랜치로 이동
git checkout develop

# 최신 코드 받기
git pull origin develop
```

### 2. 새 기능 개발 시작

```bash
# develop에서 새 기능 브랜치 생성
git checkout -b feature/{feature-name}

# 예시
git checkout -b feature/user-authentication
git checkout -b feature/product-list
```

### 3. 작업 중

```bash
# 변경사항 확인
git status

# 변경된 파일 확인
git diff

# 특정 파일 변경사항 확인
git diff backend/app/models/user.py
```

### 4. 커밋하기

```bash
# 변경된 파일 스테이징
git add .

# 또는 특정 파일만
git add backend/app/models/user.py
git add backend/app/schemas/user.py

# 커밋
git commit -m "feat: 사용자 인증 모델 추가"

# 또는 상세한 커밋 메시지
git commit -m "feat: 사용자 인증 기능 구현

- User 모델 추가 (SQLAlchemy)
- UserCreate/UserResponse 스키마 정의
- JWT 토큰 생성 로직 구현"
```

### 커밋 메시지 컨벤션

```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 업무, 패키지 설치 등

# 예시
git commit -m "feat: 사용자 로그인 API 추가"
git commit -m "fix: 토큰 만료 시간 오류 수정"
git commit -m "docs: API 문서 업데이트"
git commit -m "refactor: Repository 레이어 분리"
git commit -m "test: User Service 단위 테스트 추가"
git commit -m "chore: FastAPI 버전 업데이트"
```

### 5. 원격 저장소에 푸시

```bash
# 처음 푸시할 때 (-u로 upstream 설정)
git push -u origin feature/{feature-name}

# 이후 푸시
git push
```

### 6. 기능 개발 완료 후

```bash
# develop 브랜치로 이동
git checkout develop

# 최신 코드 받기
git pull origin develop

# 기능 브랜치 병합
git merge feature/{feature-name}

# develop 브랜치 푸시
git push origin develop

# 필요시 기능 브랜치 삭제
git branch -d feature/{feature-name}
```

## Pull Request 생성 (권장)

로컬에서 직접 병합하는 대신 GitHub에서 Pull Request를 생성하는 것을 권장합니다:

```bash
# 기능 브랜치 푸시
git push -u origin feature/{feature-name}

# GitHub에서 Pull Request 생성
# Base: develop ← Compare: feature/{feature-name}
```

## 자주 사용하는 명령어

### 상태 확인

```bash
# 현재 상태 확인
git status

# 브랜치 목록 확인
git branch

# 원격 브랜치 포함 모든 브랜치 확인
git branch -a

# 최근 커밋 로그 확인
git log --oneline -10

# 특정 파일의 변경 이력
git log --follow backend/app/main.py
```

### 변경사항 관리

```bash
# 변경사항 임시 저장 (stash)
git stash

# stash 목록 확인
git stash list

# stash 복원
git stash pop

# 특정 파일 변경 취소
git checkout -- filename

# 스테이징 취소
git reset HEAD filename
```

### 브랜치 관리

```bash
# 브랜치 생성
git branch feature/new-feature

# 브랜치 이동
git checkout feature/new-feature

# 브랜치 생성과 동시에 이동
git checkout -b feature/new-feature

# 브랜치 삭제
git branch -d feature/old-feature

# 원격 브랜치 삭제
git push origin --delete feature/old-feature
```

### 원격 저장소 관리

```bash
# 원격 저장소 확인
git remote -v

# 원격 저장소 최신 정보 가져오기
git fetch origin

# 원격 브랜치 목록 확인
git branch -r
```

## 충돌 해결

### 충돌 발생 시

```bash
# 1. 충돌 발생한 파일 확인
git status

# 2. 충돌 파일 수동 편집
# <<<<<<< HEAD
# 현재 브랜치 내용
# =======
# 병합하려는 브랜치 내용
# >>>>>>> feature/branch
# 위 마커를 제거하고 올바른 내용으로 수정

# 3. 충돌 해결 후 스테이징
git add conflicted-file.py

# 4. 병합 완료
git commit -m "merge: feature 브랜치 병합 및 충돌 해결"
```

## 특수 상황

### 실수로 잘못된 브랜치에서 작업한 경우

```bash
# 현재 변경사항 임시 저장
git stash

# 올바른 브랜치로 이동
git checkout correct-branch

# 변경사항 복원
git stash pop
```

### 최근 커밋 수정

```bash
# 마지막 커밋 메시지 수정
git commit --amend -m "새로운 커밋 메시지"

# 마지막 커밋에 파일 추가
git add forgotten-file.py
git commit --amend --no-edit

# ⚠️ 주의: 이미 push한 커밋은 amend 하지 마세요!
```

### 커밋 되돌리기

```bash
# 마지막 커밋 취소 (변경사항은 유지)
git reset --soft HEAD~1

# 마지막 커밋 취소 (변경사항도 제거)
git reset --hard HEAD~1

# ⚠️ 주의: --hard는 복구 불가능하니 신중히 사용!
```

## 워크플로우와 Git 작업 통합

### 9단계 워크플로우 사용 시

```bash
# 1. 기능 시작
git checkout develop
git pull origin develop
git checkout -b feature/email-verification

# 2-5. 기획 및 계획 단계 (문서 작업)
git add docs/workflows/email-verification/
git commit -m "docs: 이메일 인증 기획서 및 개발 계획 완료"
git push

# 6. 구현 단계
# 구현하면서 자주 커밋
git add backend/app/models/verification.py
git commit -m "feat: 이메일 인증 모델 추가"

git add backend/app/services/email.py
git commit -m "feat: 이메일 발송 서비스 구현"

# 7. 테스트 통과 후
git add tests/
git commit -m "test: 이메일 인증 테스트 추가"

# 8-9. 문서 완료 후
git add docs/workflows/email-verification/9_*
git commit -m "docs: 이메일 인증 기술 문서 완료"

# 10. develop 브랜치로 병합
git checkout develop
git pull origin develop
git merge feature/email-verification
git push origin develop
```

## 도움말

### Git 명령어 도움말

```bash
# 특정 명령어 도움말
git help commit
git help branch
git help merge
```

### 문제 발생 시

1. `git status` - 현재 상태 확인
2. `git log` - 커밋 이력 확인
3. `git diff` - 변경사항 확인
4. 모르겠으면 팀원에게 문의

## 참고 문서

- [CLAUDE.md](./CLAUDE.md) - 전체 개발 가이드
- [README.md](./README.md) - 프로젝트 개요
- [workflow/workflow_templates/WORKFLOW_GUIDE.md](./workflow/workflow_templates/WORKFLOW_GUIDE.md) - 워크플로우 가이드
