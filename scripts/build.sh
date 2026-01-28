#!/bin/bash
# Infolink Docker 이미지 빌드 및 패키징 스크립트
# 사용법: ./scripts/build.sh [버전태그]
# 예시: ./scripts/build.sh 1.0.0
set -e

VERSION=${1:-latest}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "==========================================="
echo " Infolink Docker 이미지 빌드"
echo " 버전: $VERSION"
echo "==========================================="
echo ""

cd "$PROJECT_DIR"

# 1. Docker 이미지 빌드
echo "[1/4] Docker 이미지 빌드 중..."
docker compose build

# 2. 이미지 태그 지정
if [ "$VERSION" != "latest" ]; then
  echo "[2/4] 이미지 버전 태깅: $VERSION"
  docker tag infolink-frontend:latest infolink-frontend:"$VERSION"
  docker tag infolink-backend:latest infolink-backend:"$VERSION"
else
  echo "[2/4] 버전 태깅 생략 (latest)"
fi

# 3. tar.gz 파일로 내보내기
OUTPUT_DIR="$PROJECT_DIR/dist"
mkdir -p "$OUTPUT_DIR"

echo "[3/4] 이미지를 tar.gz 파일로 내보내는 중..."
docker save infolink-frontend:latest infolink-backend:latest \
  | gzip > "$OUTPUT_DIR/infolink-images-$VERSION.tar.gz"

# 4. 배포에 필요한 파일 복사
echo "[4/4] 배포 파일 복사 중..."
cp "$PROJECT_DIR/docker-compose.yml" "$OUTPUT_DIR/"
cp "$PROJECT_DIR/.env.production.example" "$OUTPUT_DIR/"
cp "$PROJECT_DIR/scripts/deploy.sh" "$OUTPUT_DIR/"

echo ""
echo "==========================================="
echo " 빌드 완료!"
echo "==========================================="
echo ""
echo "배포 파일 목록:"
ls -lh "$OUTPUT_DIR/"
echo ""
echo "배포 서버에 다음 파일들을 전달하세요:"
echo "  dist/infolink-images-$VERSION.tar.gz"
echo "  dist/docker-compose.yml"
echo "  dist/.env.production.example"
echo "  dist/deploy.sh"
