"""
Boards API 엔드포인트 (게시판)
"""
from typing import Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_user, get_current_user_optional
from app.models.user import User
from app.services.board import BoardService
from app.schemas.board import (
    BoardCreate,
    BoardUpdate,
    BoardResponse,
    BoardListResponse,
    BoardListItem,
)

router = APIRouter()


@router.get("", response_model=BoardListResponse)
async def get_boards(
    cursor: Optional[int] = Query(None, description="마지막 게시글 ID (이전 페이지의 마지막 ID)"),
    limit: int = Query(20, ge=1, le=100, description="조회할 게시글 수"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    게시글 목록 조회 (무한스크롤)

    - 최신순 정렬
    - cursor 기반 페이지네이션
    - 인증 불필요 (비회원도 조회 가능)
    """
    service = BoardService(db)
    boards, has_more = await service.get_board_list(cursor, limit)

    items = [
        BoardListItem(
            id=board.id,
            title=board.title,
            content=board.content[:100] + "..." if len(board.content) > 100 else board.content,
            view_count=board.view_count,
            author_name=board.user.username,
            created_at=board.created_at,
        )
        for board in boards
    ]

    return BoardListResponse(
        items=items,
        next_cursor=boards[-1].id if boards else None,
        has_more=has_more,
    )


@router.get("/{board_id}", response_model=BoardResponse)
async def get_board(
    board_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    게시글 상세 조회

    - 조회수 자동 증가
    - 인증 불필요 (비회원도 조회 가능)
    - is_author: 현재 사용자가 작성자인지 여부
    """
    service = BoardService(db)
    board = await service.get_board(board_id)
    await db.commit()  # 조회수 증가 반영

    return BoardResponse(
        id=board.id,
        user_id=board.user_id,
        title=board.title,
        content=board.content,
        view_count=board.view_count,
        author_name=board.user.username,
        is_author=current_user.id == board.user_id if current_user else False,
        created_at=board.created_at,
        updated_at=board.updated_at,
    )


@router.post("", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_board(
    data: BoardCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    게시글 작성

    - 인증 필수 (로그인 사용자만)
    - 제목: 최대 200자
    - 내용: 최대 10,000자
    """
    service = BoardService(db)
    board = await service.create_board(current_user.id, data)
    await db.commit()
    await db.refresh(board)

    return BoardResponse(
        id=board.id,
        user_id=board.user_id,
        title=board.title,
        content=board.content,
        view_count=board.view_count,
        author_name=current_user.username,
        is_author=True,
        created_at=board.created_at,
        updated_at=board.updated_at,
    )


@router.put("/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: int,
    data: BoardUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    게시글 수정

    - 인증 필수
    - 작성자만 수정 가능
    """
    service = BoardService(db)
    board = await service.update_board(board_id, current_user.id, data)
    await db.commit()
    await db.refresh(board)

    return BoardResponse(
        id=board.id,
        user_id=board.user_id,
        title=board.title,
        content=board.content,
        view_count=board.view_count,
        author_name=board.user.username,
        is_author=True,
        created_at=board.created_at,
        updated_at=board.updated_at,
    )


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(
    board_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    게시글 삭제

    - 인증 필수
    - 작성자만 삭제 가능
    - Soft delete (deleted_at 설정)
    """
    service = BoardService(db)
    await service.delete_board(board_id, current_user.id)
    await db.commit()
