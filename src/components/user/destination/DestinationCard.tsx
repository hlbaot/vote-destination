"use client"

import React, { useMemo, useState } from "react"
import { Destination } from "../types"
import Icon from "./Icon"

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
  const [hasVoted, setHasVoted] = useState(isFavorite)
  const [displayVotes, setDisplayVotes] = useState(item.rawVotes)

  const displayRank = useMemo(() => {
    if (rank === undefined) return "#--"
    if (typeof rank === "number") return `#${rank}`
    return rank.startsWith("#") ? rank : `#${rank}`
  }, [rank])

  const isClosed = item.status !== "active"
  const isHeartActive = isFavorite || hasVoted
  const voteLabel = isClosed
    ? "Bình chọn đã kết thúc"
    : isHeartActive
      ? `Đã yêu thích ${item.name}`
      : `Bình chọn cho ${item.name}`

  // Tỉ lệ phần trăm so với điểm đứng đầu (tối thiểu 8% để hiển thị thanh)
  const votePercentage = useMemo(() => {
    if (!maxVotes || maxVotes <= 0) return 30
    const pct = Math.round((displayVotes / maxVotes) * 100)
    return Math.max(10, Math.min(100, pct))
  }, [displayVotes, maxVotes])

  const handleVote = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    if (isClosed) return
    if (!hasVoted) {
      setHasVoted(true)
      setDisplayVotes((current) => current + 1)
    }
    onToggleFavorite(item.id, event)
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
          className={`card-heart-pill ${isHeartActive ? "is-favorited" : ""} ${
            isClosed ? "is-disabled" : ""
          }`}
          onClick={handleVote}
          aria-label={voteLabel}
          title={voteLabel}
        >
          <Icon name="heart" size={18} />
        </button>
      </div>

      {/* 2. Thân card: Giới thiệu 2 dòng, 3 chỉ số không bị cắt chữ, Lượt bình chọn & Progress bar */}
      <div className="card-content-body">
        {/* Mục Giới thiệu (giới hạn tối đa 2 dòng) */}
        <div className="card-intro-section">
          <span className="intro-badge-title">Giới thiệu</span>
          <p className="intro-snippet-text">
            {item.shortDescription || item.introduction || item.lead}
          </p>
        </div>

        {/* 3 chỉ số hiển thị dạng Chip / Hộp đầy đủ chữ, không bị cắt text */}
        <div className="card-metrics-row" aria-label={`Thông số ${item.name}`}>
          <div className="metric-box">
            <span className="metric-box-label">Loại hình</span>
            <strong className="metric-box-val">{item.category || item.tag}</strong>
          </div>

          <div className="metric-box">
            <span className="metric-box-label">Mùa đẹp nhất</span>
            <strong className="metric-box-val">{item.bestTime || "Quanh năm"}</strong>
          </div>

          <div className="metric-box rank-box">
            <span className="metric-box-label">Xếp hạng</span>
            <strong className="metric-box-val rank-val">{displayRank}</strong>
          </div>
        </div>

        {/* Lượt bình chọn to lớn + Thanh tiến trình nhỏ so với điểm đứng đầu */}
        <div className="card-vote-footer">
          <div className="vote-stat-header">
            <span className="vote-stat-label">Lượt bình chọn</span>
            <strong className="vote-stat-number">
              {displayVotes.toLocaleString("vi-VN")}
            </strong>
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
        </div>
      </div>
    </article>
  )
}
