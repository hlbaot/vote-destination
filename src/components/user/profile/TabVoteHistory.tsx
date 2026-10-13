"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Icon from "@/components/shared/Icon"
import { VoteHistoryItem, VoteHistoryFilter } from "@/types/profile"
import { profileService } from "@/lib/profile/profileService"

interface TabVoteHistoryProps {
  userId: string
}

function formatVNTime(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d)
  } catch {
    return iso
  }
}

export default function TabVoteHistory({ userId }: TabVoteHistoryProps) {
  const router = useRouter()
  const [items, setItems] = useState<VoteHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [mostVoted, setMostVoted] = useState<{ name: string; count: number } | undefined>()
  const [loading, setLoading] = useState(true)

  // Filters state
  const [timeRange, setTimeRange] = useState<VoteHistoryFilter["timeRange"]>("all")
  const [voteType, setVoteType] = useState<VoteHistoryFilter["voteType"]>("all")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<VoteHistoryFilter["sortBy"]>("newest")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const loadData = useCallback(
    async (currentPage = 1) => {
      setLoading(true)
      try {
        const res = await profileService.getVoteHistory(userId, {
          timeRange,
          voteType,
          search,
          sortBy,
          page: currentPage,
          pageSize,
        })
        setItems(res.items)
        setTotal(res.total)
        setMostVoted(res.mostVotedDestination)
      } finally {
        setLoading(false)
      }
    },
    [userId, timeRange, voteType, search, sortBy],
  )

  useEffect(() => {
    setPage(1)
    loadData(1)
  }, [loadData])

  const handleRowClick = (item: VoteHistoryItem) => {
    if (item.destinationId && !item.destinationId.includes("task")) {
      router.push(`/destination/${item.destinationId}`)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div
      className="profile-panel-card"
      role="tabpanel"
      id="panel-lich-su"
      aria-labelledby="tab-lich-su"
    >
      <div className="profile-panel-header">
        <div className="panel-title-group">
          <h2>Lịch sử bình chọn</h2>
          <p>Xem toàn bộ nhật ký các lượt vote bạn đã đóng góp cho các vùng quê và di sản.</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="vote-history-summary-strip">
        <div className="vh-stat-item">
          <span>Tổng số lượt bình chọn: </span>
          <strong>{total} phiếu</strong>
        </div>
        {mostVoted && (
          <div className="vh-stat-item">
            <span>Điểm đến bạn ủng hộ nhiều nhất: </span>
            <strong>{mostVoted.name} ({mostVoted.count} phiếu)</strong>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="history-filter-toolbar">
        <div className="toolbar-left-filters">
          {/* Time range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            aria-label="Lọc theo thời gian"
          >
            <option value="all">Mọi thời điểm</option>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
          </select>

          {/* Vote type */}
          <select
            value={voteType}
            onChange={(e) => setVoteType(e.target.value as any)}
            aria-label="Lọc theo loại phiếu"
          >
            <option value="all">Tất cả loại phiếu</option>
            <option value="base">Phiếu gốc</option>
            <option value="bonus">Phiếu thưởng</option>
          </select>

          {/* Search */}
          <input
            type="text"
            className="history-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên điểm đến..."
            aria-label="Tìm kiếm điểm đến"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          aria-label="Sắp xếp thời gian"
        >
          <option value="newest">Mới nhất trước</option>
          <option value="oldest">Cũ nhất trước</option>
        </select>
      </div>

      {/* History Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="header-avatar-skeleton"
              style={{ width: "100%", height: 60, borderRadius: 12 }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: "var(--color-surface-tint)",
            borderRadius: 16,
            border: "1.5px dashed var(--color-border)",
          }}
        >
          <span style={{ fontSize: 44, display: "block", marginBottom: 12 }}>🌱</span>
          <strong style={{ display: "block", fontSize: 16, color: "var(--color-text)", marginBottom: 6 }}>
            Bạn chưa có lượt bình chọn nào phù hợp bộ lọc
          </strong>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 16px" }}>
            Khám phá 68 điểm đến nông thôn Việt Nam và bắt đầu gieo mầm ngay hôm nay!
          </p>
          <Link href="/vote" className="btn btn-primary" style={{ borderRadius: 100 }}>
            Bình chọn ngay <Icon name="arrow" size={14} />
          </Link>
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="vote-history-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Điểm đến được bình chọn</th>
                  <th>Địa phương</th>
                  <th>Loại phiếu</th>
                  <th style={{ textAlign: "right" }}>Số phiếu</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="history-row-item"
                    onClick={() => handleRowClick(item)}
                    title="Nhấp để xem chi tiết điểm đến"
                  >
                    <td style={{ color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {formatVNTime(item.timestamp)}
                    </td>
                    <td>
                      <div className="table-dest-cell">
                        <img
                          src={item.destinationImage}
                          alt={item.destinationName}
                        />
                        <div>
                          <strong>{item.destinationName}</strong>
                          <small>{item.region} Việt Nam</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--color-text)" }}>{item.province}</td>
                    <td>
                      <span
                        className={`badge-vote-type ${
                          item.voteType === "bonus" ? "type-bonus" : "type-base"
                        }`}
                      >
                        {item.voteType === "bonus" ? "Phiếu thưởng" : "Phiếu gốc"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "var(--color-primary)" }}>
                      +{item.voteCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination / Load more */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 20,
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              <span>
                Hiển thị trang {page}/{totalPages} ({total} kết quả)
              </span>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page <= 1}
                  onClick={() => {
                    const p = page - 1
                    setPage(p)
                    loadData(p)
                  }}
                  style={{ borderRadius: 100, padding: "5px 14px", fontSize: 12 }}
                >
                  ← Trang trước
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => {
                    const p = page + 1
                    setPage(p)
                    loadData(p)
                  }}
                  style={{ borderRadius: 100, padding: "5px 14px", fontSize: 12 }}
                >
                  Trang sau →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
