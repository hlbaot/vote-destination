"use client"

import { useState } from "react"
import Icon from "@/components/shared/Icon"

export default function Guide() {
  const [activeWireframe, setActiveWireframe] = useState<number>(0)
  const sitemap = [
    "Trang chủ",
    "Danh sách 68 điểm đến",
    "Chi tiết điểm đến",
    "Cổng bình chọn",
    "Biên nhận xác nhận",
  ]

  return (
    <main className="guide-page container">
      <section className="page-intro compact">
        <span className="eyebrow">
          HỒ SƠ THIẾT KẾ • UX & DESIGN SYSTEM V1.0
        </span>
        <h1>
          Từ cấu trúc đến <em>trải nghiệm</em>
        </h1>
        <p>
          Bộ quy chuẩn trải nghiệm thị giác và luồng nghiệp vụ cho chương trình
          bình chọn toàn quốc, tôn vinh di sản Việt Nam với công nghệ bảo mật
          cao.
        </p>
      </section>

      {/* 01. SITEMAP & FLOW */}
      <section className="guide-section">
        <div className="guide-title">
          <span>01</span>
          <div>
            <h2>Sitemap & Luồng người dùng (User Flow)</h2>
            <p>
              Tối giản các bước thao tác, định hướng người dùng chuyển đổi từ
              xem thông tin đến gửi phiếu bình chọn.
            </p>
          </div>
        </div>

        <div className="flow-row">
          {sitemap.map((item, i) => (
            <div className="flow-item" key={item}>
              <div>
                <small>BƯỚC 0{i + 1}</small>
                <strong>{item}</strong>
              </div>
              {i < sitemap.length - 1 && <Icon name="arrow" />}
            </div>
          ))}
        </div>

        <div className="tech-flow">
          <div>
            <Icon name="spark" />
            <span>
              <strong>Luồng công nghệ bảo mật minh bạch</strong>
              <small>
                Loại bỏ hoàn toàn bot gian lận, cấp mã biên nhận truy xuất
              </small>
            </span>
          </div>
          <div className="tech-steps">
            <span>1. Xác thực SĐT qua OTP</span>
            <Icon name="arrow" />
            <span>2. Cloudflare Turnstile</span>
            <Icon name="arrow" />
            <span>3. Xác nhận đề cử</span>
            <Icon name="arrow" />
            <span>4. Cấp mã biên nhận + Lưu DB</span>
          </div>
        </div>
      </section>

      {/* 02. MOODBOARD & DESIGN SYSTEM */}
      <section className="guide-section">
        <div className="guide-title">
          <span>02</span>
          <div>
            <h2>Bảng màu & Hệ thống thiết kế (Design Tokens)</h2>
            <p>
              Phong cách Di sản đương đại — Trang trọng, đậm chất văn hóa Việt
              Nam nhưng hiện đại và đáng tin cậy.
            </p>
          </div>
        </div>

        <div className="system-grid">
          <div className="system-card">
            <small>BẢNG MÀU CHỦ ĐẠO (COLOR PALETTE)</small>
            <div className="swatches">
              <div className="swatch teal">
                <span>Di sản</span>
                <small>#073F3B</small>
              </div>
              <div className="swatch mint">
                <span>Ngọc bích</span>
                <small>#BBD5C5</small>
              </div>
              <div className="swatch sand">
                <span>Cát ấm</span>
                <small>#F4EFE5</small>
              </div>
              <div className="swatch coral">
                <span>Điểm nhấn</span>
                <small>#E1644A</small>
              </div>
            </div>
          </div>

          <div className="system-card type-card">
            <small>CẶP PHÔNG CHỮ THƯƠNG HIỆU</small>
            <h3>Be Vietnam Pro</h3>
            <p>Hệ thống giao diện, dữ liệu số, bảng biểu & nội dung đọc</p>
            <h2>
              Lora <em>Editorial</em>
            </h2>
            <p>Tiêu đề trang trọng, khơi gợi cảm xúc tự hào dân tộc</p>
          </div>

          <div className="system-card">
            <small>THÀNH PHẦN TƯƠNG TÁC (UI COMPONENTS)</small>
            <div className="component-demo">
              <button className="btn btn-primary">Bình chọn ngay</button>
              <button className="btn btn-secondary">Khám phá chi tiết</button>
              <span className="badge-demo">★ ĐANG DẪN ĐẦU #01</span>
            </div>
          </div>
        </div>
      </section>

      {/* 03. RESPONSIVE WIREFRAMES */}
      <section className="guide-section">
        <div className="guide-title">
          <span>03</span>
          <div>
            <h2>Wireframe đa thiết bị (Responsive Wireframes)</h2>
            <p>
              Tối ưu hiển thị hoàn hảo trên cả màn hình Desktop (1440px) và
              Mobile (390px).
            </p>
          </div>
        </div>

        <div className="wireframes">
          {[
            { label: "Trang chủ (Home)", desc: "Hero video + Top 3 kỳ quan" },
            {
              label: "Khám phá (Explore)",
              desc: "Bộ lọc 68 điểm đến + Search",
            },
            { label: "Chi tiết (Detail)", desc: "Hồ sơ UNESCO + Sticky vote" },
            { label: "Bình chọn (Vote)", desc: "Wizard 4 bước bảo mật" },
          ].map((item, i) => (
            <div
              className={`wire-card ${activeWireframe === i ? "selected" : ""}`}
              key={item.label}
              onClick={() => setActiveWireframe(i)}
              style={{ cursor: "pointer" }}
            >
              <div className={`wire wire-${i}`}>
                <i />
                <b />
                <span />
                <span />
                <span />
              </div>
              <strong>{item.label}</strong>
              <small>{item.desc}</small>
            </div>
          ))}
        </div>
      </section>

      {/* APPROVAL NOTE */}
      <section className="approval-note">
        <Icon name="check" size={24} />
        <div>
          <strong>Quy chuẩn hệ thống bình chọn quốc gia</strong>
          <p>
            Mọi thao tác bình chọn được đồng bộ thời gian thực, tuân thủ các quy
            chuẩn an toàn thông tin và quyền riêng tư công dân.
          </p>
        </div>
      </section>
    </main>
  )
}
