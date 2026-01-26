"""
API v1 라우터 통합
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth

api_router = APIRouter()

# 엔드포인트 라우터 등록
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])


@api_router.get("/ping")
async def ping():
    """API 핑 테스트"""
    return {"message": "pong"}
