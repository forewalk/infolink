# Docker 컨테이너 배포 기획서

**작성일:** 2026-01-28
**작성자:** AI (Claude)
**버전:** 1.0
**상태:** 초안

---

## 1. 개요

### 1.1 목적
Infolink 애플리케이션(백엔드 + 프론트엔드)을 Docker 이미지로 빌드하여, 인터넷이 차단된 폐쇄망 온프레미스 Linux 서버에 배포할 수 있도록 한다.

### 1.2 배경
- 배포 대상 서버가 인터넷에 연결되지 않은 프라이빗 온프레미스 환경
- Docker Hub/GHCR 등 외부 Registry 사용 불가
- 개발 PC에서 빌드 → tar 파일로 전달 → 서버에서 로드하는 수동 배포 방식 채택

### 1.3 범위

**포함:**
- 백엔드(FastAPI) Dockerfile 작성
- 프론트엔드(React/Vite) Dockerfile 작성 (Nginx로 서빙)
- docker-compose.yml 작성 (백엔드 + 프론트엔드 + PostgreSQL)
- 빌드/배포 스크립트 (`scripts/build.sh`, `scripts/deploy.sh`)
- 환경변수 관리 (`.env.production` 템플릿)
- 배포 가이드 문서

**제외:**
- CI/CD 자동화 파이프라인 (수동 빌드)
- 외부 Registry 구축
- SSL/TLS 인증서 설정 (추후 별도 진행)
- 모니터링/로깅 시스템 (추후 별도 진행)

---

## 2. 요구사항

### 2.1 기능 요구사항

#### 필수 기능 (Must Have)
1. `docker build`로 백엔드/프론트엔드 이미지 빌드
2. `docker save`로 이미지를 `.tar` 파일로 내보내기
3. `docker load`로 대상 서버에서 이미지 로드
4. `docker compose up -d`로 전체 서비스 기동
5. PostgreSQL 컨테이너 포함 (데이터 볼륨 영속화)
6. Alembic 마이그레이션 자동 실행 (컨테이너 시작 시)

#### 선택 기능 (Should Have)
1. 멀티 스테이지 빌드로 이미지 크기 최소화
2. 헬스체크 엔드포인트 설정
3. 한 번에 빌드+패키징하는 스크립트

#### 향후 고려사항 (Nice to Have)
1. Nginx 리버스 프록시 통합 (SSL 포함)
2. 로그 수집 (ELK/Loki 등)
3. 이미지 버전 태깅 자동화

### 2.2 비기능 요구사항

#### 보안
- DB 비밀번호, JWT 시크릿 등은 `.env` 파일로 관리 (이미지에 포함 금지)
- 프로덕션 이미지에 소스코드 미포함 (빌드 결과물만 포함)

#### 이식성
- 인터넷 없는 환경에서 `docker load` + `docker compose up`만으로 기동 가능
- 대상 서버 요구사항: Docker Engine + Docker Compose만 설치되어 있으면 됨

---

## 3. 아키텍처

### 3.1 컨테이너 구성

```
┌──────────────────────────────────────────────┐
│           Host (Rocky Linux 9.7)             │
│                                              │
│  ┌──────────┐  ┌──────────┐                  │
│  │ frontend │  │ backend  │   ┌───────────┐  │
│  │ (Nginx)  │  │ (Uvicorn)│   │ PostgreSQL│  │
│  │ :80      │  │ :8000    │──►│ (호스트)  │  │
│  └────┬─────┘  └────┬─────┘   │ :5432     │  │
│       │              │         └───────────┘  │
│       └── docker network ──┘   (Docker 외부)  │
└──────────────────────────────────────────────┘
```

> PostgreSQL은 호스트에 직접 설치되어 운영. Docker 컨테이너로 관리하지 않음.
> backend 컨테이너에서 `host.docker.internal` 또는 호스트 IP로 DB 접속.

### 3.2 빌드/배포 흐름

```
개발 PC (인터넷 가능)              배포 서버 (폐쇄망)
─────────────────────           ─────────────────────
1. docker compose build         4. docker load < images.tar
2. docker save → images.tar     5. .env.production 설정
3. tar 파일 전달 ────────────►  6. docker compose up -d
   (USB/공유폴더/OneDrive)      7. alembic upgrade head (자동)
```

### 3.3 포트 매핑

| 서비스 | 컨테이너 내부 | 호스트 노출 |
|--------|-------------|------------|
| frontend (Nginx) | 80 | 80 |
| backend (Uvicorn) | 8000 | 8000 |

### 3.4 Nginx 역할
- `/` → 프론트엔드 정적 파일 서빙
- `/api/*` → backend 컨테이너로 리버스 프록시

---

## 4. 생성할 파일 목록

| 파일 | 역할 |
|------|------|
| `backend/Dockerfile` | FastAPI 이미지 빌드 (멀티 스테이지) |
| `frontend/Dockerfile` | React 빌드 → Nginx 서빙 (멀티 스테이지) |
| `frontend/nginx.conf` | Nginx 설정 (SPA fallback + API 프록시) |
| `docker-compose.yml` | 프론트엔드 + 백엔드 오케스트레이션 |
| `.env.production.example` | 프로덕션 환경변수 템플릿 |
| `scripts/build.sh` | 이미지 빌드 + tar 패키징 스크립트 |
| `scripts/deploy.sh` | 대상 서버에서 로드 + 기동 스크립트 |
| `docs/DEPLOY.md` | 배포 가이드 문서 |

---

## 5. 성공 기준

### 5.1 완료 조건
- [ ] `docker compose build`로 백엔드/프론트엔드 이미지 빌드 성공
- [ ] `scripts/build.sh` 실행 시 `.tar` 파일 생성
- [ ] 대상 서버에서 `docker load` + `docker compose up -d`로 전체 서비스 기동
- [ ] 브라우저에서 로그인/게시판 기능 정상 동작
- [ ] DB 데이터가 컨테이너 재시작 후에도 유지됨

### 5.2 측정 지표
- 백엔드 이미지 크기 200MB 이하
- 프론트엔드 이미지 크기 50MB 이하
- `docker compose up -d` 후 30초 내 서비스 응답

---

## 6. 우선순위

- [x] P1 - 높음

---

## 질문 및 미결정 사항

1. 배포 서버의 OS 및 Docker 버전은?
   - Rocky Linux 9.7
2. PostgreSQL 데이터 백업 정책은?
   - 이건 네가 신경쓰지 않아도 되. DB관해서는 직접 서버에 깔려있고, 알아서 백업 및 lifecycle을 가져갈 예정이야.
3. 프론트엔드와 백엔드를 하나의 컨테이너로 합칠 것인지, 분리할 것인지? (현재 계획: 분리)
   - 분리하자.
   
