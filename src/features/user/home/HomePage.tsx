"use client"

import { useEffect, useMemo, useState } from "react"
import { Destination, Page } from "@/types"
import DestinationCard from "@/components/user/destination/DestinationCard"
import Icon from "@/components/shared/Icon"
import { voteConfig } from "@/data/destinations"

const EVENT_START_DATE = `${voteConfig.startDate}T00:00:00+07:00`
const EVENT_END_DATE = `${voteConfig.endDate}T23:59:59+07:00`
const INITIAL_EVENT_COUNTDOWN = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  ended: false,
}

function getEventCountdown() {
  const diff = new Date(EVENT_END_DATE).getTime() - Date.now()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true }
  }

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    ended: false,
  }
}

function padTime(value: number) {
  return String(value).padStart(2, "0")
}

export default function Home({
  go,
  destinations,
  onOpenDetail,
  favorites,
  onToggleFavorite,
}: {
  go: (page: Page) => void
  destinations: Destination[]
  onOpenDetail: (dest: Destination) => void
  favorites: string[]
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
}) {
  const [selectedDestId] = useState<string>(destinations[0]?.id || "01")
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false)
  const [eventCountdown, setEventCountdown] = useState(INITIAL_EVENT_COUNTDOWN)

  const topVotedDestinations = useMemo(
    () =>
      [...destinations]
        .sort((a, b) => b.rawVotes - a.rawVotes)
        .slice(0, 3),
    [destinations],
  )

  useEffect(() => {
    const updateCountdown = () => setEventCountdown(getEventCountdown())

    updateCountdown()
    const intervalId = window.setInterval(updateCountdown, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const activeDest =
    destinations.find((d) => d.id === selectedDestId) || destinations[0]
  const topDestinations = topVotedDestinations

  return (
    <div className="home-page">
      {/* ============================================================ */}
      {/* WANDERLUST SIGNATURE HERO                                     */}
      {/* ============================================================ */}
      <section className="wander-hero">
        {/* Full-width scenic background image with luxury grade vignette */}
        <div className="wander-hero-bg-wrap">
          <img
            className="wander-hero-bg"
            src="/images/hero-rural-bg.webp"
            alt="Điểm đến du lịch nông thôn Việt Nam - Ruộng bậc thang Mù Cang Chải"
          />
          <div className="wander-hero-vignette" />
        </div>

        {/* Dynamic Flight / Route Trail Overlay with Location Pin Marker */}
        <div className="wander-hero-trail-overlay" aria-hidden="true">
          <svg className="wander-trail-svg" viewBox="0 0 1440 720" fill="none">
            {/* Plane icon flying across the bay */}
            <g transform="translate(680, 160) rotate(-22)">
              <path
                d="M14 16L12 8L15 5C16.5 3.5 17 2 16 1C15 0 13.5 0.5 12 2L9 5L2 3.5C1.5 3.4 1 3.6 0.7 4L0.1 4.8C-0.2 5.2 -0.1 5.7 0.3 6L6 10L3 13L1 12.6C0.6 12.5 0.2 12.7 0 13L-0.4 13.7C-0.7 14.1 -0.6 14.5 -0.2 14.8L2.5 16.8L4.5 19.5C4.8 19.9 5.2 20 5.6 19.7L6.3 19.3C6.6 19.1 6.8 18.7 6.7 18.3L6.3 16.3L9.3 13.3L13.3 19C13.6 19.4 14.1 19.5 14.5 19.2L15.3 18.6C15.7 18.3 15.9 17.8 15.8 17.4L14 16Z"
                fill="#ffffff"
                opacity="0.85"
              />
            </g>
            {/* Dashed curved flight path swooping through the bay */}
            <path
              d="M700 170 C 760 210, 810 260, 780 340 C 750 420, 640 450, 638 425 C 636 405, 660 380, 700 440 C 740 500, 790 530, 830 520"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="wander-trail-dash"
            />
          </svg>

          {/* Location Pin with Pulse Animation matching the reference image */}
          <div
            className="wander-geo-pin"
            style={{ top: "58%", left: "44%" }}
            onClick={() => onOpenDetail(activeDest)}
            title={`Đề cử: ${activeDest.name} - ${activeDest.place}`}
          >
            <div className="wander-geo-pin-ring" />
            <div className="wander-geo-pin-core">
              <span className="wander-geo-pin-icon">📍</span>
            </div>
            <div className="wander-geo-pin-tag">
              <strong>{activeDest.name}</strong>
              <small>
                {activeDest.place} • {activeDest.votes} phiếu
              </small>
            </div>
          </div>
        </div>

        <div className="container wander-hero-container">
          <div className="wander-hero-main-row">
            {/* LEFT COLUMN: Grand Editorial Typography & CTA */}
            <div className="wander-hero-left">
              <div className="wander-hero-kicker">
                <span className="wander-kicker-line" />
                <span>BÌNH CHỌN ĐIỂM ĐẾN DU LỊCH NÔNG THÔN VIỆT NAM TỐT NHẤT 2026</span>
              </div>

              <h1 className="wander-hero-title">
                Điểm đến
                <br />
                du lịch nông thôn
                <br />
                <em>Việt Nam tốt nhất 2026</em>
              </h1>

              <p className="wander-hero-desc">
                Cổng thông tin chính thức giới thiệu tổng quan, điểm đến
                nổi bật, tin tức/thông báo và lối truy cập nhanh vào hệ thống
                bình chọn Điểm đến du lịch nông thôn Việt Nam tốt nhất 2026 cho 68 hồ sơ trên toàn quốc.
              </p>

              <div className="wander-hero-actions">
                <button
                  className="wander-pill-btn"
                  onClick={() => go("explore")}
                  title="Khám phá 68 danh thắng & di sản Việt Nam"
                >
                  <span>Xem danh sách 68 điểm đến</span>
                  <Icon name="arrow" size={17} />
                </button>

                <button
                  className="wander-video-btn"
                  onClick={() => setVideoModalOpen(true)}
                  title="Xem video kỳ quan Việt Nam"
                >
                  <span className="wander-play-disc">
                    <Icon name="play" size={13} />
                  </span>
                  <span className="wander-video-caption">
                    <strong>Truy cập bình chọn</strong>
                    <small>Xem hướng dẫn và bảng xếp hạng</small>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* LOWER HERO STRIP: Popular Destinations Carousel & Trust Badges */}
          <div className="wander-lower-strip">
            {/* Left: Popular Destinations Carousel with arrows */}
            <div className="wander-popular-block">
              <div className="wander-popular-header">
                <div className="wander-popular-title-wrap">
                  <h4>Top 3 điểm đến được bình chọn nhiều nhất</h4>
                  <button
                    type="button"
                    className="wander-view-all-link"
                    onClick={() => go("explore")}
                  >
                    Xem tất cả
                  </button>
                </div>
              </div>

              <div className="wander-popular-cards-grid">
                {topVotedDestinations
                  .map((item, index) => (
                    <div
                      key={item.id}
                      className="wander-popular-card"
                      onClick={() => onOpenDetail(item)}
                      title={`Xem chi tiết ${item.name}`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="wander-pop-card-img"
                        loading="lazy"
                      />
                      <div className="wander-pop-card-overlay">
                        <span className="wander-pop-rank">#{index + 1}</span>
                        <div className="wander-pop-card-content">
                          <strong className="wander-pop-card-title">
                            {item.name}
                          </strong>
                          <div className="wander-pop-card-meta">
                            <span>{item.place}</span>
                            <span className="wander-pop-rating">
                              {item.votes} phiếu
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="wander-event-countdown" aria-live="polite">
              <div className="wander-countdown-heading">
                <span className="wander-countdown-icon">
                  <Icon name="calendar" size={22} />
                </span>
                <div>
                  <span>Thời gian bình chọn còn lại</span>
                  <strong>
                    Hạn chót: {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(EVENT_END_DATE))}
                  </strong>
                </div>
              </div>

              {eventCountdown.ended ? (
                <div className="wander-countdown-started">Bình chọn đã kết thúc</div>
              ) : (
                <div className="wander-countdown-grid">
                  <div className="wander-countdown-unit">
                    <strong>{eventCountdown.days}</strong>
                    <span>Ngày</span>
                  </div>
                  <div className="wander-countdown-unit">
                    <strong>{padTime(eventCountdown.hours)}</strong>
                    <span>Giờ</span>
                  </div>
                  <div className="wander-countdown-unit">
                    <strong>{padTime(eventCountdown.minutes)}</strong>
                    <span>Phút</span>
                  </div>
                  <div className="wander-countdown-unit">
                    <strong>{padTime(eventCountdown.seconds)}</strong>
                    <span>Giây</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM METRICS COUNTER BAR */}
          <div className="wander-metrics-bar">
            <div className="wander-metric-item">
              <strong>68</strong>
              <span>Hồ sơ điểm đến</span>
            </div>
            <div className="wander-metric-item">
              <strong>1M+</strong>
              <span>Lượt bình chọn mô phỏng</span>
            </div>
            <div className="wander-metric-item">
              <strong>63</strong>
              <span>Tỉnh thành tham gia</span>
            </div>
            <div className="wander-metric-item">
              <div className="wander-rating-row">
                <strong>4.9</strong>
                <span className="wander-rating-stars">★★★★★</span>
              </div>
              <span>Điểm đánh giá truyền thông</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: TOP LEADERBOARD DESTINATIONS (NỘI DUNG GIỮ NGUYÊN)  */}
      {/* ============================================================ */}
      <section className="section section-lead-vote">
        <div className="container">
          <div className="section-heading">
            <div className="section-heading-text">
              <span className="eyebrow">ĐIỂM ĐẾN NỔI BẬT</span>
              <h2>Các hồ sơ đang được quan tâm</h2>
            </div>
            <button
              type="button"
              className="btn btn-secondary home-explore-btn"
              onClick={() => go("explore")}
            >
              <span>Xem danh sách điểm đến</span>
              <Icon name="arrow" size={18} />
            </button>
          </div>
          <div className="card-grid">
            {topDestinations.map((item, idx) => (
              <DestinationCard
                key={item.id}
                item={item}
                rank={idx + 1}
                isFavorite={favorites.includes(item.id)}
                onToggleFavorite={onToggleFavorite}
                onOpen={() => onOpenDetail(item)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: 3 REGIONS PREVIEW (NỘI DUNG GIỮ NGUYÊN)            */}
      {/* ============================================================ */}
      <section className="region-preview-section">
        {/* Bản đồ Việt Nam mờ làm watermark nền trang nhã */}
        <div className="region-map-watermark" aria-hidden="true" />

        <div className="container">
          <div className="section-heading">
            <div className="section-heading-text">
              <span className="eyebrow">GIỚI THIỆU TỔNG QUAN</span>
              <h2>Tra cứu điểm đến theo vùng miền</h2>
            </div>
            <span className="eyebrow light desktop-only region-subtag">
              BẮC • TRUNG • NAM
            </span>
          </div>
          <div className="region-grid">
            {/* MIỀN BẮC */}
            <div
              className="region-card region-card-north"
              onClick={() => go("explore")}
            >
              <div className="region-card-backdrop" />
              <div className="region-card-inner">
                <div className="region-badge">MIỀN BẮC</div>
                <h3>Kỳ vĩ non ngàn & Di sản trầm tích</h3>
                <p className="region-places-list">
                  Hạ Long, Tràng An, Mù Cang Chải, Cao nguyên đá Đồng Văn
                </p>
                <div className="region-chips">
                  <span className="region-chip">Hạ Long</span>
                  <span className="region-chip">Tràng An</span>
                  <span className="region-chip">Mù Cang Chải</span>
                  <span className="region-chip">Đồng Văn</span>
                </div>
                <div className="region-card-bottom">
                  <span className="region-link">
                    <span>Khám phá miền Bắc</span>
                    <Icon name="arrow" size={16} />
                  </span>
                </div>
              </div>
            </div>

            {/* MIỀN TRUNG */}
            <div
              className="region-card region-card-central"
              onClick={() => go("explore")}
            >
              <div className="region-card-backdrop" />
              <div className="region-card-inner">
                <div className="region-badge">MIỀN TRUNG</div>
                <h3>Di sản vàng son & Biển biếc cát trắng</h3>
                <p className="region-places-list">
                  Phố cổ Hội An, Cố đô Huế, Phong Nha - Kẻ Bàng, Đà Lạt
                </p>
                <div className="region-chips">
                  <span className="region-chip">Phố cổ Hội An</span>
                  <span className="region-chip">Cố đô Huế</span>
                  <span className="region-chip">Phong Nha - Kẻ Bàng</span>
                  <span className="region-chip">Đà Lạt</span>
                </div>
                <div className="region-card-bottom">
                  <span className="region-link">
                    <span>Khám phá miền Trung</span>
                    <Icon name="arrow" size={16} />
                  </span>
                </div>
              </div>
            </div>

            {/* MIỀN NAM */}
            <div
              className="region-card region-card-south"
              onClick={() => go("explore")}
            >
              <div className="region-card-backdrop" />
              <div className="region-card-inner">
                <div className="region-badge">MIỀN NAM</div>
                <h3>Thiên đường biển đảo & Sông nước mênh mang</h3>
                <p className="region-places-list">
                  Đảo ngọc Phú Quốc, Côn Đảo linh thiêng, Chợ nổi Cái Răng
                </p>
                <div className="region-chips">
                  <span className="region-chip">Đảo ngọc Phú Quốc</span>
                  <span className="region-chip">Côn Đảo linh thiêng</span>
                  <span className="region-chip">Chợ nổi Cái Răng</span>
                </div>
                <div className="region-card-bottom">
                  <span className="region-link">
                    <span>Khám phá miền Nam</span>
                    <Icon name="arrow" size={16} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: STORY STRIP / BANNER TIN TỨC & CTA (NỘI DUNG GIỮ)  */}
      {/* ============================================================ */}
      <section className="story-strip">
        <div className="container">
          <div className="story-banner-card">
            <div className="story-banner-deco" aria-hidden="true" />
            <div className="story-grid">
              <div className="story-grid-left">
                <span className="eyebrow light">TIN TỨC & THÔNG BÁO</span>
                <h2 className="story-banner-title">
                  Cập nhật lịch bình chọn, thể lệ và kết quả nổi bật
                </h2>
              </div>
              <div className="story-grid-right">
                <p className="story-banner-desc">
                  Trang chủ tập trung các thông báo quan trọng của hội thi, trạng
                  thái mở cổng bình chọn, hồ sơ được đề xuất và đường dẫn nhanh để
                  người dân tham gia bình chọn ngay trên mọi thiết bị.
                </p>
                <button
                  type="button"
                  className="btn btn-cta-vote"
                  onClick={() => go("vote")}
                >
                  <span>Tham gia bình chọn ngay</span>
                  <Icon name="arrow" size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Preview */}
      {videoModalOpen && (
        <div
          className="wander-video-modal-backdrop"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="wander-video-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="wander-modal-close"
              onClick={() => setVideoModalOpen(false)}
              aria-label="Đóng"
            >
              <Icon name="x" size={20} />
            </button>
            <div className="wander-modal-media">
              <img
                src={activeDest.secondaryImage || activeDest.image}
                alt={activeDest.name}
                className="wander-modal-poster"
              />
              <div className="wander-modal-overlay">
                <span className="wander-modal-badge">
                  {activeDest.tag} • {activeDest.place}
                </span>
                <h3>{activeDest.name}</h3>
                <p>{activeDest.lead}</p>
                <div className="wander-modal-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setVideoModalOpen(false)
                      onOpenDetail(activeDest)
                      go("vote")
                    }}
                  >
                    Bình chọn cho {activeDest.name}{" "}
                    <Icon name="arrow" size={16} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setVideoModalOpen(false)}
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
