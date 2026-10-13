"use client"
/**
 * LeaderboardPanel – "Vườn cây nổi bật" leaderboard.
 * Tabs: Điểm đến / Tỉnh·Thành. Live updates via parent polling.
 */
import React, { useState } from "react"
import type { LeaderboardEntry } from "@/lib/api/mapService"
import TreeIcon from "./TreeIcon"

interface ProvinceEntry {
  name: string; totalVotes: number; rank: number; destinationCount: number; region: string;
}

interface Props {
  entries: LeaderboardEntry[]
  provinceEntries: ProvinceEntry[]
  selectedId: string | null
  hoveredId?: string | null
  onSelect: (id: string) => void
  flashIds: Set<string>
  filterKey?: string
}

const RANK_EMOJI = ["🥇", "🥈", "🥉"]

export default function LeaderboardPanel({
  entries,
  provinceEntries,
  selectedId,
  hoveredId,
  onSelect,
  flashIds,
  filterKey,
}: Props) {
  const [tab, setTab] = useState<"dest" | "province">("dest")
  const listRef = React.useRef<HTMLDivElement>(null)
  const [canScrollTop, setCanScrollTop] = useState(false)
  const [canScrollBottom, setCanScrollBottom] = useState(false)

  const checkScroll = React.useCallback(() => {
    const el = listRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    setCanScrollTop(scrollTop > 4)
    setCanScrollBottom(scrollTop + clientHeight < scrollHeight - 6)
  }, [])

  // Check scroll when list changes or on resize
  React.useEffect(() => {
    checkScroll()
  }, [entries, provinceEntries, tab, checkScroll])

  // Reset scroll on tab change or filter change
  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
      checkScroll()
    }
  }, [tab, filterKey, checkScroll])

  // Auto scroll to selected or hovered item
  React.useEffect(() => {
    const targetId = hoveredId || selectedId
    if (!targetId || tab !== "dest" || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-dest-id="${targetId}"]`)
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [selectedId, hoveredId, tab])

  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: canScrollTop && canScrollBottom
      ? "linear-gradient(to bottom, transparent 0%, black 14px, black calc(100% - 14px), transparent 100%)"
      : canScrollTop
      ? "linear-gradient(to bottom, transparent 0%, black 14px, black 100%)"
      : canScrollBottom
      ? "linear-gradient(to bottom, black 0%, black calc(100% - 14px), transparent 100%)"
      : undefined,
    maskImage: canScrollTop && canScrollBottom
      ? "linear-gradient(to bottom, transparent 0%, black 14px, black calc(100% - 14px), transparent 100%)"
      : canScrollTop
      ? "linear-gradient(to bottom, transparent 0%, black 14px, black 100%)"
      : canScrollBottom
      ? "linear-gradient(to bottom, black 0%, black calc(100% - 14px), transparent 100%)"
      : undefined,
  }

  return (
    <div className="bg-white/75 backdrop-blur-sm rounded-2xl border border-[var(--color-border)] overflow-hidden flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-3.5 pt-3 pb-0 flex-shrink-0">
        <h3 className="font-serif text-[var(--color-primary-dark)] text-sm font-bold mb-2">🌲 Vườn cây nổi bật</h3>
        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)] mb-2 bg-[var(--color-surface-tint)]/40 p-0.5">
          <button
            onClick={() => setTab("dest")}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors duration-150 ${
              tab === "dest"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary-dark)]"
            }`}
          >
            Điểm đến ({entries.length})
          </button>
          <button
            onClick={() => setTab("province")}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors duration-150 ${
              tab === "province"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-primary-dark)]"
            }`}
          >
            Tỉnh/Thành ({provinceEntries.length})
          </button>
        </div>
      </div>

      {/* List container */}
      <div
        ref={listRef}
        onScroll={checkScroll}
        style={maskStyle}
        className="vote-leaderboard-list flex-1 min-h-0 overflow-y-auto px-2 pb-2 transition-[mask-image] duration-200"
      >
        {tab === "dest" ? (
          <div className="space-y-0.5">
            {entries.map((entry) => {
              const isSelected = entry.id === selectedId
              const isHovered = entry.id === hoveredId
              const isFlash = flashIds.has(entry.id)
              return (
                <button
                  key={entry.id}
                  data-dest-id={entry.id}
                  onClick={() => onSelect(entry.id)}
                  className={`w-full flex items-center gap-2 px-2.5 rounded-xl text-left transition-all duration-150 h-11 min-h-[44px] max-h-[48px] ${
                    isSelected
                      ? "bg-[var(--color-surface-tint)] border border-[var(--color-primary)] shadow-xs"
                      : isHovered
                      ? "bg-[var(--color-surface-tint)]/70 border border-[var(--color-border)]"
                      : "hover:bg-[var(--color-surface-tint)]/50 border border-transparent"
                  } ${isFlash ? "animate-pulse" : ""}`}
                >
                  {/* Rank badge */}
                  <div className="flex-shrink-0 w-5 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-[17px] leading-none">{RANK_EMOJI[entry.rank - 1]}</span>
                    ) : (
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">{entry.rank}</span>
                    )}
                  </div>

                  {/* Tree icon */}
                  <div className="flex-shrink-0">
                    <TreeIcon stage={entry.stage} size={24} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[13px] font-semibold truncate leading-tight ${
                          isSelected ? "text-[var(--color-primary-dark)] font-bold" : "text-[var(--color-text)]"
                        }`}
                      >
                        {entry.name}
                      </span>
                      {entry.isTrending && (
                        <span className="flex-shrink-0 text-[10px] bg-[var(--color-accent)]/15 text-[var(--color-accent)] px-1 py-0.2 rounded-full font-bold">
                          🔥
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--color-text-muted)] truncate block leading-tight">
                      {entry.province}
                    </span>
                  </div>

                  {/* Votes */}
                  <span
                    className={`text-xs font-bold flex-shrink-0 ${
                      isFlash ? "text-[var(--color-accent)]" : "text-[var(--color-primary-dark)]"
                    }`}
                  >
                    {entry.rawVotes >= 1000 ? `${(entry.rawVotes / 1000).toFixed(1)}K` : entry.rawVotes.toLocaleString("vi-VN")}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-0.5">
            {provinceEntries.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 px-2.5 rounded-xl hover:bg-[var(--color-surface-tint)]/50 transition-colors h-11 min-h-[44px] max-h-[48px]"
                title={`${p.name}: ${p.destinationCount} điểm đến`}
              >
                <div className="flex-shrink-0 w-5 text-center">
                  {p.rank <= 3 ? (
                    <span className="text-[17px] leading-none">{RANK_EMOJI[p.rank - 1]}</span>
                  ) : (
                    <span className="text-xs font-bold text-[var(--color-text-muted)]">{p.rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--color-text)] truncate leading-tight">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)] truncate leading-tight">
                    {p.destinationCount} điểm đến · {p.region}
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--color-primary-dark)] shrink-0">
                  {p.totalVotes >= 1000 ? `${(p.totalVotes / 1000).toFixed(1)}K` : p.totalVotes.toLocaleString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="px-3 py-1.5 border-t border-[var(--color-border)] bg-[var(--color-surface-tint)]/60 flex-shrink-0">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center italic">
          Chỉ tính phiếu hợp lệ đã qua xác minh
        </p>
      </div>
    </div>
  )
}
