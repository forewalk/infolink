# Docker 컨테이너 배포 - 개발 계획서

**작성일:** 2026-01-28
**상태:** 승인 대기

---

## 1. 생성/수정할 파일 목록

| # | 파일 경로 | 유형 | 설명 |
|---|----------|------|------|
| 1 | `backend/Dockerfile` | 신규 | FastAPI 백엔드 이미지 빌드 |
| 2 | `backend/entrypoint.sh` | 신규 | Alembic 마이그레이션 + Uvicorn 시작 스크립트 |
| 3 | `backend/.dockerignore` | 신규 | 불필요 파일 제외 |
| 4 | `frontend/Dockerfile` | 신규 | React 빌드 → Nginx 서빙 이미지 |
| 5 | `frontend/nginx.conf` | 신규 | Nginx 설정 (SPA fallback + API 프록시) |
| 6 | `frontend/.dockerignore` | 신규 | 불필요 파일 제외 |
| 7 | `docker-compose.yml` | 신규 | 프론트엔드 + 백엔드 오케스트레이션 |
| 8 | `.env.production.example` | 신규 | 프로덕션 환경변수 템플릿 |
| 9 | `scripts/build.sh` | 신규 | 이미지 빌드 + tar 패키징 |
| 10 | `scripts/deploy.sh` | 신규 | 대상 서버 로드 + 기동 |
| 11 | `docs/DEPLOY.md` | 신규 | 배포 가이드 문서 |

---

## 2. 파일별 상세 설계

### 2-1. `backend/Dockerfile`

멀티 스테이지 빌드:

**Stage 1 (builder):**
- Base: `python:3.11-slim`
- `requirements.txt` 복사 → `pip install --no-cache-dir`
- 소스코드(`app/`, `alembic/`, `alembic.ini`) 복사

**Stage 2 (runtime):**
- Base: `python:3.11-slim`
- 시스템 패키지: `libpq5` (psycopg2 런타임 의존성)
- builder에서 site-packages 복사
- 소스코드 복사 (`app/`, `alembic/`, `alembic.ini`)
- `entrypoint.sh` 복사
- 비밀 정보는 이미지에 포함하지 않음 (`.env`는 런타임에 마운트)
- `EXPOSE 8000`
- `ENTRYPOINT ["./entrypoint.sh"]`

**의존성 추가:**
- `psycopg2-binary` → Alembic 마이그레이션이 동기 DB 드라이버 필요
- `requirements.txt`에 추가하거나 Dockerfile에서 별도 설치

> **결정: `requirements.txt`에 `psycopg2-binary==2.9.9` 추가**
> 이유: 로컬 개발에서도 마이그레이션 실행에 필요할 수 있으며, 의존성 목록을 한 곳에서 관리

### 2-2. `backend/entrypoint.sh`

```bash
#!/bin/bash
set -e

# 1. Alembic 마이그레이션 실행
echo "Running database migrations..."
alembic upgrade head

# 2. Uvicorn 시작
echo "Starting Uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

- `exec`로 PID 1을 uvicorn에 넘겨 시그널 전달 보장
- `--workers 2`: 프로덕션 환경에서 최소 워커 수 (서버 사양에 따라 조정)

### 2-3. `backend/.dockerignore`

```
.env
.env.*
__pycache__
*.pyc
.pytest_cache
tests/
scripts/
.git
.vscode
```

### 2-4. `frontend/Dockerfile`

멀티 스테이지 빌드:

**Stage 1 (build):**
- Base: `node:18-alpine`
- `package.json`, `package-lock.json` 복사 → `npm ci`
- 전체 소스 복사 → `npm run build` (출력: `dist/`)

**Stage 2 (runtime):**
- Base: `nginx:1.25-alpine`
- build 스테이지에서 `dist/` → `/usr/share/nginx/html/` 복사
- `nginx.conf` → `/etc/nginx/conf.d/default.conf` 복사
- `EXPOSE 80`

> **참고**: 프론트엔드 빌드 시 `VITE_API_URL` 환경변수는 **불필요**
> Nginx가 `/api/*`를 백엔드로 프록시하므로, 프론트엔드는 상대경로(`/api/v1/...`)로 요청
> → 현재 `services/api.ts`에서 이미 상대경로 사용 가능 여부 확인 필요 (아래 3번 참조)

### 2-5. `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA 라우팅: 존재하지 않는 경로는 index.html로 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 리버스 프록시
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

- `backend`는 docker-compose 서비스 이름으로 해석됨

### 2-6. `frontend/.dockerignore`

```
node_modules
dist
.env
.env.*
.vite
figma
.git
.vscode
```

### 2-7. `docker-compose.yml`

```yaml
services:
  frontend:
    image: infolink-frontend:latest
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  backend:
    image: infolink-backend:latest
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    extra_hosts:
      - "host.docker.internal:host-gateway"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped
```

**핵심 설계:**
- PostgreSQL 컨테이너 없음 (호스트에 직접 설치됨)
- `extra_hosts: ["host.docker.internal:host-gateway"]` → 백엔드 컨테이너에서 호스트 DB 접속 가능
- `.env.production`의 `DATABASE_URL`에서 호스트를 `host.docker.internal`로 설정
- `healthcheck`로 backend 준비 완료 후 frontend 시작
- `curl`이 backend 이미지에 필요 → Dockerfile에서 설치 또는 python으로 대체

> **healthcheck 대안**: curl 대신 python 사용
> `test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]`
> → 추가 패키지 설치 불필요

### 2-8. `.env.production.example`

```env
# 데이터베이스 (호스트 PostgreSQL 접속)
# host.docker.internal은 Docker 컨테이너에서 호스트 머신을 가리킴
DATABASE_URL=postgresql+asyncpg://infolink:YOUR_PASSWORD@host.docker.internal:5432/infolink

# JWT
SECRET_KEY=CHANGE-THIS-TO-RANDOM-64-CHAR-STRING
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# 서버
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

### 2-9. `scripts/build.sh`

```bash
#!/bin/bash
set -e

VERSION=${1:-latest}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Infolink Docker 이미지 빌드 ==="
echo "버전: $VERSION"

cd "$PROJECT_DIR"

# 1. Docker 이미지 빌드
docker compose build

# 2. 이미지 태그 지정 (버전 태깅)
docker tag infolink-frontend:latest infolink-frontend:$VERSION
docker tag infolink-backend:latest infolink-backend:$VERSION

# 3. tar 파일로 내보내기
OUTPUT_DIR="$PROJECT_DIR/dist"
mkdir -p "$OUTPUT_DIR"

echo "이미지를 tar 파일로 내보내는 중..."
docker save infolink-frontend:$VERSION infolink-backend:$VERSION \
  | gzip > "$OUTPUT_DIR/infolink-images-$VERSION.tar.gz"

# 4. docker-compose.yml과 환경변수 템플릿도 복사
cp "$PROJECT_DIR/docker-compose.yml" "$OUTPUT_DIR/"
cp "$PROJECT_DIR/.env.production.example" "$OUTPUT_DIR/"

echo ""
echo "=== 빌드 완료 ==="
echo "배포 파일 위치: $OUTPUT_DIR/"
ls -lh "$OUTPUT_DIR/"
echo ""
echo "배포 서버에 다음 파일들을 전달하세요:"
echo "  1. infolink-images-$VERSION.tar.gz"
echo "  2. docker-compose.yml"
echo "  3. .env.production.example → .env.production으로 복사 후 수정"
```

### 2-10. `scripts/deploy.sh`

```bash
#!/bin/bash
set -e

VERSION=${1:-latest}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Infolink Docker 배포 ==="

cd "$DEPLOY_DIR"

# 1. 환경변수 파일 확인
if [ ! -f ".env.production" ]; then
  echo "오류: .env.production 파일이 없습니다."
  echo ".env.production.example을 복사하여 .env.production을 생성하세요."
  exit 1
fi

# 2. Docker 이미지 로드
IMAGE_FILE="infolink-images-$VERSION.tar.gz"
if [ -f "$IMAGE_FILE" ]; then
  echo "Docker 이미지 로드 중: $IMAGE_FILE"
  docker load < "$IMAGE_FILE"
else
  echo "경고: $IMAGE_FILE 파일이 없습니다. 기존 이미지를 사용합니다."
fi

# 3. 기존 컨테이너 중지
echo "기존 컨테이너 중지..."
docker compose down || true

# 4. 컨테이너 시작
echo "컨테이너 시작..."
docker compose up -d

# 5. 상태 확인
echo ""
echo "=== 배포 완료 ==="
docker compose ps
echo ""
echo "서비스 확인:"
echo "  프론트엔드: http://localhost:80"
echo "  백엔드 API: http://localhost:8000"
echo "  헬스체크:   http://localhost:8000/health"
```

### 2-11. `docs/DEPLOY.md`

배포 가이드 문서:
- 사전 요구사항 (Docker Engine, Docker Compose, PostgreSQL)
- 개발 PC에서 빌드하는 법
- 파일 전달 방법
- 서버에서 배포하는 법
- 환경변수 설정 가이드
- 트러블슈팅 FAQ

---

## 3. 코드 수정 사항

### 3-1. `backend/requirements.txt` 수정

추가:
```
psycopg2-binary==2.9.9
```

이유: Alembic 마이그레이션이 동기 psycopg2 드라이버를 필요로 함 (`alembic/env.py`에서 `+asyncpg` → `+psycopg2` 변환)

### 3-2. 프론트엔드 API 클라이언트 확인

현재 `services/api.ts`에서 API base URL이 `VITE_API_URL` 환경변수 또는 상대경로를 사용하는지 확인 필요.

- **상대경로 사용 중이면**: 변경 불필요 (Nginx 프록시가 처리)
- **절대 URL 사용 중이면**: 상대경로로 변경하거나 빌드 시 환경변수 주입

### 3-3. `backend/app/main.py` CORS 수정

프로덕션에서는 Nginx가 프록시하므로 CORS가 필수는 아니나, 현재 `allow_origins=["*"]` 설정 유지.
`DEBUG` 환경변수에 따라 CORS 설정을 분기하면 좋으나, 현재 범위에서는 변경하지 않음.

---

## 4. 구현 순서

| 순서 | 작업 | 의존성 |
|------|------|--------|
| 1 | `backend/requirements.txt`에 psycopg2-binary 추가 | 없음 |
| 2 | `backend/.dockerignore` 생성 | 없음 |
| 3 | `backend/entrypoint.sh` 생성 | 없음 |
| 4 | `backend/Dockerfile` 생성 | 1, 2, 3 |
| 5 | `frontend/.dockerignore` 생성 | 없음 |
| 6 | `frontend/nginx.conf` 생성 | 없음 |
| 7 | 프론트엔드 API 클라이언트 확인/수정 | 없음 |
| 8 | `frontend/Dockerfile` 생성 | 5, 6 |
| 9 | `.env.production.example` 생성 | 없음 |
| 10 | `docker-compose.yml` 생성 | 4, 8, 9 |
| 11 | `scripts/build.sh` 생성 | 10 |
| 12 | `scripts/deploy.sh` 생성 | 10 |
| 13 | `docs/DEPLOY.md` 작성 | 전체 |
| 14 | 로컬 빌드 테스트 | 11 |

---

## 5. 이미지 크기 최적화 전략

| 전략 | 적용 대상 | 효과 |
|------|----------|------|
| 멀티 스테이지 빌드 | backend, frontend | 빌드 도구 미포함 |
| python:3.11-slim | backend | ~150MB vs ~900MB (full) |
| node:18-alpine (빌드만) | frontend | 런타임에 Node 미포함 |
| nginx:1.25-alpine | frontend | ~40MB |
| .dockerignore | 양쪽 | 불필요 파일 제외 |
| --no-cache-dir (pip) | backend | pip 캐시 미포함 |
| npm ci (빌드만) | frontend | 런타임에 node_modules 미포함 |

**예상 이미지 크기:**
- backend: ~150-180MB (Python 3.11-slim + 패키지)
- frontend: ~30-40MB (Nginx Alpine + 빌드 결과물)

---

## 6. 검증 계획

1. `docker compose build` 성공 확인
2. `docker compose up -d` 후 서비스 응답 확인
3. `http://localhost` 접속 → 로그인 페이지 표시
4. `/api/v1/ping` 응답 확인
5. 로그인 → 게시판 기능 정상 동작
6. `scripts/build.sh` 실행 → tar.gz 파일 생성 확인
7. `docker compose down` → `docker compose up -d` → 데이터 유지 확인
8. 이미지 크기 확인 (backend <200MB, frontend <50MB)
