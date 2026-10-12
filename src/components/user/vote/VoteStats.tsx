"use client"

import React, { useEffect, useState } from "react"
import { voteConfig } from "@/data/destinations"
import Icon from "@/components/shared/Icon"

interface VoteStatsProps {
  totalVotes: number
  destinationCount: number
}

// Format Date YYYY-MM-DD -> DD/MM/YYYY
function formatDateVN(dateStr: string) {
  if (!dateStr) return ""
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

// Calculate remaining days
function getDaysRemaining(endDateStr: string) {
  try {
    const end = new Date(endDateStr).getTime()
    const now = new Date().getTime()
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  } catch {
    return 60
  }
}

export default function VoteStats({
  totalVotes,
  destinationCount,
}: VoteStatsProps) {
  // Count-up animation for total votes
  const [displayVotes, setDisplayVotes] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayVotes(totalVotes)
      return
    }

    const start = 0
    const end = totalVotes
    const duration = 1200 // 1.2s
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      setDisplayVotes(Math.floor(start + (end - start) * easeProgress))

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setDisplayVotes(end)
      }
    }

    requestAnimationFrame(step)
  }, [totalVotes])

  const formattedStart = formatDateVN(voteConfig.startDate)
  const formattedEnd = formatDateVN(voteConfig.endDate)
  const daysLeft = getDaysRemaining(voteConfig.endDate)

  return (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Status */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border)] shadow-lg flex items-center gap-4 hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)] flex items-center justify-center flex-shrink-0">
            <Icon name="spark" size={24} className="text-[var(--color-primary-dark)]" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#63756F] block mb-1">
              Trạng thái hội thi
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Đang mở bình chọn
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
              Ghi nhận phiếu hợp lệ thời gian thực
            </p>
          </div>
        </div>

        {/* Card 2: Duration */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border)] shadow-lg flex items-center gap-4 hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/15 text-[#B8860B] flex items-center justify-center flex-shrink-0">
            <Icon name="calendar" size={24} className="text-[#8D6B1B]" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#63756F] block mb-1">
              Thời gian bình chọn
            </span>
            <div className="font-serif text-base sm:text-lg font-bold text-[var(--color-primary-dark)] tracking-tight">
              {formattedStart} – {formattedEnd}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
              <span className="inline-block px-1.5 py-0.2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded font-semibold">
                Còn {daysLeft} ngày
              </span>
              <span>đến hạn chót</span>
            </p>
          </div>
        </div>

        {/* Card 3: Total Votes */}
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border)] shadow-lg flex items-center gap-4 hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
            <Icon name="heart" size={24} className="text-[var(--color-accent)]" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#63756F] block mb-1">
              Tổng lượt bình chọn
            </span>
            <div className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-accent)] tracking-tight tabular-nums">
              {displayVotes.toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
              Toàn bộ {destinationCount} hồ sơ điểm đến
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
