#!/bin/bash

echo "🚀 Infolink 개발 서버를 시작합니다..."

# 백엔드 서버 시작 (백그라운드)
echo "📦 백엔드 서버 시작 중..."
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "✅ 백엔드 서버 시작됨 (PID: $BACKEND_PID)"
echo "   http://localhost:8000"
echo "   API 문서: http://localhost:8000/docs"
cd ..

# 프론트엔드 서버 시작 (백그라운드)
echo ""
echo "📦 프론트엔드 서버 시작 중..."
cd frontend
yarn dev &
FRONTEND_PID=$!
echo "✅ 프론트엔드 서버 시작됨 (PID: $FRONTEND_PID)"
echo "   http://localhost:5173"
cd ..

echo ""
echo "✅ 개발 서버가 시작되었습니다!"
echo ""
echo "종료하려면 Ctrl+C를 누르세요"

# Ctrl+C 처리
trap "echo ''; echo '🛑 서버를 종료합니다...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 프로세스 대기
wait
