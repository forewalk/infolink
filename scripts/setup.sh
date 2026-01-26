#!/bin/bash

echo "🚀 Infolink 프로젝트 초기 설정을 시작합니다..."

# 백엔드 설정
echo ""
echo "📦 백엔드 설정 중..."
cd backend

# .env 파일 생성
if [ ! -f .env ]; then
    echo "📝 .env 파일 생성 중..."
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다. 필요한 값을 수정하세요."
else
    echo "⚠️  .env 파일이 이미 존재합니다."
fi

# Python 패키지 설치
echo "📦 Python 패키지 설치 중..."
pip install -r requirements.txt
pip install -r requirements-dev.txt

cd ..

# 프론트엔드 설정
echo ""
echo "📦 프론트엔드 설정 중..."
cd frontend

# .env 파일 생성
if [ ! -f .env ]; then
    echo "📝 .env 파일 생성 중..."
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다."
else
    echo "⚠️  .env 파일이 이미 존재합니다."
fi

# Node 패키지 설치
echo "📦 Node.js 패키지 설치 중..."
yarn install

cd ..

echo ""
echo "✅ 초기 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. backend/.env 파일을 열어 데이터베이스 연결 정보를 수정하세요"
echo "2. PostgreSQL 데이터베이스를 생성하세요: createdb infolink_dev"
echo "3. 백엔드 서버 실행: cd backend && uvicorn app.main:app --reload"
echo "4. 프론트엔드 서버 실행: cd frontend && yarn dev"
