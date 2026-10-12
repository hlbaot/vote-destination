"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Destination, Region } from "@/types"
import DestinationCard from "@/components/user/destination/DestinationCard"
import Icon from "@/components/shared/Icon"
import { useVotes } from "@/lib/store/useVotes"
import MarqueeCards from "@/uiux/marqueeCards"

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

  const { votesByDestination, remainingToday, totalQuota } = useVotes()

  // Bảng xếp hạng toàn cục cho tất cả 68 điểm đến (tính theo số phiếu mới nhất)
  const globalRankMap = useMemo(() => {
    const sortedAll = [...destinations].sort((a, b) => {
      const vA = votesByDestination[a.id] ?? a.rawVotes
      const vB = votesByDestination[b.id] ?? b.rawVotes
      return vB - vA
    })
    const map: Record<string, number> = {}
    sortedAll.forEach((d, idx) => {
      map[d.id] = idx + 1
    })
    return map
  }, [destinations, votesByDestination])

  // Điểm có số phiếu cao nhất để tính thanh tiến trình
  const maxVotes = useMemo(() => {
    return Math.max(
      ...destinations.map((d) => (votesByDestination[d.id] ?? d.rawVotes) || 0),
      1,
    )
  }, [destinations, votesByDestination])

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
          const vA = votesByDestination[a.id] ?? a.rawVotes
          const vB = votesByDestination[b.id] ?? b.rawVotes
          return vB - vA
        }
        return a.name.localeCompare(b.name, "vi")
      })
  }, [destinations, tagFilter, regionFilter, query, sortBy, favorites, votesByDestination])

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
            <span className="stat-pill-num">∞</span>
            <span className="stat-pill-text">Cuộn vô hạn</span>
          </div>
          <span className="stat-pill-sep">•</span>
          <div className="stat-pill-item">
            <span className="stat-pill-num">100%</span>
            <span className="stat-pill-text">Xác thực OTP</span>
          </div>
        </div>
      </section>

      {/* 2. Không gian nội dung tự do trên nền - Thanh công cụ & Bộ lọc */}
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
              }}
              placeholder="Tìm theo tên điểm đến, tỉnh thành, di sản..."
            />
            {query && (
              <button
                type="button"
                className="clear-search-button"
                onClick={() => {
                  setQuery("")
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

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div className="explore-quota-pill" title="Làm mới lúc 00:00 (giờ Việt Nam)">
              <span>🌿 Còn <strong>{remainingToday}/{totalQuota}</strong> lượt hôm nay</span>
              {remainingToday === 0 && (
                <Link href="/ban-do-binh-chon" className="quota-bonus-link">
                  + Nhận vote
                </Link>
              )}
            </div>

            <div className="explore-status-pill">
              <span className="status-live-dot" />
              <span>
                {filtered.length} điểm đến
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dải Marquee hiển thị toàn bộ card tràn viền 100% hai bên màn hình (Full-width edge-to-edge) */}
      <section className="explore-marquee-fullwidth-section">
        {filtered.length > 0 ? (
          <MarqueeCards
            items={filtered}
            keyExtractor={(item) => item.id}
            speed={1.2}
            direction="left"
            interactive={true}
            pauseOnHover={true}
            gap={24}
            fadeEdges={true}
            fadeWidth={56}
            className="explore-destinations-marquee"
            renderItem={(item) => (
              <div className="explore-marquee-card-item">
                <DestinationCard
                  item={item}
                  rank={globalRankMap[item.id]}
                  isFavorite={favorites.includes(item.id)}
                  onToggleFavorite={onToggleFavorite}
                  onOpen={() => onOpenDetail(item)}
                  maxVotes={maxVotes}
                />
              </div>
            )}
          />
        ) : (
          <div className="container">
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
                }}
              >
                Đặt lại tất cả bộ lọc
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
