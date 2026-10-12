"use client"

import React from "react"
import { Destination } from "@/types"
import Icon from "@/components/shared/Icon"

interface VoteLeaderboardProps {
  destinations: Destination[]
  selectedDestinationId: string
  onSelectDestination: (dest: Destination) => void
}

export default function VoteLeaderboard({
  destinations,
  selectedDestinationId,
  onSelectDestination,
}: VoteLeaderboardProps) {
  // Sort descending by raw votes
  const sorted = [...destinations].sort((a, b) => b.rawVotes - a.rawVotes)
  const top1 = sorted[0]
  const top2 = sorted[1]
  const top3 = sorted[2]
  const rest = sorted.slice(3, 10)

  const maxVotes = top1 ? top1.rawVotes : 1

  return (
    <aside className="w-full bg-[var(--color-surface)] text-[var(--color-text)] rounded-3xl p-5 sm:p-6 border border-[var(--color-border)] shadow-[var(--shadow-brand)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--color-accent)]">
              BẢNG XẾP HẠNG TẠM THỜI
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-primary-dark)] tracking-tight">
            Top 10 Dẫn Đầu
          </h2>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-tint)] text-[var(--color-primary-dark)] text-[11px] font-medium border border-[var(--color-border)]">
          Trực tiếp
        </span>
      </div>

      {/* TOP 3 PODIUM (BỤC VINH DANH) */}
      <div className="pt-4 pb-2">
        <div className="text-center text-xs text-[var(--color-text-muted)] mb-4">
          Bấm vào điểm đến để chọn nhanh cho lượt bình chọn
        </div>
        <div className="grid grid-cols-3 items-end gap-2 sm:gap-3">
          {/* RANK 2 (Bên trái) */}
          {top2 && (
            <button
              type="button"
              onClick={() => onSelectDestination(top2)}
              className={`group flex flex-col items-center text-center p-2 rounded-2xl transition-all cursor-pointer ${selectedDestinationId === top2.id
                  ? "bg-[var(--color-surface-tint)] ring-2 ring-[var(--color-accent)]"
                  : "hover:bg-[var(--color-surface-tint)]"
                }`}
            >
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#CBD5E1] shadow-md group-hover:scale-105 transition-transform bg-[var(--color-surface-tint)]">
                  <img
                    src={top2.thumbnail || `/images/destinations/${top2.id}.webp`}
                    alt={top2.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ; (e.target as HTMLImageElement).src = "/images/destinations/57.webp"
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#CBD5E1] text-[var(--color-primary-dark)] text-xs font-black flex items-center justify-center shadow">
                  2
                </span>
              </div>
              <strong className="text-xs sm:text-sm text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                {top2.name}
              </strong>
              <small className="text-[11px] text-[var(--color-text-muted)] block truncate max-w-full">
                {top2.province}
              </small>
              <span className="text-xs font-bold text-[var(--color-accent)] mt-1">
                {top2.votes}
              </span>
              <div className="w-full h-10 sm:h-12 bg-[var(--color-surface-tint)] rounded-t-lg mt-2 flex items-center justify-center border-t border-[var(--color-border)]">
                <span className="text-[11px] font-bold text-[#CBD5E1]">Bạc</span>
              </div>
            </button>
          )}

          {/* RANK 1 (Ở giữa - Cao nhất) */}
          {top1 && (
            <button
              type="button"
              onClick={() => onSelectDestination(top1)}
              className={`group flex flex-col items-center text-center p-2 rounded-2xl transition-all cursor-pointer relative -mt-4 ${selectedDestinationId === top1.id
                  ? "bg-[var(--color-surface-tint)] ring-2 ring-[var(--color-accent)]"
                  : "hover:bg-[var(--color-surface-tint)]"
                }`}
            >
              {/* Crown Icon */}
              <div className="text-[var(--color-accent)] animate-bounce mb-1">
                <Icon name="star" size={18} />
              </div>
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-[var(--color-accent)] shadow-lg group-hover:scale-105 transition-transform ring-4 ring-[var(--color-accent)]/20 bg-[var(--color-surface-tint)]">
                  <img
                    src={top1.thumbnail || `/images/destinations/${top1.id}.webp`}
                    alt={top1.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ; (e.target as HTMLImageElement).src = "/images/destinations/57.webp"
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[var(--color-accent)] text-[var(--color-primary-dark)] text-xs font-black flex items-center justify-center shadow-lg">
                  1
                </span>
              </div>
              <strong className="text-sm sm:text-base font-serif line-clamp-1 text-[var(--color-primary-dark)] group-hover:text-[var(--color-primary)] transition-colors">
                {top1.name}
              </strong>
              <small className="text-[11px] text-[var(--color-accent)] font-medium block truncate max-w-full">
                {top1.province}
              </small>
              <span className="text-xs sm:text-sm font-black text-[var(--color-accent)] mt-1">
                {top1.votes}
              </span>
              <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-[var(--color-accent)]/25 to-[var(--color-accent)]/15 rounded-t-xl mt-2 flex items-center justify-center border-t-2 border-[var(--color-accent)]">
                <span className="text-xs font-black text-[var(--color-accent)] uppercase tracking-wider">
                  QUÁN QUÂN
                </span>
              </div>
            </button>
          )}

          {/* RANK 3 (Bên phải) */}
          {top3 && (
            <button
              type="button"
              onClick={() => onSelectDestination(top3)}
              className={`group flex flex-col items-center text-center p-2 rounded-2xl transition-all cursor-pointer ${selectedDestinationId === top3.id
                  ? "bg-[var(--color-surface-tint)] ring-2 ring-[var(--color-accent)]"
                  : "hover:bg-[var(--color-surface-tint)]"
                }`}
            >
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[var(--color-accent)] shadow-md group-hover:scale-105 transition-transform bg-[var(--color-surface-tint)]">
                  <img
                    src={top3.thumbnail || `/images/destinations/${top3.id}.webp`}
                    alt={top3.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ; (e.target as HTMLImageElement).src = "/images/destinations/57.webp"
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs font-black flex items-center justify-center shadow">
                  3
                </span>
              </div>
              <strong className="text-xs sm:text-sm text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                {top3.name}
              </strong>
              <small className="text-[11px] text-[var(--color-text-muted)] block truncate max-w-full">
                {top3.province}
              </small>
              <span className="text-xs font-bold text-[var(--color-accent)] mt-1">
                {top3.votes}
              </span>
              <div className="w-full h-8 sm:h-10 bg-[var(--color-surface-tint)] rounded-t-lg mt-2 flex items-center justify-center border-t border-[var(--color-border)]">
                <span className="text-[11px] font-bold text-[var(--color-accent)]">Đồng</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* RANKS 4 TO 10 (COMPACT LIST WITH PROGRESS BARS) */}
      <div className="space-y-2 border-t border-[var(--color-border)] pt-4">
        <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">
          VỊ TRÍ 04 ĐẾN 10
        </span>
        {rest.map((item, idx) => {
          const rank = idx + 4
          const percent = Math.min(100, Math.round((item.rawVotes / maxVotes) * 100))
          const isSelected = selectedDestinationId === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectDestination(item)}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer group ${isSelected
                  ? "bg-[var(--color-surface-tint)] ring-1 ring-[var(--color-accent)]"
                  : "hover:bg-[var(--color-surface-tint)]"
                }`}
            >
              {/* Rank number */}
              <span className="w-6 text-center font-bold text-xs text-[var(--color-text-muted)]">
                #{rank}
              </span>

              {/* Small Thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-black/20 border border-white/10">
                <img
                  src={item.thumbnail || `/images/destinations/${item.id}.webp`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  onError={(e) => {
                    ; (e.target as HTMLImageElement).src = "/images/destinations/57.webp"
                  }}
                />
              </div>

              {/* Info + Progress Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                    {item.name}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-accent)] tabular-nums">
                    {item.votes}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mb-1">
                  <span className="truncate">{item.province}</span>
                  <span>{percent}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[var(--color-surface-tint)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)] rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="pt-2 text-center text-[11px] text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
        Cập nhật tự động sau mỗi lượt bình chọn hợp lệ
      </div>
    </aside>
  )
}
