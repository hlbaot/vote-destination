"use client"

import { useState } from "react"
import { Destination, Page } from "@/types"
import DestinationCard from "../components/DestinationCard"
import Icon from "../components/Icon"

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
  const [carouselIndex, setCarouselIndex] = useState<number>(0)
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false)

  // Filtered popular destinations for hero mini carousel
  const popularDestinations = destinations.slice(0, 8)
  const visibleCardsCount = 4
  const maxCarouselIndex = Math.max(
    0,
    popularDestinations.length - visibleCardsCount,
  )

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextSlide = () => {
    setCarouselIndex((prev) => Math.min(maxCarouselIndex, prev + 1))
  }

  const activeDest =
    destinations.find((d) => d.id === selectedDestId) || destinations[0]
  const topDestinations = destinations.slice(0, 3)

  return (
    <>
      {/* ============================================================ */}
      {/* WANDERLUST SIGNATURE HERO                                     */}
      {/* ============================================================ */}
      <section className="wander-hero">
        {/* Full-width scenic background image with luxury grade vignette */}
        <div className="wander-hero-bg-wrap">
          <img
            className="wander-hero-bg"
            src="https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=2560"
            alt="Việt Nam kỳ quan bất tận"
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
                <span>BANNER HỘI THI BÌNH CHỌN ĐIỂM ĐẾN 2025</span>
              </div>

              <h1 className="wander-hero-title">
                Bình chọn
                <br />
                điểm đến
                <br />
                <em>Việt Nam</em>
              </h1>

              <p className="wander-hero-desc">
                Cổng thông tin chính thức giới thiệu tổng quan hội thi, điểm đến
                nổi bật, tin tức/thông báo và lối truy cập nhanh vào hệ thống
                bình chọn cho 68 hồ sơ điểm đến trên toàn quốc.
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
                  <h4>Điểm đến nổi bật</h4>
                  <button
                    type="button"
                    className="wander-view-all-link"
                    onClick={() => go("explore")}
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="wander-carousel-controls">
                  <button
                    type="button"
                    className="wander-arrow-btn"
                    onClick={handlePrevSlide}
                    disabled={carouselIndex === 0}
                    aria-label="Điểm đến trước"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="wander-arrow-btn"
                    onClick={handleNextSlide}
                    disabled={carouselIndex >= maxCarouselIndex}
                    aria-label="Điểm đến tiếp theo"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="wander-popular-cards-grid">
                {popularDestinations
                  .slice(carouselIndex, carouselIndex + visibleCardsCount)
                  .map((item) => (
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
                        <div className="wander-pop-card-content">
                          <strong className="wander-pop-card-title">
                            {item.name}
                          </strong>
                          <div className="wander-pop-card-meta">
                            <span>{item.place}</span>
                            <span className="wander-pop-rating">★ 4.9</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right: Trust & Guarantee Badges Strip matching reference */}
            <div className="wander-trust-strip">
              <div className="wander-trust-card">
                <div className="wander-trust-icon-box">
                  <Icon name="shield" size={20} />
                </div>
                <div className="wander-trust-text">
                  <strong>Thể lệ rõ ràng</strong>
                  <small>Công khai tiêu chí</small>
                </div>
              </div>

              <div className="wander-trust-card">
                <div className="wander-trust-icon-box">
                  <Icon name="headset" size={20} />
                </div>
                <div className="wander-trust-text">
                  <strong>Tra cứu thuận tiện</strong>
                  <small>Tìm kiếm và lọc nhanh</small>
                </div>
              </div>

              <div className="wander-trust-card">
                <div className="wander-trust-icon-box">
                  <Icon name="calendar" size={20} />
                </div>
                <div className="wander-trust-text">
                  <strong>Dữ liệu CMS</strong>
                  <small>Cập nhật qua quản trị</small>
                </div>
              </div>

              <div className="wander-trust-card">
                <div className="wander-trust-icon-box">
                  <Icon name="lock" size={20} />
                </div>
                <div className="wander-trust-text">
                  <strong>Bình chọn bảo mật</strong>
                  <small>Ghi nhận trạng thái</small>
                </div>
              </div>
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
            <div>
              <span className="eyebrow">ĐIỂM ĐẾN NỔI BẬT</span>
              <h2>Các hồ sơ đang được quan tâm</h2>
            </div>
            <button className="btn btn-secondary" onClick={() => go("explore")}>
              Xem danh sách điểm đến <Icon name="arrow" size={18} />
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
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">GIỚI THIỆU TỔNG QUAN</span>
              <h2>Tra cứu điểm đến theo vùng miền</h2>
            </div>
            <span className="eyebrow light desktop-only">
              BẮC • TRUNG • NAM
            </span>
          </div>
          <div className="region-grid">
            <div className="region-card" onClick={() => go("explore")}>
              <div className="region-badge">MIỀN BẮC</div>
              <h3>Kỳ vĩ non ngàn & Di sản trầm tích</h3>
              <p>Hạ Long, Tràng An, Mù Cang Chải, Cao nguyên đá Đồng Văn</p>
              <span className="region-link">
                Khám phá miền Bắc <Icon name="arrow" size={16} />
              </span>
            </div>
            <div className="region-card" onClick={() => go("explore")}>
              <div className="region-badge">MIỀN TRUNG</div>
              <h3>Di sản vàng son & Biển biếc cát trắng</h3>
              <p>Phố cổ Hội An, Cố đô Huế, Phong Nha - Kẻ Bàng, Đà Lạt</p>
              <span className="region-link">
                Khám phá miền Trung <Icon name="arrow" size={16} />
              </span>
            </div>
            <div className="region-card" onClick={() => go("explore")}>
              <div className="region-badge">MIỀN NAM</div>
              <h3>Thiên đường biển đảo & Sông nước mênh mang</h3>
              <p>Đảo ngọc Phú Quốc, Côn Đảo linh thiêng, Chợ nổi Cái Răng</p>
              <span className="region-link">
                Khám phá miền Nam <Icon name="arrow" size={16} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: STORY STRIP (NỘI DUNG GIỮ NGUYÊN)                  */}
      {/* ============================================================ */}
      <section className="story-strip">
        <div className="container story-grid">
          <div>
            <span className="eyebrow light">TIN TỨC & THÔNG BÁO</span>
            <h2>Cập nhật lịch bình chọn, thể lệ và kết quả nổi bật</h2>
          </div>
          <div>
            <p>
              Trang chủ tập trung các thông báo quan trọng của hội thi, trạng
              thái mở cổng bình chọn, hồ sơ được đề xuất và đường dẫn nhanh để
              người dân tham gia bình chọn ngay trên mọi thiết bị.
            </p>
            <button className="btn btn-light" onClick={() => go("vote")}>
              Tham gia bình chọn ngay <Icon name="arrow" size={18} />
            </button>
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
    </>
  )
}
