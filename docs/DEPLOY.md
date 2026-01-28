# Infolink 배포 가이드

## 개요

Infolink 애플리케이션을 Docker 이미지로 빌드하여, 인터넷이 차단된 폐쇄망 온프레미스 서버에 배포하는 절차를 설명합니다.

### 아키텍처

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

- **frontend**: Nginx 컨테이너 (정적 파일 서빙 + API 리버스 프록시)
- **backend**: Uvicorn 컨테이너 (FastAPI 앱)
- **PostgreSQL**: 호스트에 직접 설치 (Docker 외부)

---

## 1. 사전 요구사항

### 개발 PC (빌드 환경)

- Docker Engine 20.10 이상
- Docker Compose v2 이상
- Git

### 배포 서버 (대상 환경)

- OS: Rocky Linux 9.7 (또는 RHEL 호환)
- Docker Engine 20.10 이상
- Docker Compose v2 이상
- PostgreSQL (호스트에 직접 설치 및 설정 완료)

---

## 2. 빌드 (개발 PC)

### 2-1. 이미지 빌드 및 패키징

```bash
# 프로젝트 루트에서 실행
./scripts/build.sh

# 버전 태그 지정 시
./scripts/build.sh 1.0.0
```

빌드가 완료되면 `dist/` 폴더에 다음 파일들이 생성됩니다:

| 파일 | 설명 |
|------|------|
| `infolink-images-{version}.tar.gz` | Docker 이미지 아카이브 |
| `docker-compose.yml` | 컨테이너 오케스트레이션 설정 |
| `.env.production.example` | 환경변수 템플릿 |
| `deploy.sh` | 배포 스크립트 |

### 2-2. 파일 전달

생성된 `dist/` 폴더의 파일들을 배포 서버로 전달합니다.

전달 방법: USB, 공유 폴더, OneDrive 등

---

## 3. 배포 (대상 서버)

### 3-1. 파일 배치

전달받은 파일들을 배포 디렉토리에 배치합니다.

```bash
# 배포 디렉토리 생성
mkdir -p /opt/infolink
cd /opt/infolink

# 전달받은 파일 복사
cp /path/to/dist/* .
```

배포 디렉토리 구조:
```
/opt/infolink/
├── infolink-images-latest.tar.gz
├── docker-compose.yml
├── .env.production.example
└── deploy.sh
```

### 3-2. 환경변수 설정

```bash
# 템플릿 복사
cp .env.production.example .env.production

# 값 수정
vi .env.production
```

**반드시 수정해야 할 항목:**

| 변수 | 설명 | 예시 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 접속 URL | `postgresql+asyncpg://infolink:비밀번호@host.docker.internal:5432/infolink` |
| `SECRET_KEY` | JWT 시크릿 키 (64자 이상 랜덤) | `openssl rand -hex 32`로 생성 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 토큰 만료 시간(분) | `60` |

> `host.docker.internal`은 Docker 컨테이너에서 호스트 머신을 가리키는 특수 DNS 이름입니다.
> PostgreSQL이 호스트에 설치되어 있으므로 이 주소를 사용합니다.

### 3-3. PostgreSQL 설정

백엔드 컨테이너에서 호스트 PostgreSQL에 접속하려면 다음을 확인하세요:

1. **`postgresql.conf`** - 외부 접속 허용:
   ```
   listen_addresses = '*'
   ```

2. **`pg_hba.conf`** - Docker 네트워크 대역 허용 추가:
   ```
   # Docker 네트워크에서의 접속 허용
   host    infolink    infolink    172.16.0.0/12    scram-sha-256
   ```

3. PostgreSQL 재시작:
   ```bash
   sudo systemctl restart postgresql
   ```

### 3-4. 배포 실행

```bash
chmod +x deploy.sh
./deploy.sh
```

또는 수동으로:

```bash
# 이미지 로드
docker load < infolink-images-latest.tar.gz

# 컨테이너 시작
docker compose up -d
```

### 3-5. 배포 확인

```bash
# 컨테이너 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f

# 헬스체크
curl http://localhost:8000/health

# 프론트엔드 접속 확인
curl -I http://localhost
```

---

## 4. 운영

### 서비스 관리

```bash
# 컨테이너 중지
docker compose down

# 컨테이너 재시작
docker compose restart

# 로그 확인
docker compose logs -f
docker compose logs -f backend    # 백엔드만
docker compose logs -f frontend   # 프론트엔드만
```

### 업데이트 배포

1. 개발 PC에서 새 버전 빌드: `./scripts/build.sh 1.1.0`
2. `dist/` 파일들을 서버로 전달
3. 서버에서 배포: `./deploy.sh 1.1.0`
   - 기존 컨테이너 자동 중지 → 새 이미지 로드 → 재시작

### 데이터 관리

- PostgreSQL 데이터는 호스트에 직접 저장되므로 컨테이너 재시작과 무관하게 유지됩니다.
- 데이터 백업/복원은 호스트의 PostgreSQL 관리 정책을 따릅니다.

---

## 5. 트러블슈팅

### 백엔드가 DB에 연결하지 못할 때

```bash
# 1. 환경변수 확인
cat .env.production | grep DATABASE_URL

# 2. 호스트에서 PostgreSQL 실행 여부 확인
sudo systemctl status postgresql

# 3. Docker 네트워크에서 호스트 접속 테스트
docker compose exec backend python -c "
import urllib.request
urllib.request.urlopen('http://host.docker.internal:5432')
"

# 4. pg_hba.conf에 Docker 네트워크 대역 허용 확인
sudo cat /var/lib/pgsql/data/pg_hba.conf | grep docker
```

### 프론트엔드에서 API 호출 실패 시

```bash
# Nginx 로그 확인
docker compose logs frontend

# 백엔드 컨테이너 직접 접속 테스트
docker compose exec frontend curl http://backend:8000/health
```

### 컨테이너가 시작되지 않을 때

```bash
# 상세 로그 확인
docker compose logs --tail=50

# 개별 컨테이너 상태
docker compose ps -a

# 이미지가 정상 로드되었는지 확인
docker images | grep infolink
```

### 포트 충돌 시

```bash
# 80번 포트 사용 중인 프로세스 확인
sudo ss -tlnp | grep :80

# docker-compose.yml에서 포트 변경
# ports: - "8080:80"  # 80 대신 8080 사용
```
