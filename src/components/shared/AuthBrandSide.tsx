import React from "react"
import Icon from "@/components/shared/Icon"

export default function AuthBrandSide() {
  return (
    <div className="auth-brand-side">
      <div className="auth-brand-side-content">
        <div className="auth-brand-logo-row">
          <img
            src="/logo.png"
            alt="Logo Điểm Đến Du Lịch Nông Thôn Việt Nam"
            className="auth-brand-logo-img"
          />
          <div className="auth-brand-titles">
            <strong>ĐIỂM ĐẾN NÔNG THÔN</strong>
            <small>VIỆT NAM TỐT NHẤT 2026</small>
          </div>
        </div>

        <h2 className="auth-brand-headline">
          Cùng chọn ra điểm đến nông thôn đẹp nhất Việt Nam
        </h2>

        <div className="auth-benefits-list">
          <div className="auth-benefit-item">
            <div className="benefit-icon-badge">
              <Icon name="spark" size={17} />
            </div>
            <div className="benefit-text">
              <strong>Mỗi ngày 3 lượt bình chọn</strong>
              <p>Mỗi tài khoản được cấp 3 phiếu miễn phí hằng ngày để tôn vinh làng quê bạn yêu.</p>
            </div>
          </div>

          <div className="auth-benefit-item">
            <div className="benefit-icon-badge">
              <Icon name="check" size={17} />
            </div>
            <div className="benefit-text">
              <strong>Nhìn thấy cây điểm đến lớn lên theo từng phiếu</strong>
              <p>Mô hình tăng trưởng số hóa sinh động trực tiếp trên bản đồ 3D tương tác.</p>
            </div>
          </div>

          <div className="auth-benefit-item">
            <div className="benefit-icon-badge">
              <Icon name="shield" size={17} />
            </div>
            <div className="benefit-text">
              <strong>Minh bạch kết quả theo thời gian thực</strong>
              <p>Hệ thống ghi nhận công khai, xác thực tài khoản chặt chẽ, chống gian lận.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-brand-footer">
        <span>© 2026 Cổng Bình Chọn Du Lịch Nông Thôn Quốc Gia. Bảo lưu mọi quyền.</span>
      </div>
    </div>
  )
}
