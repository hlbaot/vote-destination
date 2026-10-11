"use client"

import { useMemo, useState } from "react"
import { Destination, Region } from "../types"
import DestinationCard from "../components/DestinationCard"
import Icon from "../components/Icon"

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
          if (!matchName && !matchPlace && !matchProvince && !matchTag && !matchCategory) return false
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

  return (
    <main className="subpage">
      <section className="page-intro container">
        <span className="eyebrow">DANH SÁCH 68 HỒ SƠ ĐỀ CỬ</span>
        <h1>
          Danh sách <em>điểm đến</em>
        </h1>
        <p>
          Hiển thị hồ sơ 68 điểm đến gồm ảnh đại diện, tên, địa phương và mô tả
          ngắn. Sử dụng tìm kiếm, bộ lọc vùng miền/thể loại để truy cập nhanh
          hồ sơ chi tiết trước khi bình chọn.
        </p>
      </section>

      <section className="container destination-showcase">
        {/* Search and control bar */}
        <div className="search-panel">
          <label className="search-box">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm theo tên điểm đến, tỉnh thành, di sản..."
            />
            {query && (
              <button
                className="clear-search"
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

          <div className="search-controls">
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value as Region | "all")
                setCurrentPage(1)
              }}
              className="select-filter"
            >
              {regionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as "votes" | "name")
                setCurrentPage(1)
              }}
              className="select-filter"
            >
              <option value="votes">Sắp xếp: Bình chọn cao nhất</option>
              <option value="name">Sắp xếp: Tên A-Z</option>
            </select>
          </div>
        </div>

        {/* Tag filter chips */}
        <div className="filter-row">
          {tagOptions.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setTagFilter(tag)
                setCurrentPage(1)
              }}
              className={tagFilter === tag ? "selected" : ""}
            >
              {tag === "Đã yêu thích"
                ? `♥ Đã yêu thích (${favorites.length})`
                : tag}
            </button>
          ))}
          <span className="listing-status">
            {filtered.length} điểm đến • Trang {safeCurrentPage}/{totalPages}
          </span>
        </div>

        {/* Destinations Grid */}
        {filtered.length > 0 ? (
          <>
            <div className="card-grid listing-grid">
              {paginated.map((item, index) => (
                <DestinationCard
                  key={item.id}
                  item={item}
                  rank={(safeCurrentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={onToggleFavorite}
                  onOpen={() => onOpenDetail(item)}
                />
              ))}
            </div>

            <nav className="pagination-bar" aria-label="Phân trang điểm đến">
              <div className="pagination-summary">
                <strong>Trang {safeCurrentPage}</strong>
                <span>trong {totalPages} trang, mỗi trang 4 điểm đến</span>
              </div>
              <div className="pagination-list">
                <button
                  type="button"
                  className="page-nav-button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={safeCurrentPage === 1}
                >
                  Trước
                </button>
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`page-number-button ${
                      safeCurrentPage === page ? "active" : ""
                    }`}
                    onClick={() => {
                      setCurrentPage(page)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    aria-label={`Đến trang ${page}`}
                    aria-current={safeCurrentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-nav-button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safeCurrentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            </nav>
          </>
        ) : (
          <div className="empty-state">
            <Icon name="search" size={40} />
            <h3>Không tìm thấy điểm đến phù hợp</h3>
            <p>
              Vui lòng thử điều chỉnh từ khóa tìm kiếm hoặc chọn bộ lọc phân
              loại khác.
            </p>
            <button
              className="btn btn-secondary"
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
