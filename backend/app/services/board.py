"""
Board Service
비즈니스 로직 레이어
"""
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.board import Board
from app.repositories.board import BoardRepository
from app.schemas.board import BoardCreate, BoardUpdate


class BoardService:
    """Board 비즈니스 로직"""

    def __init__(self, db: AsyncSession):
        self.repository = BoardRepository(db)

    async def create_board(self, user_id: int, data: BoardCreate) -> Board:
        """게시글 작성"""
        return await self.repository.create(user_id, data)

    async def get_board(self, board_id: int) -> Board:
        """
        게시글 상세 조회 + 조회수 증가

        Raises:
            HTTPException: 게시글을 찾을 수 없는 경우
        """
        board = await self.repository.get_by_id(board_id)
        if not board:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="게시글을 찾을 수 없습니다."
            )
        # 조회수 증가
        await self.repository.increment_view_count(board)
        return board

    async def get_board_list(
        self, cursor: Optional[int] = None, limit: int = 20
    ) -> Tuple[List[Board], bool]:
        """게시글 목록 조회 (무한스크롤)"""
        return await self.repository.get_list(cursor, limit)

    async def update_board(
        self, board_id: int, user_id: int, data: BoardUpdate
    ) -> Board:
        """
        게시글 수정 (작성자만 가능)

        Raises:
            HTTPException: 게시글을 찾을 수 없거나 권한이 없는 경우
        """
        board = await self.repository.get_by_id(board_id)
        if not board:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="게시글을 찾을 수 없습니다."
            )
        if board.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="수정 권한이 없습니다."
            )
        return await self.repository.update(board, data)

    async def delete_board(self, board_id: int, user_id: int) -> None:
        """
        게시글 삭제 (작성자만 가능, soft delete)

        Raises:
            HTTPException: 게시글을 찾을 수 없거나 권한이 없는 경우
        """
        board = await self.repository.get_by_id(board_id)
        if not board:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="게시글을 찾을 수 없습니다."
            )
        if board.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="삭제 권한이 없습니다."
            )
        await self.repository.soft_delete(board)
