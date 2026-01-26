"""
Auth Service
인증 비즈니스 로직
"""
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.user import UserService
from app.core.security import verify_password, create_access_token


class AuthService:
    """인증 비즈니스 로직"""

    def __init__(self, db: AsyncSession):
        self.user_service = UserService(db)

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """
        사용자 인증

        Args:
            email: 이메일
            password: 비밀번호

        Returns:
            User 또는 None (인증 실패 시)
        """
        user = await self.user_service.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user

    def create_token(self, user: User) -> str:
        """
        액세스 토큰 생성

        Args:
            user: 사용자

        Returns:
            JWT 토큰
        """
        return create_access_token(data={"sub": str(user.id)})

    async def login(self, email: str, password: str) -> Optional[Tuple[str, User]]:
        """
        로그인 처리

        Args:
            email: 이메일
            password: 비밀번호

        Returns:
            (token, user) 또는 None (로그인 실패 시)
        """
        user = await self.authenticate(email, password)
        if not user:
            return None
        token = self.create_token(user)
        return token, user
