"use client"
/**
 * DailyVoteCard – shows the user's daily vote quota (3 base + up to 2 bonus).
 * Leaf icons = base votes; Star icons = bonus votes.
 */
import React from "react"
import type { DailyVoteStatus } from "@/lib/api/mapService"
import { MAP_CONFIG } from "@/lib/api/mapService"

interface Props {
  status: DailyVoteStatus
  onDoQuiz: () => void
  onLogin?: () => void
}

function LeafIcon({ used, isBonus }: { used: boolean; isBonus: boolean }) {
  if (isBonus) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={used ? "var(--color-accent)" : "none"}
        stroke={used ? "var(--color-accent)" : "var(--color-border)"} strokeWidth="1.8">
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.167.751c.585.085.819.805.395 1.217l-3.738 3.644a2.12 2.12 0 0 0-.611 1.879l.882 5.14c.1.583-.513 1.028-1.036.753l-4.62-2.43a2.125 2.125 0 0 0-1.974 0l-4.62 2.43c-.523.275-1.136-.17-1.036-.753l.882-5.14a2.12 2.12 0 0 0-.61-1.879L1.058 10.09c-.423-.412-.19-1.132.395-1.217l5.166-.75a2.123 2.123 0 0 0 1.596-1.161l2.31-4.679Z"/>
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={used ? "var(--color-primary)" : "none"}
      stroke={used ? "var(--color-primary)" : "var(--color-border)"} strokeWidth="1.8">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  )
}

export default function DailyVoteCard({ status, onDoQuiz, onLogin }: Props) {
  const { baseQuota, bonusQuota, usedToday, quizTriesLeft, quizBonusClaimed, isLoggedIn } = status
  const totalQuota = baseQuota + bonusQuota
  const remaining = Math.max(0, totalQuota - usedToday)
  const allUsed = remaining === 0
  const allBonusClaimed = quizBonusClaimed || quizTriesLeft <= 0

  const slots = Array.from({ length: 5 }, (_, i) => ({
    used: i < usedToday,
    isBonus: i >= baseQuota,
    active: i < totalQuota,
  }))

  if (!isLoggedIn) {
    return (
      <div className="vote-daily-card bg-white/75 rounded-2xl border border-[var(--color-border)] p-3 text-center shrink-0">
        <div className="text-2xl mb-1">🌿</div>
        <p className="text-xs text-[var(--color-text-muted)] mb-2">Đăng nhập để bình chọn</p>
        <button onClick={onLogin} className="bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-xl font-semibold text-xs hover:bg-[var(--color-primary-hover)] transition-colors">
          Đăng nhập ngay
        </button>
      </div>
    )
  }

  return (
    <div className="vote-daily-card bg-white/75 backdrop-blur-sm rounded-2xl border border-[var(--color-border)] p-3 sm:p-3.5 shrink-0 flex flex-col justify-between"
      style={{ height: "155px", minHeight: "150px", maxHeight: "170px" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[var(--color-primary-dark)] text-xs sm:text-sm">Vote hôm nay</h3>
        <span className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-surface-tint)] px-2 py-0.5 rounded-full">
          Còn <span className="font-bold text-[var(--color-primary)]">{remaining}</span>/{totalQuota}
        </span>
      </div>

      {/* Vote slots + reset hint */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5">
          {slots.map((slot, i) => (
            <div key={i} className={`transition-all duration-300 ${!slot.active ? "opacity-25" : ""}`}>
              <LeafIcon used={slot.used} isBonus={slot.isBonus} />
            </div>
          ))}
          <div className="h-4 w-px bg-[var(--color-border)] mx-0.5" />
          <span className="text-[10px] text-[var(--color-text-muted)] leading-tight whitespace-nowrap">
            +{bonusQuota} thưởng
          </span>
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">00:00 làm mới</span>
      </div>

      {/* Quiz bonus CTA */}
      {allUsed ? (
        <div className="text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-tint)] rounded-xl py-2 border border-[var(--color-border)]">
          🌙 Hẹn bạn vào ngày mai!
        </div>
      ) : allBonusClaimed ? (
        <div className="flex items-center justify-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-xl py-2 border border-green-200">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m5 12 4 4L19 6"/>
          </svg>
          Đã nhận thưởng hôm nay
        </div>
      ) : (
        <button onClick={onDoQuiz}
          className="w-full flex items-center justify-between bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary-hover)] hover:to-[var(--color-primary)] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 group">
          <span className="flex items-center gap-1.5">
            <span className="text-sm">🎯</span>
            Làm nhiệm vụ nhận thêm vote
          </span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      )}
    </div>
  )
}
