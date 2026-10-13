"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Destination } from "@/types"
import Icon from "@/components/shared/Icon"
import { useVotes } from "@/lib/store/useVotes"
import { useAppContext } from "@/context/AppContext"
import { useAuth } from "@/context/AuthContext"

export default function DestinationCard({
  item,
  onOpen,
  rank,
  isFavorite,
  onToggleFavorite,
  maxVotes = 50000,
}: {
  item: Destination
  onOpen: () => void
  rank?: number | string
  isFavorite: boolean
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  maxVotes?: number
}) {
  const { addToast, handleRecordVote } = useAppContext()
  const { user, status, openAuthPromptModal } = useAuth()
  const {
    votesByDestination,
    remainingToday,
    votedToday,
    castVote,
    isSubmittingVote,
  } = useVotes()

  const [showPlusOne, setShowPlusOne] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  // Lấy số phiếu thực tế từ store dùng chung, fallback rawVotes
  const currentVotes = votesByDestination[item.id] ?? item.rawVotes
  const hasVotedToday = votedToday.includes(item.id)
  const isSubmitting = isSubmittingVote[item.id] || false
  const isOutOfVotes = remainingToday <= 0 && !hasVotedToday
  const isClosed = item.status !== "active"

  const displayRank = useMemo(() => {
    if (rank === undefined) return "#--"
    if (typeof rank === "number") return `#${rank}`
    return rank.startsWith("#") ? rank : `#${rank}`
  }, [rank])

  // Tỉ lệ phần trăm so với điểm đứng đầu (tối thiểu 10% để hiển thị thanh)
  const votePercentage = useMemo(() => {
    if (!maxVotes || maxVotes <= 0) return 30
    const pct = Math.round((currentVotes / maxVotes) * 100)
    return Math.max(10, Math.min(100, pct))
  }, [currentVotes, maxVotes])

  // Xử lý nút Yêu thích (nút tim) - tách biệt hoàn toàn với vote
  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    onToggleFavorite(item.id, event)
  }

  const doExecuteVote = async () => {
    const res = await castVote(item.id, item.name, (destName, stageName) => {
      addToast("success", `Cây ${destName} đã lên giai đoạn ${stageName}! 🎉`)
    })

    if (res.success) {
      setShowPlusOne(true)
      setShowBurst(true)
      setTimeout(() => setShowPlusOne(false), 850)
      setTimeout(() => setShowBurst(false), 800)

      handleRecordVote(item.id, "explore-card", `EXP-${Date.now()}`)
      addToast("success", `Đã bình chọn ${item.name}! 🌿`)
    } else {
      addToast("warning", res.error || "Không thể thực hiện bình chọn.")
    }
  }

  // Xử lý nút Bình chọn trực tiếp
  const handleVoteClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()

    if (isClosed || isSubmitting) return

    if (user?.role === "admin") {
      addToast("warning", "Quản trị viên không tham gia bình chọn.")
      return
    }

    if (status !== "authenticated") {
      openAuthPromptModal(undefined, doExecuteVote)
      return
    }

    if (hasVotedToday) {
      addToast("info", `Bạn đã bình chọn cho ${item.name} hôm nay rồi.`)
      return
    }

    if (isOutOfVotes) {
      addToast(
        "warning",
        "Hết lượt hôm nay, làm mới lúc 00:00 (giờ Việt Nam). Bạn có thể làm nhiệm vụ để nhận thêm vote!",
      )
      return
    }

    await doExecuteVote()
  }


  return (
    <article className="destination-card">
      {/* 1. Phần Ảnh chiếm diện tích lớn với Gradient Overlay & Nút Tim nổi */}
      <div className="card-media-wrapper">
        <a
          className="card-image-link"
          href={`/destination/${item.id}`}
          onClick={(event) => {
            event.preventDefault()
            onOpen()
          }}
          aria-label={`Xem hồ sơ ${item.name}`}
        >
          <img
            src={item.thumbnail || item.image}
            alt={`Ảnh đại diện ${item.name}`}
            loading="lazy"
            className="card-media-img"
          />

          {/* Lớp phủ gradient chân ảnh để đặt tên & địa phương */}
          <div className="card-media-gradient-scrim" />

          {/* Tag loại hình nằm góc trên bên trái ảnh */}
          <span className="card-type-tag">
            {item.category || item.tag}
          </span>

          {/* Tên điểm đến & Địa phương đè lên phần gradient chân ảnh */}
          <div className="card-overlay-info">
            <h3 className="card-overlay-name">{item.name}</h3>
            <p className="card-overlay-place">
              <Icon name="map" size={13} />
              <span>{item.province || item.place}, {item.region}</span>
            </p>
          </div>
        </a>

        {/* Nút tim yêu thích nổi ở góc trên bên phải ảnh */}
        <button
          type="button"
          className={`card-heart-pill ${isFavorite ? "is-favorited" : ""}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? `Bỏ yêu thích ${item.name}` : `Yêu thích ${item.name}`}
          title={isFavorite ? "Đã yêu thích" : "Yêu thích"}
        >
          <Icon name="heart" size={18} />
        </button>
      </div>

      {/* 2. Thân card */}
      <div className="card-content-body">
        {/* Mục Giới thiệu (giới hạn tối đa 2 dòng) */}
        <div className="card-intro-section">
          <span className="intro-badge-title">Giới thiệu</span>
          <p className="intro-snippet-text">
            {item.shortDescription || item.introduction || item.lead}
          </p>
        </div>

        {/* Xếp hạng đề cử */}
        <div className="card-rank-row" aria-label={`Xếp hạng: ${displayRank}`}>
          <span className="card-rank-label">Xếp hạng</span>
          <strong className="card-rank-val">{displayRank}</strong>
        </div>

        {/* Lượt bình chọn & Thanh tiến trình */}
        <div className="card-vote-footer">
          <div className="vote-stat-header">
            <span className="vote-stat-label">Lượt bình chọn</span>
            <div className="vote-stat-number-wrapper" aria-live="polite">
              <strong className="vote-stat-number">
                {currentVotes.toLocaleString("vi-VN")}
              </strong>
              {showPlusOne && (
                <span className="vote-plus-one-badge" aria-hidden="true">
                  +1
                </span>
              )}
            </div>
          </div>

          <div
            className="vote-progress-track"
            title={`${votePercentage}% so với điểm đến dẫn đầu`}
          >
            <div
              className="vote-progress-fill"
              style={{ width: `${votePercentage}%` }}
            />
          </div>

          {/* NÚT BÌNH CHỌN TRỰC TIẾP */}
          <div className="card-vote-action-wrap">
            {showBurst && (
              <div className="leaf-burst-container" aria-hidden="true">
                <span className="leaf-particle leaf-1">🍃</span>
                <span className="leaf-particle leaf-2">🌿</span>
                <span className="leaf-particle leaf-3">🍃</span>
                <span className="leaf-particle leaf-4">🌱</span>
              </div>
            )}

            <button
              type="button"
              className={`btn-card-vote ${
                isSubmitting
                  ? "is-submitting"
                  : hasVotedToday
                    ? "is-voted"
                    : isOutOfVotes
                      ? "is-out-of-votes"
                      : ""
              }`}
              onClick={handleVoteClick}
              disabled={isSubmitting || hasVotedToday || isOutOfVotes || isClosed}
              aria-label={`Bình chọn cho ${item.name}`}
              aria-disabled={isSubmitting || hasVotedToday || isOutOfVotes || isClosed}
              title={
                hasVotedToday
                  ? "Đã bình chọn điểm đến này hôm nay"
                  : isOutOfVotes
                    ? "Hết lượt hôm nay, làm mới lúc 00:00 (giờ Việt Nam)"
                    : `Bình chọn cho ${item.name}`
              }
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  <span>Đang gửi…</span>
                </>
              ) : hasVotedToday ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Đã bình chọn ✓</span>
                </>
              ) : isOutOfVotes ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  <span>Hết lượt hôm nay</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                  <span>Bình chọn</span>
                </>
              )}
            </button>

            {isOutOfVotes && (
              <div className="vote-quota-hint">
                <span>Làm mới lúc 00:00 (giờ VN)</span>
                <Link
                  href="/ban-do-binh-chon"
                  className="link-earn-votes"
                  onClick={(e) => e.stopPropagation()}
                >
                  Nhận thêm vote →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

