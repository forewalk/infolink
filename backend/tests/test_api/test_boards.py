"""
게시판 API 엔드포인트 테스트
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash
from app.models.user import User


async def create_test_user(db: AsyncSession, email: str = "test@example.com", username: str = "테스터") -> User:
    """테스트용 사용자 생성"""
    user = User(
        email=email,
        hashed_password=get_password_hash("password123"),
        username=username,
        is_active=True,
        is_admin=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


def get_auth_header(user_id: int) -> dict:
    """인증 헤더 생성"""
    token = create_access_token(data={"sub": str(user_id)})
    return {"Authorization": f"Bearer {token}"}


# ===== 게시글 목록 조회 =====

@pytest.mark.asyncio
async def test_get_boards_empty(client: AsyncClient):
    """게시글이 없을 때 빈 목록 반환"""
    response = await client.get("/api/v1/boards")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["has_more"] is False
    assert data["next_cursor"] is None


@pytest.mark.asyncio
async def test_get_boards_with_data(client: AsyncClient, db_session: AsyncSession):
    """게시글 목록 조회"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    # 게시글 3개 작성
    for i in range(3):
        await client.post(
            "/api/v1/boards",
            json={"title": f"테스트 제목 {i}", "content": f"테스트 내용 {i}"},
            headers=headers,
        )

    response = await client.get("/api/v1/boards")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 3


@pytest.mark.asyncio
async def test_get_boards_pagination(client: AsyncClient, db_session: AsyncSession):
    """게시글 커서 기반 페이지네이션"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    # 게시글 5개 작성
    for i in range(5):
        await client.post(
            "/api/v1/boards",
            json={"title": f"제목 {i}", "content": f"내용 {i}"},
            headers=headers,
        )

    # limit=2로 첫 페이지 조회
    response = await client.get("/api/v1/boards?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["has_more"] is True
    assert data["next_cursor"] is not None

    # 다음 페이지 조회
    cursor = data["next_cursor"]
    response2 = await client.get(f"/api/v1/boards?cursor={cursor}&limit=2")
    assert response2.status_code == 200
    data2 = response2.json()
    assert len(data2["items"]) == 2


# ===== 게시글 작성 =====

@pytest.mark.asyncio
async def test_create_board(client: AsyncClient, db_session: AsyncSession):
    """게시글 작성 성공"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    response = await client.post(
        "/api/v1/boards",
        json={"title": "새 게시글", "content": "게시글 내용입니다."},
        headers=headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "새 게시글"
    assert data["content"] == "게시글 내용입니다."
    assert data["author_name"] == "테스터"
    assert data["is_author"] is True
    assert data["view_count"] == 0


@pytest.mark.asyncio
async def test_create_board_unauthorized(client: AsyncClient):
    """비로그인 시 게시글 작성 실패 (401)"""
    response = await client.post(
        "/api/v1/boards",
        json={"title": "제목", "content": "내용"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_board_validation_title_empty(client: AsyncClient, db_session: AsyncSession):
    """제목 빈 값 검증 (422)"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    response = await client.post(
        "/api/v1/boards",
        json={"title": "", "content": "내용"},
        headers=headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_board_validation_title_too_long(client: AsyncClient, db_session: AsyncSession):
    """제목 200자 초과 검증 (422)"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    response = await client.post(
        "/api/v1/boards",
        json={"title": "가" * 201, "content": "내용"},
        headers=headers,
    )
    assert response.status_code == 422


# ===== 게시글 상세 조회 =====

@pytest.mark.asyncio
async def test_get_board_detail(client: AsyncClient, db_session: AsyncSession):
    """게시글 상세 조회 및 조회수 증가"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    # 게시글 작성
    create_res = await client.post(
        "/api/v1/boards",
        json={"title": "상세 조회 테스트", "content": "내용입니다."},
        headers=headers,
    )
    board_id = create_res.json()["id"]

    # 상세 조회 (인증 포함 - 작성자)
    response = await client.get(f"/api/v1/boards/{board_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "상세 조회 테스트"
    assert data["is_author"] is True
    assert data["view_count"] == 1  # 조회수 1 증가


@pytest.mark.asyncio
async def test_get_board_detail_guest(client: AsyncClient, db_session: AsyncSession):
    """비로그인 사용자도 게시글 상세 조회 가능"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    create_res = await client.post(
        "/api/v1/boards",
        json={"title": "게스트 조회", "content": "내용"},
        headers=headers,
    )
    board_id = create_res.json()["id"]

    # 인증 없이 조회
    response = await client.get(f"/api/v1/boards/{board_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["is_author"] is False


@pytest.mark.asyncio
async def test_get_board_not_found(client: AsyncClient):
    """존재하지 않는 게시글 조회 (404)"""
    response = await client.get("/api/v1/boards/99999")
    assert response.status_code == 404


# ===== 게시글 수정 =====

@pytest.mark.asyncio
async def test_update_board(client: AsyncClient, db_session: AsyncSession):
    """게시글 수정 성공 (작성자)"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    create_res = await client.post(
        "/api/v1/boards",
        json={"title": "원래 제목", "content": "원래 내용"},
        headers=headers,
    )
    board_id = create_res.json()["id"]

    response = await client.put(
        f"/api/v1/boards/{board_id}",
        json={"title": "수정된 제목", "content": "수정된 내용"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "수정된 제목"
    assert data["content"] == "수정된 내용"


@pytest.mark.asyncio
async def test_update_board_forbidden(client: AsyncClient, db_session: AsyncSession):
    """다른 사용자의 게시글 수정 금지 (403)"""
    user1 = await create_test_user(db_session, email="user1@test.com", username="유저1")
    user2 = await create_test_user(db_session, email="user2@test.com", username="유저2")

    # user1이 작성
    create_res = await client.post(
        "/api/v1/boards",
        json={"title": "유저1의 글", "content": "내용"},
        headers=get_auth_header(user1.id),
    )
    board_id = create_res.json()["id"]

    # user2가 수정 시도
    response = await client.put(
        f"/api/v1/boards/{board_id}",
        json={"title": "변경 시도"},
        headers=get_auth_header(user2.id),
    )
    assert response.status_code == 403


# ===== 게시글 삭제 =====

@pytest.mark.asyncio
async def test_delete_board(client: AsyncClient, db_session: AsyncSession):
    """게시글 삭제 성공 (작성자, soft delete)"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    create_res = await client.post(
        "/api/v1/boards",
        json={"title": "삭제 테스트", "content": "삭제될 내용"},
        headers=headers,
    )
    board_id = create_res.json()["id"]

    # 삭제
    response = await client.delete(f"/api/v1/boards/{board_id}", headers=headers)
    assert response.status_code == 204

    # 삭제 후 조회 불가
    get_response = await client.get(f"/api/v1/boards/{board_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_board_forbidden(client: AsyncClient, db_session: AsyncSession):
    """다른 사용자의 게시글 삭제 금지 (403)"""
    user1 = await create_test_user(db_session, email="author@test.com", username="작성자")
    user2 = await create_test_user(db_session, email="other@test.com", username="타인")

    create_res = await client.post(
        "/api/v1/boards",
        json={"title": "삭제 금지", "content": "내용"},
        headers=get_auth_header(user1.id),
    )
    board_id = create_res.json()["id"]

    response = await client.delete(
        f"/api/v1/boards/{board_id}",
        headers=get_auth_header(user2.id),
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_board_unauthorized(client: AsyncClient, db_session: AsyncSession):
    """비로그인 시 게시글 삭제 실패 (401)"""
    user = await create_test_user(db_session)
    headers = get_auth_header(user.id)

    create_res = await client.post(
        "/api/v1/boards",
        json={"title": "삭제 금지", "content": "내용"},
        headers=headers,
    )
    board_id = create_res.json()["id"]

    response = await client.delete(f"/api/v1/boards/{board_id}")
    assert response.status_code == 401
