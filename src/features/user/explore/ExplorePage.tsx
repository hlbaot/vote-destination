"use client"

import { useMemo, useState } from "react"
import { Destination, Region } from "@/types"
import DestinationCard from "@/components/user/destination/DestinationCard"
import Icon from "@/components/shared/Icon"

const tagOptions = [
  "Tất cả",
  "Di sản thiên nhiên",
  "Di sản văn hóa",
  "Cảnh quan",
  "Danh thắng",
  "Đã yêu thích",
]

const regionOptions: { label: string; value: Region | "all" }[] = [
  { label: "Tất cả vùng miền", value: "all" },
  { label: "Miền Bắc", value: "Bắc" },
  { label: "Miền Trung", value: "Trung" },
  { label: "Tây Nguyên", value: "Tây Nguyên" },
  { label: "Miền Nam", value: "Nam" },
]

const ITEMS_PER_PAGE = 4

// Hàm tạo danh sách phân trang rút gọn dạng: 1 ... 7 8 9 ... 17
function getPaginationItems(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // Gần trang đầu: 1 2 3 4 5 ... total
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total]
  }

  // Gần trang cuối: 1 ... total-4 total-3 total-2 total-1 total
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total]
  }

  // Ở giữa: 1 ... current-1 current current+1 ... total
  return [1, "...", current - 1, current, current + 1, "...", total]
}

export default function Explore({
  destinations,
  onOpenDetail,
  favorites,
  onToggleFavorite,
}: {
  destinations: Destination[]
  onOpenDetail: (dest: Destination) => void
  favorites: string[]
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
}) {
  const [query, setQuery] = useState("")
  const [tagFilter, setTagFilter] = useState("Tất cả")
  const [regionFilter, setRegionFilter] = useState<Region | "all">("all")
  const [sortBy, setSortBy] = useState<"votes" | "name">("votes")
  const [currentPage, setCurrentPage] = useState(1)

  // Điểm có số phiếu cao nhất để tính thanh tiến trình
  const maxVotes = useMemo(() => {
    return Math.max(...destinations.map((d) => d.rawVotes || 0), 1)
  }, [destinations])

  const filtered = useMemo(() => {
    return destinations
      .filter((d) => d.isVisible)
      .filter((d) => {
        // Tag check
        if (tagFilter === "Đã yêu thích") {
          if (!favorites.includes(d.id)) return false
        } else if (tagFilter !== "Tất cả") {
          if (d.tag !== tagFilter && d.category !== tagFilter) return false
        }
        // Region check
        if (regionFilter !== "all" && d.region !== regionFilter) {
          return false
        }
        // Query search
        if (query.trim()) {
          const q = query.toLowerCase()
          const matchName = d.name.toLowerCase().includes(q)
          const matchPlace = d.place.toLowerCase().includes(q)
          const matchProvince = d.province?.toLowerCase().includes(q)
          const matchTag = d.tag.toLowerCase().includes(q)
          const matchCategory = d.category?.toLowerCase().includes(q)
          if (!matchName && !matchPlace && !matchProvince && !matchTag && !matchCategory) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "votes") {
          return b.rawVotes - a.rawVotes
        }
        return a.name.localeCompare(b.name, "vi")
      })
  }, [destinations, tagFilter, regionFilter, query, sortBy, favorites])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  )

  const paginationItems = useMemo(
    () => getPaginationItems(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages],
  )

  return (
    <main className="subpage explore-page">
      {/* 1. Hero Section đặt trực tiếp trên nền, không dùng hộp trắng */}
      <section className="explore-hero-container container">
        <div className="explore-hero-top-badge">
          <span className="hero-live-dot" />
          <span className="eyebrow">DANH SÁCH 68 HỒ SƠ ĐỀ CỬ</span>
        </div>

        <h1 className="explore-hero-heading">
          Danh sách <em>điểm đến</em>
        </h1>

        <p className="explore-hero-description">
          Hiển thị hồ sơ 68 điểm đến gồm ảnh đại diện, tên, địa phương và mô tả
          ngắn. Sử dụng tìm kiếm, bộ lọc vùng miền/thể loại để truy cập nhanh
          hồ sơ chi tiết trước khi bình chọn.
        </p>

        {/* Các thống kê nhỏ tinh tế */}
        <div className="explore-hero-stats-row">
          <div className="stat-pill-item">
            <span className="stat-pill-num">68</span>
            <span className="stat-pill-text">Hồ sơ đề cử</span>
          </div>
          <span className="stat-pill-sep">•</span>
          <div className="stat-pill-item">
            <span className="stat-pill-num">4</span>
            <span className="stat-pill-text">Vùng miền</span>
          </div>
          <span className="stat-pill-sep">•</span>
          <div className="stat-pill-item">
            <span className="stat-pill-num">17</span>
            <span className="stat-pill-text">Trang bình chọn</span>
          </div>
          <span className="stat-pill-sep">•</span>
          <div className="stat-pill-item">
            <span className="stat-pill-num">100%</span>
            <span className="stat-pill-text">Xác thực OTP</span>
          </div>
        </div>
      </section>

      {/* 2. Không gian nội dung tự do trên nền - BỎ KHUNG BAO LỚN */}
      <section className="container explore-main-wrapper">
        {/* Thanh công cụ kính mờ độc lập (Search + Dropdowns) */}
        <div className="explore-glass-toolbar">
          <label className="explore-search-box">
            <Icon name="search" size={18} className="search-icon-svg" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo tên điểm đến, tỉnh thành, di sản..."
            />
            {query && (
              <button
                type="button"
                className="clear-search-button"
                onClick={() => {
                  setQuery("")
                  setCurrentPage(1)
                }}
                aria-label="Xóa tìm kiếm"
              >
                <Icon name="x" size={14} />
              </button>
            )}
          </label>

          <div className="explore-select-actions">
            <div className="custom-select-shell">
              <select
                value={regionFilter}
                onChange={(e) => {
                  setRegionFilter(e.target.value as Region | "all")
                  setCurrentPage(1)
                }}
                className="explore-select-input"
              >
                {regionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="select-arrow-icon">▾</span>
            </div>

            <div className="custom-select-shell">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "votes" | "name")
                  setCurrentPage(1)
                }}
                className="explore-select-input"
              >
                <option value="votes">Sắp xếp: Bình chọn cao nhất</option>
                <option value="name">Sắp xếp: Tên A-Z</option>
              </select>
              <span className="select-arrow-icon">▾</span>
            </div>
          </div>
        </div>

        {/* Hàng chip lọc độc lập */}
        <div className="explore-chips-bar">
          <div className="chips-tags-group">
            {tagOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setTagFilter(tag)
                  setCurrentPage(1)
                }}
                className={`explore-chip-btn ${tagFilter === tag ? "is-active" : ""}`}
              >
                {tag === "Đã yêu thích" ? (
                  <>
                    <span className="heart-chip-icon">♥</span> Đã yêu thích ({favorites.length})
                  </>
                ) : (
                  tag
                )}
              </button>
            ))}
          </div>

          <div className="explore-status-pill">
            <span className="status-live-dot" />
            <span>
              {filtered.length} điểm đến • Trang {safeCurrentPage}/{totalPages}
            </span>
          </div>
        </div>

        {/* Lưới 4 Card độc lập với hiệu ứng animation xuất hiện lần lượt */}
        {filtered.length > 0 ? (
          <>
            <div className="card-grid explore-card-grid">
              {paginated.map((item, index) => (
                <div
                  key={item.id}
                  className="explore-card-anim-item"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <DestinationCard
                    item={item}
                    rank={(safeCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={onToggleFavorite}
                    onOpen={() => onOpenDetail(item)}
                    maxVotes={maxVotes}
                  />
                </div>
              ))}
            </div>

            {/* Phân trang kính mờ dạng rút gọn: Trước 1 ... 7 8 9 ... 17 Sau */}
            <nav className="explore-pagination-container" aria-label="Phân trang danh sách điểm đến">
              <div className="pagination-compact-bar">
                <button
                  type="button"
                  className="page-nav-arrow-btn"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  aria-label="Trang trước"
                >
                  ← Trước
                </button>

                <div className="pagination-numbers-track">
                  {paginationItems.map((item, idx) => {
                    if (item === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="pagination-ellipsis-dot">
                          …
                        </span>
                      )
                    }

                    const pageNumber = item as number
                    const isActive = pageNumber === safeCurrentPage

                    return (
                      <button
                        key={`page-${pageNumber}`}
                        type="button"
                        className={`page-num-btn ${isActive ? "is-current" : ""}`}
                        onClick={() => setCurrentPage(pageNumber)}
                        aria-label={`Chuyển đến trang ${pageNumber}`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  className="page-nav-arrow-btn"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Trang sau"
                >
                  Sau →
                </button>
              </div>
            </nav>
          </>
        ) : (
          <div className="explore-empty-glass-card">
            <div className="empty-icon-wrap">
              <Icon name="search" size={42} />
            </div>
            <h3>Không tìm thấy điểm đến phù hợp</h3>
            <p>
              Vui lòng thử điều chỉnh từ khóa tìm kiếm hoặc chọn bộ lọc phân
              loại vùng miền khác.
            </p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                setQuery("")
                setTagFilter("Tất cả")
                setRegionFilter("all")
                setCurrentPage(1)
              }}
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
