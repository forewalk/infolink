# ===== Stage 1: Builder =====
FROM python:3.11-slim AS builder

WORKDIR /build

# 시스템 빌드 의존성 설치 (psycopg2-binary 빌드에 필요)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 파이썬 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ===== Stage 2: Runtime =====
FROM python:3.11-slim

WORKDIR /app

# 런타임 의존성 (PostgreSQL 클라이언트 라이브러리)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# builder에서 설치된 파이썬 패키지 복사
COPY --from=builder /install /usr/local

# 소스코드 복사
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

# 엔트리포인트 스크립트 복사
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
