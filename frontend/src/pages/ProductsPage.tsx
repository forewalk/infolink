/**
 * 상품 페이지
 * 프로필 아이콘 / 메인 이미지 / 검색바 / 상품 리스트 구성
 */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

// ─── 목업 데이터 (추후 API 연동 시 제거) ───
interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  linkUrl: string
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: '무선 블루투스 이어폰',
    description: '고음질 노이즈 캔슬링 지원, 최대 24시간 재생',
    imageUrl: 'https://placehold.co/120x120/E8F5E9/4CAF50?text=🎧',
    linkUrl: 'https://example.com/product/1',
  },
  {
    id: 2,
    name: '스마트 워치 Pro',
    description: '심박수 모니터링, GPS 내장, 5ATM 방수',
    imageUrl: 'https://placehold.co/120x120/E3F2FD/2196F3?text=⌚',
    linkUrl: 'https://example.com/product/2',
  },
  {
    id: 3,
    name: '휴대용 보조배터리',
    description: '20000mAh 대용량, PD 45W 고속충전 지원',
    imageUrl: 'https://placehold.co/120x120/FFF3E0/FF9800?text=🔋',
    linkUrl: 'https://example.com/product/3',
  },
  {
    id: 4,
    name: '미니 프로젝터',
    description: 'Full HD 지원, 자동 키스톤 보정, 스마트 OS 내장',
    imageUrl: 'https://placehold.co/120x120/F3E5F5/9C27B0?text=📽️',
    linkUrl: 'https://example.com/product/4',
  },
  {
    id: 5,
    name: '기계식 키보드',
    description: '무선/유선 겸용, RGB 백라이트, 적축 스위치',
    imageUrl: 'https://placehold.co/120x120/FFEBEE/F44336?text=⌨️',
    linkUrl: 'https://example.com/product/5',
  },
  {
    id: 6,
    name: 'USB-C 멀티허브',
    description: 'HDMI 4K, USB 3.0 x3, SD카드 리더기, PD 충전',
    imageUrl: 'https://placehold.co/120x120/E0F7FA/00BCD4?text=🔌',
    linkUrl: 'https://example.com/product/6',
  },
]

// ─── 프로필 아이콘 SVG ───
function ProfileIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="#CCCCCC" strokeWidth="1.5" fill="#F5F5F5" />
      <circle cx="16" cy="12" r="5" fill="#BDBDBD" />
      <path
        d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10"
        stroke="#BDBDBD"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

// ─── 검색 아이콘 SVG ───
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="#999999" strokeWidth="1.5" />
      <line x1="11.5" y1="11.5" x2="16" y2="16" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ProductsPage() {
  const { user, isGuest, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  // 검색 필터링 (목업 - 추후 API 호출로 대체)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_PRODUCTS
    const query = searchQuery.toLowerCase()
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 백엔드 API 호출로 대체
    // const results = await api.get(`/products/search?q=${searchQuery}`)
  }

  const handleProductClick = (linkUrl: string) => {
    window.open(linkUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={styles.container}>
      {/* ─── 최상단: 프로필 아이콘 ─── */}
      <header style={styles.header}>
        <div style={styles.headerLeft} />
        <span style={styles.headerTitle}>infolink</span>
        <button
          onClick={logout}
          style={styles.profileButton}
          title={isGuest ? '비회원 모드' : user?.username ?? '프로필'}
        >
          <ProfileIcon />
        </button>
      </header>

      {/* ─── 메인 배너 이미지 ─── */}
      <div style={styles.bannerWrapper}>
        <div style={styles.banner}>
          <p style={styles.bannerTitle}>이번 주 추천 상품</p>
          <p style={styles.bannerSubtitle}>엄선된 인기 상품을 확인해보세요</p>
        </div>
      </div>

      {/* ─── 검색바 ─── */}
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <div style={styles.searchInputWrapper}>
          <span style={styles.searchIconWrapper}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="상품명 또는 키워드 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </form>

      {/* ─── 상품 리스트 ─── */}
      <section style={styles.productSection}>
        <p style={styles.resultCount}>
          {searchQuery.trim()
            ? `검색 결과 ${filteredProducts.length}건`
            : `전체 상품 ${filteredProducts.length}건`}
        </p>

        {filteredProducts.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div style={styles.productList}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={styles.productCard}
                onClick={() => handleProductClick(product.linkUrl)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProductClick(product.linkUrl)
                }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={styles.productImage}
                />
                <div style={styles.productInfo}>
                  <p style={styles.productName}>{product.name}</p>
                  <p style={styles.productDescription}>{product.description}</p>
                </div>
                {/* 화살표 아이콘 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={styles.arrowIcon}
                >
                  <path
                    d="M7 4l6 6-6 6"
                    stroke="#CCCCCC"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── 게시판 이동 버튼 ─── */}
      <div style={styles.boardButtonWrapper}>
        <button
          onClick={() => navigate('/board')}
          style={styles.boardButton}
        >
          게시판
        </button>
      </div>
    </div>
  )
}

// ─── 스타일 정의 ───
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAFAFA',
    maxWidth: '480px',
    margin: '0 auto',
  },

  // 헤더
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #F0F0F0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerLeft: {
    width: 32,
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: '-0.3px',
  },
  profileButton: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 배너
  bannerWrapper: {
    padding: '16px 20px 0',
  },
  banner: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    borderRadius: '16px',
    padding: '28px 24px',
    color: '#FFFFFF',
  },
  bannerTitle: {
    margin: '0 0 6px',
    fontSize: '20px',
    fontWeight: '700',
  },
  bannerSubtitle: {
    margin: 0,
    fontSize: '14px',
    opacity: 0.85,
  },

  // 검색바
  searchForm: {
    padding: '16px 20px',
  },
  searchInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E8E8E8',
    padding: '0 16px',
    height: '48px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  searchIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '10px',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#1A1A1A',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
  },

  // 상품 섹션
  productSection: {
    padding: '0 20px 24px',
  },
  resultCount: {
    margin: '0 0 12px',
    fontSize: '13px',
    color: '#999999',
    fontWeight: '500',
  },
  productList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },

  // 상품 카드
  productCard: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    padding: '14px',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.15s',
    gap: '14px',
  },
  productImage: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    objectFit: 'cover' as const,
    flexShrink: 0,
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    margin: '0 0 4px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1A1A1A',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  productDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#888888',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  arrowIcon: {
    flexShrink: 0,
  },

  // 빈 상태
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    padding: '48px 20px',
    textAlign: 'center' as const,
  },
  emptyText: {
    margin: 0,
    color: '#999999',
    fontSize: '15px',
  },

  // 게시판 버튼
  boardButtonWrapper: {
    padding: '0 20px 32px',
  },
  boardButton: {
    width: '100%',
    height: '52px',
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}
