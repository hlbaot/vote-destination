"use client"

import React from "react"
import { Destination, Page } from "@/types"
import Icon from "@/components/shared/Icon"
import DestinationCard from "@/components/user/destination/DestinationCard"

export default function Detail({
  destination,
  allDestinations,
  onStartVote,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
  onShare,
  go,
}: {
  destination: Destination
  allDestinations: Destination[]
  onStartVote: (dest: Destination) => void
  isFavorite: boolean
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  onOpenDetail: (dest: Destination) => void
  onShare: (dest: Destination) => void
  go: (page: Page) => void
}) {
  const [activeImage, setActiveImage] = React.useState({
    destinationId: destination.id,
    url: destination.image,
  })
  const displayedImage =
    activeImage.destinationId === destination.id ? activeImage.url : destination.image

  // Compute rank in full list
  const sorted = [...allDestinations].sort((a, b) => b.rawVotes - a.rawVotes)
  const currentRank = sorted.findIndex((d) => d.id === destination.id) + 1
  const nextDest = sorted[currentRank] // The one right behind it
  const diffVotes = nextDest
    ? (destination.rawVotes - nextDest.rawVotes).toLocaleString("vi-VN")
    : null

  // Related destinations (same tag or region, excluding current)
  const related = allDestinations
    .filter(
      (d) =>
        d.id !== destination.id &&
        (d.region === destination.region || d.tag === destination.tag),
    )
    .slice(0, 3)

  return (
    <main>
      <section className="detail-hero">
        <img src={displayedImage} alt={destination.name} />
        <div className="detail-overlay" />
        <div className="container detail-title">
          <span className="pill-light">
            {destination.category || destination.unescoTitle || destination.tag}
          </span>
          <h1>{destination.name}</h1>
          <p>
            <Icon name="map" size={18} /> {destination.province || destination.place}, Việt Nam
            {" "}({destination.region === "Tây Nguyên" ? "Tây Nguyên" : `Miền ${destination.region}`})
          </p>
        </div>
      </section>

      <section className="container detail-layout">
        <article className="detail-copy">
          <span className="eyebrow">
            HỒ SƠ ĐIỂM ĐẾN #{destination.id} • {(destination.category || destination.tag).toUpperCase()}
          </span>
          <h2>
            Mẫu hồ sơ giới thiệu
            <br />
            dùng chung toàn hệ thống
          </h2>
          <p className="lead">{destination.shortDescription || destination.lead}</p>
          {destination.imageCredit && <p><small>{destination.imageCredit}</small></p>}
          <p>{destination.introduction || destination.description}</p>

          {destination.highlights && (
            <div className="detail-extra-text">
              <h3>Nét đặc trưng</h3>
              <ul>
                {destination.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Facts grid */}
          <div className="facts">
            {destination.facts.map((fact, index) => (
              <div key={index}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </div>
            ))}
          </div>

          {/* Interactive Album Gallery if multiple images exist */}
          {destination.gallery && destination.gallery.length > 1 && (
            <div className="detail-album-gallery">
              <div className="album-gallery-head">
                <h3>
                  Hình ảnh điểm đến ({destination.gallery.length}{" "}
                  bức ảnh)
                </h3>
                <small>Nhấp vào ảnh để xem kích thước lớn ở ảnh nền</small>
              </div>
              <div className="album-thumbnails-strip">
                {destination.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`album-thumb-btn ${displayedImage === imgUrl ? "active" : ""
                      }`}
                    onClick={() =>
                      setActiveImage({ destinationId: destination.id, url: imgUrl })
                    }
                    title={`Xem ảnh ${idx + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${destination.name} - góc nhìn ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <img
            className="editorial-image"
            src={destination.secondaryImage}
            alt={`${destination.name} góc nhìn nghệ thuật`}
          />

          <div className="detail-extra-text">
            <h3>Nội dung đặc trưng của điểm đến</h3>
            <p>
              Hồ sơ chi tiết được trình bày theo một mẫu giao diện thống nhất:
              phần giới thiệu, bộ hình ảnh, tư liệu video nếu có, các thông tin
              đặc trưng và nút bình chọn. Dữ liệu nội dung được cập nhật qua hệ
              thống quản trị để bảo đảm đồng bộ giữa các hồ sơ.
            </p>
          </div>
        </article>

        {/* Sticky aside */}
        <aside className="vote-aside">
          <div className="live-label">
            <i /> BÌNH CHỌN ĐANG DIỄN RA
          </div>
          <p>Xếp hạng hiện tại trong Top 68</p>
          <div className="rank-line">
            <strong>
              #{currentRank < 10 ? `0${currentRank}` : currentRank}
            </strong>
            <span>
              {destination.votes}
              <br />
              <small>lượt bình chọn hợp lệ</small>
            </span>
          </div>

          <div className="progress">
            <i
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    20,
                    (destination.rawVotes / (sorted[0]?.rawVotes || 1)) * 100,
                  ),
                )}%`,
              }}
            />
          </div>

          {diffVotes && (
            <p className="muted">
              Dẫn trước {diffVotes} lượt so với vị trí tiếp theo (#
              {currentRank + 1}).
            </p>
          )}

          <div className="aside-actions">
            <button
              className="btn btn-primary w-full"
              onClick={() => onStartVote(destination)}
            >
              Bình chọn cho {destination.name} <Icon name="arrow" size={18} />
            </button>

            <div className="detail-action-buttons">
              <button
                className={`btn btn-secondary ${isFavorite ? "active-favorite" : ""
                  }`}
                onClick={(e) => onToggleFavorite(destination.id, e)}
              >
                <Icon name="heart" size={16} />
                {isFavorite ? "Đã yêu thích" : "Lưu yêu thích"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onShare(destination)}
                title="Chia sẻ liên kết"
              >
                <Icon name="share" size={16} /> Chia sẻ
              </button>
            </div>
          </div>

          <div className="secure">
            <Icon name="shield" size={18} />
            <span>
              Dữ liệu bình chọn được ghi nhận qua hệ thống quản trị nội dung và
              đối soát theo thể lệ công bố của hội thi.
            </span>
          </div>
        </aside>
      </section>

      {/* Related suggestions */}
      {related.length > 0 && (
        <section className="section bg-light-sand">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">CÙNG KHU VỰC & THỂ LOẠI</span>
                <h2>Khám phá thêm các điểm đến khác</h2>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => go("explore")}
              >
                Xem tất cả 68 điểm đến <Icon name="arrow" size={18} />
              </button>
            </div>
            <div className="card-grid">
              {related.map((item) => (
                <DestinationCard
                  key={item.id}
                  item={item}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                  onOpen={() => {
                    onOpenDetail(item)
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
