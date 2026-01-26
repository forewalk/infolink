"""
User Service
비즈니스 로직 레이어
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """User 비즈니스 로직"""

    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """ID로 사용자 조회"""
        return await self.repository.get_by_id(user_id)

    async def get_by_email(self, email: str) -> Optional[User]:
        """이메일로 사용자 조회"""
        return await self.repository.get_by_email(email)

    async def create(self, user_create: UserCreate) -> User:
        """사용자 생성"""
        return await self.repository.create(user_create)

    async def update(self, user: User, user_update: UserUpdate) -> User:
        """사용자 수정"""
        return await self.repository.update(user, user_update)
