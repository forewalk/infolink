"""
Auth API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse
from app.schemas.user import UserResponse
from app.services.auth import AuthService

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(
    login_request: LoginRequest,
    db: AsyncSession = Depends(get_db_session),
):
    """
    로그인

    - **email**: 이메일
    - **password**: 비밀번호

    Returns:
        access_token, token_type, user 정보
    """
    auth_service = AuthService(db)
    result = await auth_service.login(login_request.email, login_request.password)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token, user = result
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    현재 로그인한 사용자 정보 조회

    인증 필요
    """
    return UserResponse.model_validate(current_user)
