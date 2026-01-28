#!/bin/bash
# Infolink Docker 배포 스크립트
# 배포 서버에서 실행
# 사용법: ./deploy.sh [버전태그]
# 예시: ./deploy.sh 1.0.0
set -e

VERSION=${1:-latest}
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==========================================="
echo " Infolink Docker 배포"
echo " 버전: $VERSION"
echo "==========================================="
echo ""

cd "$DEPLOY_DIR"

# 1. 환경변수 파일 확인
if [ ! -f ".env.production" ]; then
  echo "오류: .env.production 파일이 없습니다."
  echo ""
  echo "다음 명령어로 생성하세요:"
  echo "  cp .env.production.example .env.production"
  echo "  vi .env.production  # 값을 수정하세요"
  exit 1
fi

# 2. docker-compose.yml 확인
if [ ! -f "docker-compose.yml" ]; then
  echo "오류: docker-compose.yml 파일이 없습니다."
  exit 1
fi

# 3. Docker 이미지 로드
IMAGE_FILE="infolink-images-$VERSION.tar.gz"
if [ -f "$IMAGE_FILE" ]; then
  echo "[1/3] Docker 이미지 로드 중: $IMAGE_FILE"
  docker load < "$IMAGE_FILE"
  echo "이미지 로드 완료."
else
  echo "[1/3] $IMAGE_FILE 파일이 없습니다. 기존 로드된 이미지를 사용합니다."
fi

# 4. 기존 컨테이너 중지
echo "[2/3] 기존 컨테이너 중지..."
docker compose down 2>/dev/null || true

# 5. 컨테이너 시작
echo "[3/3] 컨테이너 시작..."
docker compose up -d

# 6. 상태 확인
echo ""
echo "==========================================="
echo " 배포 완료!"
echo "==========================================="
echo ""
docker compose ps
echo ""
echo "서비스 주소:"
echo "  프론트엔드:  http://localhost"
echo "  백엔드 API:  http://localhost:8000"
echo "  헬스체크:    http://localhost:8000/health"
echo ""
echo "로그 확인: docker compose logs -f"
