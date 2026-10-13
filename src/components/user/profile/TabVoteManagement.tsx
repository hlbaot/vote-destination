"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Icon from "@/components/shared/Icon"
import { useVotes } from "@/lib/store/useVotes"
import { UserTask } from "@/types/profile"
import { profileService } from "@/lib/profile/profileService"
import { useAppContext } from "@/context/AppContext"

interface TabVoteManagementProps {
  userId: string
}

function formatCountdownVN(): string {
  const now = new Date()
  const vnTimeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).format(now)

  const [h, m, s] = vnTimeStr.split(":").map(Number)
  const currentSeconds = h * 3600 + m * 60 + s
  const remainingSeconds = Math.max(0, 86400 - currentSeconds)

  const remH = Math.floor(remainingSeconds / 3600)
  const remM = Math.floor((remainingSeconds % 3600) / 60)
  const remS = remainingSeconds % 60

  return `${String(remH).padStart(2, "0")}:${String(remM).padStart(2, "0")}:${String(remS).padStart(2, "0")}`
}

export default function TabVoteManagement({ userId }: TabVoteManagementProps) {
  const {
    baseQuota,
    bonusQuota,
    usedToday,
    remainingToday,
    votedToday,
    refreshFromStorage,
  } = useVotes()

  const appContext = useAppContext()
  const [countdown, setCountdown] = useState(formatCountdownVN())
  const [tasks, setTasks] = useState<UserTask[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  // Countdown clock to 00:00 VN Time
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdownVN())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Load tasks from service
  useEffect(() => {
    let mounted = true
    profileService.getTasks(userId).then((data) => {
      if (mounted) {
        setTasks(data)
        setLoadingTasks(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [userId])

  // Compute Base votes remaining vs used
  const baseUsed = Math.min(usedToday, baseQuota)
  const baseRemaining = Math.max(0, baseQuota - baseUsed)

  // Bonus votes remaining
  const bonusUsed = Math.max(0, usedToday - baseQuota)
  const bonusRemaining = Math.max(0, bonusQuota - bonusUsed)

  // Match destination names from appContext
  const destinations = appContext?.destinations || []
  const votedDestinations = destinations.filter((d) =>
    votedToday.includes(d.id),
  )

  const handleClaim = async (task: UserTask) => {
    if (task.status === "claimed" || claimingId) return

    setClaimingId(task.id)
    try {
      const res = await profileService.claimTaskReward(userId, task.id)
      if (res.success) {
        // Refresh reactive vote store
        refreshFromStorage(userId)

        // Update local tasks state
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: "claimed" as const } : t,
          ),
        )
        appContext?.addToast?.("success", res.message)
      } else {
        appContext?.addToast?.("warning", res.message)
      }
    } catch {
      appContext?.addToast?.("warning", "Không thể nhận thưởng lúc này.")
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <div
      className="profile-panel-card"
      role="tabpanel"
      id="panel-vote"
      aria-labelledby="tab-vote"
    >
      <div className="profile-panel-header">
        <div className="panel-title-group">
          <h2>Quản lý lượt bình chọn</h2>
          <p>Theo dõi lượt vote gốc hằng ngày, vote thưởng nhiệm vụ và các điểm đến bạn đã gieo mầm hôm nay.</p>
        </div>
        {remainingToday > 0 && (
          <Link href="/vote" className="btn btn-primary" style={{ borderRadius: 100, fontSize: 13 }}>
            Đến trang bình chọn <Icon name="arrow" size={14} />
          </Link>
        )}
      </div>

      {/* Banner tổng quan lượt vote */}
      <div className="vote-overview-banner">
        <div className="vote-quota-numbers">
          <div className="quota-large-stat">
            <h3>{remainingToday}</h3>
            <span>Tổng lượt còn lại hôm nay</span>
          </div>

          <div className="quota-divider-vert" />

          <div className="quota-sub-pills">
            {/* Lượt gốc */}
            <div className="quota-sub-row">
              <span>Lượt gốc ({baseRemaining}/{baseQuota}):</span>
              <div className="leaves-trio" title={`${baseRemaining}/${baseQuota} lượt gốc còn lại`}>
                {Array.from({ length: baseQuota }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      opacity: i < baseRemaining ? 1 : 0.28,
                      filter: i < baseRemaining ? "none" : "grayscale(1)",
                    }}
                  >
                    🍃
                  </span>
                ))}
              </div>
            </div>

            {/* Lượt thưởng */}
            <div className="quota-sub-row">
              <span>Lượt thưởng:</span>
              <strong style={{ color: "#0284c7" }}>
                +{bonusRemaining} lượt
              </strong>
              <small style={{ color: "var(--color-text-muted)" }}>
                (từ nhiệm vụ & Quiz)
              </small>
            </div>
          </div>
        </div>

        {/* Đồng hồ đếm ngược đến 00:00 VN Time */}
        <div className="vote-countdown-block">
          <span>Làm mới lúc 00:00 (giờ VN) trong</span>
          <strong>{countdown}</strong>
        </div>
      </div>

      {/* Danh sách điểm đã vote hôm nay */}
      <div className="voted-today-box">
        <h4>🌿 Các điểm bạn đã bình chọn hôm nay ({votedDestinations.length})</h4>
        {votedDestinations.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
            Bạn chưa dùng lượt bình chọn nào hôm nay. Hãy chọn điểm đến để gieo mầm nhé!
          </p>
        ) : (
          <div className="voted-chips-wrap">
            {votedDestinations.map((d) => (
              <Link
                key={d.id}
                href={`/destination/${d.id}`}
                className="voted-chip"
                title={`Xem hồ sơ ${d.name}`}
              >
                <span>🍃 {d.name}</span>
                <small style={{ opacity: 0.7 }}>({d.province || d.place})</small>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Nhiệm vụ nhận thêm vote */}
      <div className="tasks-section-header">
        <h3>Làm nhiệm vụ nhận thêm lượt vote</h3>
        <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
          Lượt vote thưởng có giá trị tương đương phiếu gốc
        </span>
      </div>

      {loadingTasks ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="header-avatar-skeleton" style={{ width: "100%", height: 110, borderRadius: 16 }} />
          <div className="header-avatar-skeleton" style={{ width: "100%", height: 110, borderRadius: 16 }} />
        </div>
      ) : (
        <div className="tasks-cards-grid">
          {tasks.map((task) => {
            const isClaimed = task.status === "claimed"
            const isClaimable = task.status === "claimable"
            const isClaiming = claimingId === task.id

            return (
              <div key={task.id} className="task-card-item">
                <div>
                  <div className="task-card-top">
                    <strong>{task.title}</strong>
                    <span className="task-reward-pill">+{task.reward} vote</span>
                  </div>
                  <p>{task.description}</p>
                </div>

                <div className="task-card-bottom">
                  <span className="task-progress-text">
                    Tiến độ: {task.progress}/{task.maxProgress}
                  </span>

                  {isClaimed ? (
                    <button
                      type="button"
                      className="btn-claim-reward claimed"
                      disabled
                    >
                      ✓ Đã nhận
                    </button>
                  ) : isClaimable ? (
                    <button
                      type="button"
                      className="btn-claim-reward"
                      disabled={isClaiming}
                      onClick={() => handleClaim(task)}
                    >
                      {isClaiming ? "Đang xử lý..." : "Nhận thưởng 🎁"}
                    </button>
                  ) : (
                    <Link
                      href={task.id.includes("quiz") ? "/vote" : "/explore"}
                      className="btn btn-secondary"
                      style={{ borderRadius: 100, fontSize: 11.5, padding: "5px 12px" }}
                    >
                      Thực hiện →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
