"use client"

import React, { useState } from "react"
import { Destination, Page, Region } from "../types"
import VietnamSVGMap, {
  SelectedProvincePayload,
} from "../components/VietnamSVGMap"
import Icon from "../components/Icon"

export default function Vote({
  go,
  destinations,
  selectedDestination,
  onSelectDestination,
  onRecordVote,
  onCopyReceipt,
}: {
  go: (page: Page) => void
  destinations: Destination[]
  selectedDestination: Destination
  onSelectDestination: (dest: Destination) => void
  onRecordVote: (
    destinationId: string,
    phone: string,
    receiptCode: string,
  ) => void
  onCopyReceipt: (code: string) => void
}) {
  type VoteStep = 1 | 2 | 3 | 4
  type RegionFilter = "all" | Region

  const [step, setStep] = useState<VoteStep>(1)
  const [phone, setPhone] = useState("0788621767")
  const [voterName, setVoterName] = useState("Nguyễn Thanh Sơn")
  const [selectedProvinceName, setSelectedProvinceName] = useState("Lạng Sơn")
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [receiptCode, setReceiptCode] = useState("")
  const totalVotesCount = destinations.reduce((acc, d) => acc + d.rawVotes, 0)
  const rankingPreview = [...destinations]
    .sort((a, b) => b.rawVotes - a.rawVotes)
    .slice(0, 5)

  // Step 1 -> Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  // Step 2 -> Step 3
  const handleProceedToStep3 = () => {
    setStep(3)
  }

  // Click a province on the 2D SVG Map (Step 3)
  const handleSelectProvinceFromMap = (prov: SelectedProvincePayload) => {
    setSelectedProvinceName(prov.name)

    // Find destination matching this province
    const match = destinations.find(
      (d) =>
        d.place.toLowerCase().includes(prov.name.toLowerCase()) ||
        prov.name.toLowerCase().includes(d.place.toLowerCase()),
    )

    if (match) {
      onSelectDestination(match)
    } else {
      const fallbackRegion: Region =
        prov.region === "Bắc" || prov.region === "Trung" || prov.region === "Tây Nguyên" || prov.region === "Nam"
          ? prov.region
          : "Bắc"
      // Create representative destination for this province
      const newDest: Destination = {
        id: prov.id.replace("VN", "").replace("p-", ""),
        name: prov.featuredDestination || `Kỳ quan ${prov.name}`,
        place: prov.name,
        region: fallbackRegion,
        image: prov.image,
        secondaryImage: prov.image,
        votes: prov.votes.toLocaleString("vi-VN"),
        rawVotes: prov.votes,
        tag: prov.tag as Destination["tag"] || "Cảnh quan",
        lead: `Đề cử danh thắng đại diện cho vẻ đẹp của ${prov.name}.`,
        description: `Một trong những điểm đến được yêu mến nhất tại vùng đất ${prov.name}.`,
        facts: [
          { label: "Khu vực", value: `Miền ${fallbackRegion}` },
          {
            label: "Lượt vote hiện tại",
            value: prov.votes.toLocaleString("vi-VN"),
          },
          { label: "Đề cử", value: "2025" },
        ],
        isVisible: true,
      }
      onSelectDestination(newDest)
    }
  }

  // Submit official vote directly from hover card or pinned card
  const handleDirectVote = (prov: SelectedProvincePayload) => {
    handleSelectProvinceFromMap(prov)

    // Generate unique official receipt code
    const prefix = prov.featuredDestination
      .split(" ")
      .map((w) => w[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 4)
      .padEnd(4, "X")
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "")
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase()
    const generatedReceipt = `${prefix}-${dateStr}-${randomHex}`

    setReceiptCode(generatedReceipt)
    setStep(4)

    const voterPhone =
      phone.trim() || "098***" + Math.floor(1000 + Math.random() * 9000)
    onRecordVote(selectedDestination.id, voterPhone, generatedReceipt)
  }

  return (
    <main className={`vote-flow-wrapper step-is-${step}`}>
      <section className="container vote-results-overview">
        <div className="vote-overview-copy">
          <span className="eyebrow">TRANG BÌNH CHỌN & KẾT QUẢ</span>
          <h1>Tham gia bình chọn và theo dõi bảng xếp hạng</h1>
          <p>
            Cổng bình chọn hiển thị thể lệ, thời gian tham gia, hướng dẫn từng
            bước, tổng lượt bình chọn, bảng xếp hạng tạm thời và trạng thái mở
            cổng của hội thi.
          </p>
        </div>
        <div className="vote-status-grid">
          <div>
            <span>Trạng thái</span>
            <strong>Đang mở bình chọn</strong>
            <small>Ghi nhận phiếu hợp lệ theo thời gian thực</small>
          </div>
          <div>
            <span>Thời gian bình chọn</span>
            <strong>01/10 - 31/12/2025</strong>
            <small>Công bố kết quả sau khi đối soát dữ liệu</small>
          </div>
          <div>
            <span>Tổng lượt bình chọn</span>
            <strong>{totalVotesCount.toLocaleString("vi-VN")}</strong>
            <small>{destinations.length} hồ sơ điểm đến đang hiển thị</small>
          </div>
        </div>
        <div className="vote-ranking-panel">
          <div className="vote-ranking-head">
            <strong>Bảng xếp hạng tạm thời</strong>
            <span>Cập nhật theo lượt bình chọn</span>
          </div>
          {rankingPreview.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="vote-ranking-row"
              onClick={() => onSelectDestination(item)}
            >
              <span>#{index + 1}</span>
              <strong>{item.name}</strong>
              <small>{item.place}</small>
              <em>{item.votes}</em>
            </button>
          ))}
        </div>
      </section>

      {/* Top Breadcrumb Stepper */}
      <div className="container stepper-container">
        <div className="vote-stepper-row">
          {([
            { num: 1, title: "01. Thông tin người bình chọn" },
            { num: 2, title: "02. Thể lệ & hướng dẫn" },
            { num: 3, title: "03. Chọn điểm đến" },
            { num: 4, title: "04. Kết quả ghi nhận" },
          ] satisfies { num: VoteStep; title: string }[]).map((item) => (
            <div
              key={item.num}
              className={`stepper-node ${step === item.num ? "active" : ""} ${
                step > item.num ? "completed" : ""
              }`}
              onClick={() => {
                if (item.num < step && item.num !== 4) setStep(item.num)
              }}
              style={{ cursor: item.num < step ? "pointer" : "default" }}
            >
              <div className="node-circle">
                {step > item.num ? <Icon name="check" size={14} /> : item.num}
              </div>
              <span className="node-text">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          BƯỚC 1: THÔNG TIN CỬ TRI
         ========================================================================= */}
      {step === 1 && (
        <section className="container step-layout-center">
          <div className="step-card-box">
            <div className="step-badge-tag">BƯỚC 01 / 04</div>
            <h2>Thông tin người bình chọn</h2>
            <p className="step-desc">
              Vui lòng nhập số điện thoại để hệ thống xác nhận 01 lượt bình chọn
              hợp lệ trong ngày. Quy trình hoàn toàn bảo mật và không gửi mã OTP
              phức tạp.
            </p>

            <form onSubmit={handleProceedToStep2} className="step-form">
              <div className="form-group-v2">
                <label>Số điện thoại di động *</label>
                <div className="input-with-icon">
                  <span>+84</span>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="Nhập số điện thoại (Ví dụ: 0987654321)"
                  />
                </div>
                <small>
                  Dùng để đối soát hạn mức bình chọn 01 lần/ngày/thuê bao.
                </small>
              </div>

              <div className="form-group-v2">
                <label>Họ và tên hoặc Lời nhắn (Tùy chọn)</label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A • Gửi niềm tự hào đến đất nước"
                />
              </div>

              <div className="privacy-badge">
                <Icon name="lock" size={16} />
                <span>
                  Thông tin được mã hóa bảo vệ danh tính, cam kết không dùng cho
                  mục đích thương mại.
                </span>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                Tiếp tục sang Hướng dẫn & Thể lệ <Icon name="arrow" size={18} />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* =========================================================================
          BƯỚC 2: HƯỚNG DẪN & CHỌN VÙNG MIỀN
         ========================================================================= */}
      {step === 2 && (
        <section className="container step-layout-center">
          <div className="step-card-box wide-box">
            <div className="step-badge-tag">BƯỚC 02 / 04</div>
            <h2>Hướng dẫn & Thể lệ bình chọn</h2>
            <p className="step-desc">
              Hội thi mở cổng bình chọn cho 68 hồ sơ điểm đến. Người tham gia
              xem thông tin, chọn điểm đến yêu thích và nhận mã biên nhận sau
              khi hệ thống ghi nhận lượt bình chọn.
            </p>

            <div className="rules-grid">
              <div className="rule-item">
                <div className="rule-icon">
                  <Icon name="shield" size={22} />
                </div>
                <h4>Minh bạch 01 lượt/ngày</h4>
                <p>
                  Mỗi số điện thoại được bình chọn 01 lần mỗi ngày cho 01 điểm
                  đến yêu thích.
                </p>
              </div>
              <div className="rule-item">
                <div className="rule-icon">
                  <Icon name="map" size={22} />
                </div>
                <h4>Xem hình ảnh trực tiếp</h4>
                <p>
                  Ở Bước 3, bạn chỉ cần rê chuột vào bất kỳ tỉnh nào trên bản đồ
                  để xem hình ảnh và bình chọn ngay.
                </p>
              </div>
              <div className="rule-item">
                <div className="rule-icon">
                  <Icon name="spark" size={22} />
                </div>
                <h4>Cấp mã biên nhận hợp lệ</h4>
                <p>
                  Sau khi bình chọn, bạn sẽ nhận được mã biên nhận điện tử để
                  tra cứu trên hệ thống.
                </p>
              </div>
            </div>

            <div className="select-region-box">
              <label className="field-label-bold">
                Chọn vùng miền bạn muốn ưu tiên xem trước trên bản đồ:
              </label>
              <div className="region-buttons-row">
                {([
                  { id: "all", label: "Toàn quốc (63 tỉnh thành & hải đảo)" },
                  { id: "Bắc", label: "Miền Bắc (25 tỉnh)" },
                  { id: "Trung", label: "Miền Trung" },
                  { id: "Tây Nguyên", label: "Tây Nguyên" },
                  { id: "Nam", label: "Miền Nam (19 tỉnh)" },
                ] satisfies { id: RegionFilter; label: string }[]).map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    className={`region-choice-btn ${
                      regionFilter === reg.id ? "active" : ""
                    }`}
                    onClick={() => setRegionFilter(reg.id)}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="step-button-actions">
              <button
                type="button"
                className="btn btn-primary btn-large-cta"
                onClick={handleProceedToStep3}
              >
                  Mở bản đồ chọn điểm đến <Icon name="arrow" size={18} />
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStep(1)}
              >
                Quay lại Bước 1
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          BƯỚC 3: FULL SCREEN BẢN ĐỒ VIỆT NAM 2D (HOVER HIỆN HÌNH ẢNH TRỰC TIẾP, BỎ CỘT BÊN)
         ========================================================================= */}
      {step === 3 && (
        <section className="step-3-fullscreen-wrapper">
          {/* Top Bar with Voter Info & Quick Filters */}
          <div className="step-3-topbar">
            <div className="step-3-container step-3-topbar-inner">
              <div className="topbar-left">
                <span className="live-dot-badge">
                  <i /> BƯỚC 03 / 04: CHỌN ĐIỂM ĐẾN BÌNH CHỌN
                </span>
                <h2>Bản đồ điểm đến theo tỉnh thành</h2>
              </div>

              {/* Voter Info Tag (From Step 1) */}
              <div className="topbar-voter-badge">
                <span className="voter-icon-circle">
                  <Icon name="user" size={14} />
                </span>
                <div className="voter-text">
                  <small>Cử tri bình chọn</small>
                  <strong>
                    {voterName ? `${voterName}` : "Cử tri toàn quốc"} (
                    {phone || "0788621767"})
                  </strong>
                </div>
                <button
                  type="button"
                  className="voter-edit-link"
                  onClick={() => setStep(1)}
                  title="Thay đổi thông tin cử tri"
                >
                  Sửa
                </button>
              </div>

              {/* Quick Search */}
              <div className="topbar-search">
                <Icon name="search" size={15} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm nhanh tỉnh thành (Hà Nội, Lạng Sơn, Cần Thơ...)"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-icon-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    <Icon name="x" size={13} />
                  </button>
                )}
              </div>

              {/* Region Filter Chips */}
              <div className="topbar-regions">
                {([
                  { id: "all", label: "Toàn quốc" },
                  { id: "Bắc", label: "Bắc Bộ" },
                  { id: "Trung", label: "Trung Bộ" },
                  { id: "Tây Nguyên", label: "Tây Nguyên" },
                  { id: "Nam", label: "Nam Bộ" },
                ] satisfies { id: RegionFilter; label: string }[]).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`topbar-chip ${
                      regionFilter === r.id ? "active" : ""
                    }`}
                    onClick={() => setRegionFilter(r.id)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Width Map Display (No Side Column!) */}
          <div className="step-3-container step-3-fullwidth-map">
            <VietnamSVGMap
              selectedProvinceName={selectedProvinceName}
              onSelectProvince={handleSelectProvinceFromMap}
              onDirectVote={handleDirectVote}
              activeRegion={regionFilter}
              searchQuery={searchQuery}
              voterPhone={phone}
              voterName={voterName}
            />
          </div>

          {/* Bottom Fast Navigation / Mini Leaderboard */}
          <div className="step-3-container step-3-bottom-strip">
            <div className="bottom-strip-hint">
              <Icon name="spark" size={14} />
              <span>
                Rê chuột vào bất kỳ tỉnh thành nào trên bản đồ để xem{" "}
                <strong>hình ảnh danh thắng</strong> và bấm{" "}
                <strong>Bình chọn ngay</strong>.
              </span>
            </div>
            <div className="bottom-top-ranking-pills">
              <span className="pills-title">TOP DẪN ĐẦU:</span>
              {destinations.slice(0, 4).map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  className="mini-rank-pill"
                  onClick={() => {
                    onSelectDestination(d)
                    setSelectedProvinceName(d.place)
                  }}
                >
                  <small>0{i + 1}</small>
                  <strong>{d.name}</strong>
                  <span>{d.votes}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          BƯỚC 4: HOÀN TẤT & CẤP MÃ BIÊN NHẬN
         ========================================================================= */}
      {step === 4 && (
        <section className="container step-layout-center">
          <div className="step-card-box success-card">
            <div className="success-round-mark">
              <Icon name="check" size={40} />
            </div>
            <div className="step-badge-tag success-badge">
              BÌNH CHỌN THÀNH CÔNG
            </div>
            <h2>Cảm ơn bạn đã gửi trọn niềm tự hào!</h2>
            <p className="step-desc">
              Lá phiếu bình chọn cho <strong>{selectedDestination.name}</strong>{" "}
              đã được ghi nhận vào hệ thống bình chọn toàn quốc 2025.
            </p>

            <div className="official-receipt-box">
              <span className="receipt-tag-title">
                MÃ BIÊN NHẬN ĐIỆN TỬ HỢP LỆ
              </span>
              <strong className="receipt-code-value">{receiptCode}</strong>
              <button
                type="button"
                className="btn-copy-receipt"
                onClick={() => onCopyReceipt(receiptCode)}
              >
                <Icon name="copy" size={15} /> Sao chép mã biên nhận
              </button>
              <div className="receipt-timestamp">
                <Icon name="clock" size={13} />{" "}
                {new Date().toLocaleTimeString("vi-VN")} • Ngày{" "}
                {new Date().toLocaleDateString("vi-VN")}
              </div>
            </div>

            <div className="post-completion-buttons">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(3)}
              >
                <Icon name="map" size={16} /> Quay lại bản đồ bình chọn thêm
                điểm đến
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => go("home")}
              >
                Trở về trang chủ
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
