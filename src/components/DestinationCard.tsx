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
}: {
  item: Destination
  onOpen: () => void
  rank?: number | string
  isFavorite: boolean
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
}) {
  const [hasVoted, setHasVoted] = useState(isFavorite)
  const [displayVotes, setDisplayVotes] = useState(item.rawVotes)

  const displayRank = useMemo(() => {
    if (rank === undefined) return "#--"
    if (typeof rank === "number") return `#${rank}`
    return rank.startsWith("#") ? rank : `#${rank}`
  }, [rank])

  const isClosed = item.status !== "active"
  const voteLabel = isClosed
    ? "Bình chọn đã kết thúc"
    : hasVoted
      ? `Đã bình chọn cho ${item.name}`
      : `Bình chọn cho ${item.name}`

  const handleVote = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (hasVoted || isClosed) return
    setHasVoted(true)
    setDisplayVotes((current) => current + 1)
    onToggleFavorite(item.id, event)
  }

  return (
    <article className="destination-card">
      <a
        className="card-image"
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
        />
        <span className="rank-badge">
          {typeof rank === "number" && rank <= 10 ? "Top 10" : item.category || item.tag}
        </span>
      </a>

      <div className="card-copy">
        <a
          className="card-title-link"
          href={`/destination/${item.id}`}
          onClick={(event) => {
            event.preventDefault()
            onOpen()
          }}
        >
          <h3>{item.name}</h3>
        </a>
        <p className="card-location">
          <Icon name="map" size={15} /> {item.province || item.place},{" "}
          {item.region}
        </p>

        <div className="card-description">
          <span>Giới thiệu</span>
          <p>{item.shortDescription || item.lead}</p>
        </div>

        <div className="card-stats" aria-label={`Thông số ${item.name}`}>
          <div>
            <span>Loại hình</span>
            <strong>{item.category || item.tag}</strong>
          </div>
          <div>
            <span>Mùa đẹp nhất</span>
            <strong>{item.bestTime || "Quanh năm"}</strong>
          </div>
          <div>
            <span>Xếp hạng</span>
            <strong>{displayRank}</strong>
          </div>
        </div>

        <div className="card-footer">
          <div className="vote-total">
            <span>Lượt bình chọn</span>
            <strong>{displayVotes.toLocaleString("vi-VN")}</strong>
          </div>
        <button
            className={`vote-circle-button ${hasVoted ? "is-voted" : ""} ${
              isClosed ? "is-closed" : ""
            }`}
            onClick={handleVote}
            aria-label={voteLabel}
            title={voteLabel}
            disabled={hasVoted || isClosed}
        >
            <Icon name="heart" size={24} />
        </button>
        </div>
      </div>
    </article>
  )
}
