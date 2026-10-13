"use client"

import React, { useState, useEffect } from "react"
import Icon from "@/components/shared/Icon"
import { RankingEntry, MyRankingSummary, Badge, UserProfile } from "@/types/profile"
import { profileService } from "@/lib/profile/profileService"

interface TabRankingProps {
  userId: string
  profile: UserProfile
}

export default function TabRanking({ userId, profile }: TabRankingProps) {
  const [period, setPeriod] = useState<"week" | "month" | "all">("all")
  const [leaderboard, setLeaderboard] = useState<RankingEntry[]>([])
  const [mySummary, setMySummary] = useState<MyRankingSummary>({
    myRank: 14,
    totalVotes: profile.stats.totalVotes,
    gapToNextRank: 4,
  })
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([
      profileService.getRanking(period, userId),
      profileService.getBadges(userId),
    ]).then(([rankRes, badgesRes]) => {
      if (mounted) {
        setLeaderboard(rankRes.list)
        setMySummary(rankRes.mySummary)
        setBadges(badgesRes)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [period, userId])

  return (
    <div
      className="profile-panel-card"
      role="tabpanel"
      id="panel-xep-hang"
      aria-labelledby="tab-xep-hang"
    >
      <div className="profile-panel-header">
        <div className="panel-title-group">
          <h2>Bảng xếp hạng cử tri & Huy hiệu</h2>
          <p>Tôn vinh những người ủng hộ tích cực nhất cho các điểm đến nông thôn Việt Nam 2026.</p>
        </div>
      </div>

      {/* Rank overview banner */}
      <div className="rank-overview-card">
        <div className="rank-meta-text">
          <h3>Thứ hạng hiện tại: #{mySummary.myRank}</h3>
          <p>
            Bạn đã đóng góp tổng cộng {profile.stats.totalVotes} lượt bình chọn cho các điểm đến.
          </p>
        </div>
        <div className="gap-badge-pill">
          {mySummary.gapToNextRank > 0
            ? `Cần thêm +${mySummary.gapToNextRank} phiếu để lên hạng #${mySummary.myRank - 1} 🚀`
            : "Bạn đang trong nhóm dẫn đầu! 👑"}
        </div>
      </div>

      {/* Bảng Top 10 Người Dùng */}
      <div className="leaderboard-table-wrap">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text)", margin: 0 }}>
            🏆 Top 10 Người ủng hộ tiêu biểu
          </h3>

          <div className="period-toggle-tabs" role="tablist" aria-label="Thời gian bảng xếp hạng">
            <button
              type="button"
              role="tab"
              aria-selected={period === "week"}
              className={period === "week" ? "active" : ""}
              onClick={() => setPeriod("week")}
            >
              Tuần này
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={period === "month"}
              className={period === "month" ? "active" : ""}
              onClick={() => setPeriod("month")}
            >
              Tháng này
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={period === "all"}
              className={period === "all" ? "active" : ""}
              onClick={() => setPeriod("all")}
            >
              Toàn bộ
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="header-avatar-skeleton" style={{ width: "100%", height: 50, borderRadius: 10 }} />
            ))}
          </div>
        ) : (
          <div>
            {leaderboard.map((u) => (
              <div key={u.userId} className="leaderboard-row">
                <div className="user-rank-left">
                  <span className="rank-number">
                    {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`}
                  </span>
                  <img src={u.avatarUrl} alt={u.name} />
                  <div>
                    <strong>{u.name}</strong>
                    <small style={{ display: "block", fontSize: 11, color: "var(--color-text-muted)" }}>
                      Cấp: {u.level}
                    </small>
                  </div>
                </div>
                <div className="user-votes-right">{u.totalVotes} phiếu</div>
              </div>
            ))}

            {/* Pinned user row at the bottom if outside top 10 */}
            <div className="leaderboard-row my-row-highlight" style={{ marginTop: 12 }}>
              <div className="user-rank-left">
                <span className="rank-number">#{mySummary.myRank}</span>
                <img
                  src={
                    profile.avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                  }
                  alt={profile.name}
                />
                <div>
                  <strong style={{ color: "var(--color-primary-dark)" }}>
                    {profile.name} (Bạn)
                  </strong>
                  <small style={{ display: "block", fontSize: 11, color: "var(--color-primary)" }}>
                    Cấp: {profile.level} • Nhóm cử tri tích cực
                  </small>
                </div>
              </div>
              <div className="user-votes-right">{profile.stats.totalVotes} phiếu</div>
            </div>
          </div>
        )}
      </div>

      {/* Lưới huy hiệu đạt được */}
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text)", margin: "0 0 16px" }}>
          🏅 Bộ sưu tập huy hiệu danh dự ({badges.filter((b) => b.unlocked).length}/{badges.length})
        </h3>

        <div className="badges-grid-wrap">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`badge-card-item ${badge.unlocked ? "unlocked" : "locked"}`}
            >
              <div className="badge-icon-box">{badge.icon}</div>
              <div className="badge-details">
                <strong>{badge.name}</strong>
                <p>{badge.description}</p>
                {badge.unlocked ? (
                  <small>✓ Đã đạt: {badge.unlockedAt}</small>
                ) : (
                  <small>🔒 Điều kiện: {badge.conditionText}</small>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
