"""
Board Repository
데이터베이스 액세스 레이어
"""
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.board import Board
from app.schemas.board import BoardCreate, BoardUpdate


class BoardRepository:
    """Board 데이터 액세스 레이어"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: int, data: BoardCreate) -> Board:
        """게시글 생성"""
        board = Board(
            user_id=user_id,
            title=data.title,
            content=data.content,
        )
        self.db.add(board)
        await self.db.flush()
        await self.db.refresh(board)
        return board

    async def get_by_id(self, board_id: int) -> Optional[Board]:
        """ID로 게시글 조회 (작성자 정보 포함)"""
        result = await self.db.execute(
            select(Board)
            .options(joinedload(Board.user))
            .where(Board.id == board_id, Board.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def get_list(
        self, cursor: Optional[int] = None, limit: int = 20
    ) -> Tuple[List[Board], bool]:
        """
        게시글 목록 조회 (무한스크롤용 cursor 기반)

        Args:
            cursor: 마지막으로 본 게시글 ID (이보다 작은 ID 조회)
            limit: 조회할 개수

        Returns:
            (게시글 목록, 다음 페이지 존재 여부)
        """
        query = (
            select(Board)
            .options(joinedload(Board.user))
            .where(Board.deleted_at.is_(None))
            .order_by(Board.id.desc())
            .limit(limit + 1)  # 1개 더 조회하여 has_more 판단
        )

        if cursor:
            query = query.where(Board.id < cursor)

        result = await self.db.execute(query)
        boards = list(result.scalars().all())

        # limit+1개를 조회했으므로, limit보다 많으면 다음 페이지 있음
        has_more = len(boards) > limit
        if has_more:
            boards = boards[:limit]

        return boards, has_more

    async def update(self, board: Board, data: BoardUpdate) -> Board:
        """게시글 수정"""
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(board, field, value)
        await self.db.flush()
        await self.db.refresh(board)
        return board

    async def soft_delete(self, board: Board) -> None:
        """게시글 soft delete"""
        board.deleted_at = datetime.utcnow()
        await self.db.flush()

    async def increment_view_count(self, board: Board) -> None:
        """조회수 증가"""
        board.view_count += 1
        await self.db.flush()
