#!/bin/bash
set -e

# Alembic 마이그레이션 실행
echo "데이터베이스 마이그레이션 실행 중..."
alembic upgrade head
echo "마이그레이션 완료."

# Uvicorn 시작
echo "Uvicorn 서버 시작..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
