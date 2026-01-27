/**
 * 게시판 API 서비스
 */
import api from './api'

export interface BoardListItem {
  id: number
  title: string
  content: string
  view_count: number
  author_name: string
  created_at: string
}

export interface BoardListResponse {
  items: BoardListItem[]
  next_cursor: number | null
  has_more: boolean
}

export interface BoardDetail {
  id: number
  user_id: number
  title: string
  content: string
  view_count: number
  author_name: string
  is_author: boolean
  created_at: string
  updated_at: string
}

export interface BoardCreateRequest {
  title: string
  content: string
}

export interface BoardUpdateRequest {
  title?: string
  content?: string
}

/**
 * 게시글 목록 조회 (무한스크롤)
 */
export const getBoards = async (cursor?: number, limit: number = 20): Promise<BoardListResponse> => {
  const params = new URLSearchParams()
  if (cursor) params.append('cursor', cursor.toString())
  params.append('limit', limit.toString())

  const response = await api.get<BoardListResponse>(`/boards?${params.toString()}`)
  return response.data
}

/**
 * 게시글 상세 조회
 */
export const getBoard = async (id: number): Promise<BoardDetail> => {
  const response = await api.get<BoardDetail>(`/boards/${id}`)
  return response.data
}

/**
 * 게시글 작성
 */
export const createBoard = async (data: BoardCreateRequest): Promise<BoardDetail> => {
  const response = await api.post<BoardDetail>('/boards', data)
  return response.data
}

/**
 * 게시글 수정
 */
export const updateBoard = async (id: number, data: BoardUpdateRequest): Promise<BoardDetail> => {
  const response = await api.put<BoardDetail>(`/boards/${id}`, data)
  return response.data
}

/**
 * 게시글 삭제
 */
export const deleteBoard = async (id: number): Promise<void> => {
  await api.delete(`/boards/${id}`)
}
